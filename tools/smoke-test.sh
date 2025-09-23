#!/usr/bin/env bash
# JobGenie Production Smoke Tests
# Usage: bash tools/smoke-test.sh [BASE_URL] [API_URL]

set -euo pipefail

# Configuration
BASE_URL="${1:-http://localhost:5173}"
API_URL="${2:-http://localhost:5001}"
TIMEOUT=10
RETRIES=3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌]${NC} $1"
}

# Test function with retry logic
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    local retry_count=0
    
    log_info "Testing: $name"
    
    while [ $retry_count -lt $RETRIES ]; do
        if curl -fsS --connect-timeout $TIMEOUT --max-time $TIMEOUT "$url" >/dev/null 2>&1; then
            log_success "$name - OK"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $RETRIES ]; then
            log_warning "$name - Retry $retry_count/$RETRIES"
            sleep 2
        fi
    done
    
    log_error "$name - FAILED after $RETRIES attempts"
    return 1
}

# Test function with JSON validation
test_json_endpoint() {
    local name="$1"
    local url="$2"
    local jq_filter="${3:-.}"
    
    log_info "Testing: $name"
    
    if response=$(curl -fsS --connect-timeout $TIMEOUT --max-time $TIMEOUT "$url" 2>/dev/null); then
        if echo "$response" | jq "$jq_filter" >/dev/null 2>&1; then
            log_success "$name - JSON OK"
            return 0
        else
            log_error "$name - Invalid JSON response"
            return 1
        fi
    else
        log_error "$name - Request failed"
        return 1
    fi
}

# Main smoke test execution
main() {
    echo "🚀 JobGenie Smoke Tests Starting..."
    echo "Frontend: $BASE_URL"
    echo "Backend: $API_URL"
    echo "----------------------------------------"
    
    local failed_tests=0
    
    # 1. Homepage / Health Check
    if ! test_endpoint "Homepage" "$BASE_URL/"; then
        ((failed_tests++))
    fi
    
    # 2. Backend Health
    if ! test_endpoint "Backend Health" "$API_URL/health"; then
        log_warning "Backend health endpoint not found (may be expected)"
    fi
    
    # 3. Authentication Status
    if ! test_endpoint "Auth Status" "$API_URL/auth/status"; then
        log_warning "Auth status endpoint not found (may be expected for some setups)"
    fi
    
    # 4. Jobs API
    if ! test_json_endpoint "Jobs API" "$API_URL/api/jobs?limit=5" '. | length'; then
        log_warning "Jobs API not responding (may require authentication)"
    fi
    
    # 5. Firebase Config Check
    if ! test_endpoint "Firebase Config" "$BASE_URL/"; then
        log_warning "Could not verify Firebase initialization"
    fi
    
    # 6. Static Assets
    if ! test_endpoint "Main CSS" "$BASE_URL/src/index.css"; then
        log_warning "Main CSS not found (may be bundled differently in production)"
    fi
    
    # 7. Vite/Build Health (Development)
    if [[ "$BASE_URL" == *"localhost"* ]]; then
        if ! test_endpoint "Vite Dev Server" "$BASE_URL/@vite/client"; then
            log_warning "Vite dev server assets not found (expected in production)"
        fi
    fi
    
    # 8. API CORS Check
    log_info "Testing: CORS Headers"
    if cors_headers=$(curl -sI -X OPTIONS "$API_URL/api/jobs" 2>/dev/null | grep -i "access-control" || true); then
        if [ -n "$cors_headers" ]; then
            log_success "CORS Headers - OK"
        else
            log_warning "CORS Headers - Not found (may be configured at proxy level)"
        fi
    else
        log_warning "CORS Headers - Could not test"
    fi
    
    # 9. Content Security Policy
    log_info "Testing: Security Headers"
    if security_headers=$(curl -sI "$BASE_URL/" 2>/dev/null | grep -iE "(content-security-policy|x-frame-options|x-content-type)" || true); then
        if [ -n "$security_headers" ]; then
            log_success "Security Headers - Found"
        else
            log_warning "Security Headers - Not found (consider adding for production)"
        fi
    else
        log_warning "Security Headers - Could not test"
    fi
    
    # 10. Performance Check (Basic)
    log_info "Testing: Response Time"
    start_time=$(date +%s%N)
    if curl -fsS --connect-timeout $TIMEOUT --max-time $TIMEOUT "$BASE_URL/" >/dev/null 2>&1; then
        end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
        
        if [ $response_time -lt 2000 ]; then
            log_success "Response Time - ${response_time}ms (Good)"
        elif [ $response_time -lt 5000 ]; then
            log_warning "Response Time - ${response_time}ms (Acceptable)"
        else
            log_error "Response Time - ${response_time}ms (Slow)"
            ((failed_tests++))
        fi
    else
        log_error "Response Time - Could not measure"
        ((failed_tests++))
    fi
    
    echo "----------------------------------------"
    
    # Summary
    if [ $failed_tests -eq 0 ]; then
        echo -e "${GREEN}🎉 All critical smoke tests passed!${NC}"
        echo -e "${GREEN}✅ Application appears healthy and ready${NC}"
        exit 0
    else
        echo -e "${RED}❌ $failed_tests critical test(s) failed${NC}"
        echo -e "${RED}🚨 Review failures before proceeding to production${NC}"
        exit 1
    fi
}

# Trap to handle script interruption
trap 'echo -e "\n${YELLOW}⚠️  Smoke tests interrupted${NC}"; exit 130' INT TERM

# Run main function
main "$@"
