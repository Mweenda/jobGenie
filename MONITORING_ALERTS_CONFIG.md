# 📊 Monitoring & Alerts Configuration - JobGenie

## 🎯 Key Performance Indicators (KPIs)

### Technical Metrics
| Metric | Target | Warning | Critical | Window |
|--------|--------|---------|----------|---------|
| API Error Rate | < 0.5% | > 1% | > 2% | 5 minutes |
| P95 Response Time | < 800ms | > 1.5s | > 3s | 5 minutes |
| P99 Response Time | < 2s | > 5s | > 10s | 5 minutes |
| Availability | > 99.9% | < 99.5% | < 99% | 15 minutes |
| Memory Usage | < 80% | > 85% | > 95% | 5 minutes |
| CPU Usage | < 70% | > 80% | > 90% | 5 minutes |

### Business Metrics
| Metric | Target | Warning | Critical | Window |
|--------|--------|---------|----------|---------|
| User Conversion Rate | > 15% | < 12% | < 8% | 1 hour |
| Job Application Success | > 95% | < 90% | < 85% | 15 minutes |
| Search Response Time | < 500ms | > 1s | > 2s | 5 minutes |
| Auth Success Rate | > 98% | < 95% | < 90% | 5 minutes |

### Cost & Resource Metrics
| Metric | Target | Warning | Critical | Window |
|--------|--------|---------|----------|---------|
| Daily LLM Spend | < $50 | > $75 | > $100 | 1 hour |
| Firebase Usage | < 80% quota | > 90% quota | > 95% quota | 1 hour |
| Stripe Transaction Fees | < 3% | > 4% | > 5% | 1 day |
| CDN Bandwidth | < 100GB/day | > 150GB/day | > 200GB/day | 1 hour |

---

## 🚨 Alert Configuration Templates

### Grafana Alert Rules

```yaml
# API Error Rate Alert
- alert: HighAPIErrorRate
  expr: (sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100 > 1
  for: 2m
  labels:
    severity: warning
    service: jobgenie-api
  annotations:
    summary: "High API error rate detected"
    description: "API error rate is {{ $value }}% over the last 5 minutes"
    runbook_url: "https://github.com/jobgenie/runbooks/api-errors"

# Response Time Alert  
- alert: HighResponseTime
  expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1.5
  for: 5m
  labels:
    severity: warning
    service: jobgenie-api
  annotations:
    summary: "High API response time"
    description: "95th percentile response time is {{ $value }}s"

# LLM Cost Alert
- alert: HighLLMSpend
  expr: increase(llm_cost_total[1h]) > 25
  for: 0m
  labels:
    severity: warning
    service: jobgenie-ai
  annotations:
    summary: "LLM spending spike detected"
    description: "LLM costs increased by ${{ $value }} in the last hour"
```

### Datadog Monitors

```json
{
  "name": "JobGenie - API Error Rate",
  "type": "metric alert",
  "query": "avg(last_5m):sum:nginx.requests.per_second{status:error} by {host} / sum:nginx.requests.per_second{*} by {host} > 0.01",
  "message": "@slack-alerts @oncall-engineer API error rate is above 1% for JobGenie",
  "tags": ["service:jobgenie", "env:production"],
  "options": {
    "thresholds": {
      "warning": 0.005,
      "critical": 0.02
    },
    "notify_no_data": true,
    "no_data_timeframe": 10
  }
}
```

### New Relic Alerts

```json
{
  "name": "JobGenie Response Time",
  "type": "NRQL",
  "nrql": {
    "query": "SELECT percentile(duration, 95) FROM Transaction WHERE appName = 'JobGenie' FACET name"
  },
  "critical_threshold": {
    "value": 1.5,
    "time_function": "all",
    "duration_minutes": 5
  },
  "warning_threshold": {
    "value": 1.0,
    "time_function": "all", 
    "duration_minutes": 5
  }
}
```

---

## 📱 Notification Channels

### Slack Integration
```bash
# Webhook URL for alerts
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"

# Channel mapping
- Critical alerts → #incidents
- Warning alerts → #monitoring  
- Info alerts → #engineering-updates
```

### PagerDuty Escalation
```yaml
escalation_policy:
  - level: 1
    targets: ["@oncall-engineer"]
    escalation_delay_minutes: 5
  - level: 2  
    targets: ["@senior-dev", "@devops-lead"]
    escalation_delay_minutes: 15
  - level: 3
    targets: ["@engineering-manager"]
    escalation_delay_minutes: 30
```

### Email Notifications
- **Critical**: Immediate email to oncall + management
- **Warning**: Email digest every 15 minutes
- **Info**: Daily summary email

---

## 📈 Dashboard Configuration

### Executive Dashboard
```json
{
  "dashboard": "JobGenie - Executive View",
  "panels": [
    {
      "title": "Daily Active Users",
      "type": "stat",
      "targets": ["SELECT count(DISTINCT user_id) FROM events WHERE time >= now() - 24h"]
    },
    {
      "title": "Revenue (24h)",
      "type": "stat", 
      "targets": ["SELECT sum(amount) FROM payments WHERE created >= now() - 24h"]
    },
    {
      "title": "Application Success Rate",
      "type": "gauge",
      "targets": ["SELECT (successful_applications / total_applications) * 100"]
    },
    {
      "title": "System Health",
      "type": "status",
      "targets": ["SELECT avg(up) FROM health_checks GROUP BY service"]
    }
  ]
}
```

### Engineering Dashboard
```json
{
  "dashboard": "JobGenie - Engineering Metrics",
  "panels": [
    {
      "title": "API Response Times",
      "type": "timeseries",
      "targets": [
        "SELECT percentile(response_time, 50) as p50, percentile(response_time, 95) as p95, percentile(response_time, 99) as p99 FROM api_requests"
      ]
    },
    {
      "title": "Error Rate by Endpoint", 
      "type": "table",
      "targets": ["SELECT endpoint, (errors/requests)*100 as error_rate FROM api_stats ORDER BY error_rate DESC"]
    },
    {
      "title": "Database Performance",
      "type": "timeseries",
      "targets": ["SELECT avg(query_time) FROM db_queries GROUP BY query_type"]
    },
    {
      "title": "Cache Hit Ratio",
      "type": "gauge", 
      "targets": ["SELECT (cache_hits / (cache_hits + cache_misses)) * 100"]
    }
  ]
}
```

### Business Intelligence Dashboard
```json
{
  "dashboard": "JobGenie - Business Metrics",
  "panels": [
    {
      "title": "Job Applications Over Time",
      "type": "timeseries",
      "targets": ["SELECT count(*) FROM applications GROUP BY date_trunc('hour', created_at)"]
    },
    {
      "title": "User Funnel Conversion",
      "type": "funnel",
      "targets": [
        "SELECT 'Signups' as stage, count(*) FROM users WHERE created_at >= now() - 7d",
        "SELECT 'First Search' as stage, count(DISTINCT user_id) FROM searches WHERE created_at >= now() - 7d", 
        "SELECT 'First Application' as stage, count(DISTINCT user_id) FROM applications WHERE created_at >= now() - 7d"
      ]
    },
    {
      "title": "Top Job Categories",
      "type": "pie",
      "targets": ["SELECT category, count(*) FROM job_views GROUP BY category ORDER BY count DESC LIMIT 10"]
    }
  ]
}
```

---

## 🔧 Health Check Endpoints

### Application Health
```typescript
// GET /health
{
  "status": "healthy",
  "timestamp": "2025-01-19T10:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy", 
    "firebase": "healthy",
    "stripe": "healthy",
    "gemini": "healthy"
  },
  "metrics": {
    "uptime": 86400,
    "memory_usage": "45%",
    "cpu_usage": "23%"
  }
}
```

### Detailed Service Health
```typescript
// GET /health/detailed
{
  "database": {
    "status": "healthy",
    "response_time": 45,
    "connections": {
      "active": 12,
      "max": 100
    }
  },
  "external_apis": {
    "firebase": {
      "status": "healthy",
      "last_check": "2025-01-19T10:00:00Z",
      "quota_usage": "23%"
    },
    "stripe": {
      "status": "healthy", 
      "last_transaction": "2025-01-19T09:45:00Z"
    },
    "gemini": {
      "status": "healthy",
      "tokens_used_today": 1250,
      "daily_limit": 10000
    }
  }
}
```

---

## 🎯 SLA Definitions

### Service Level Objectives (SLOs)
- **Availability**: 99.9% uptime (43 minutes downtime/month)
- **Performance**: 95% of requests < 1s response time
- **Reliability**: 99.5% of API calls succeed
- **Data Durability**: 99.999% (Firestore handles this)

### Service Level Indicators (SLIs)
- **Availability**: `(successful_requests / total_requests) * 100`
- **Latency**: `percentile(response_time, 95)`
- **Error Rate**: `(error_responses / total_responses) * 100`
- **Throughput**: `requests_per_second`

### Error Budget
- **Monthly Error Budget**: 0.1% (allows for 43 minutes downtime)
- **Burn Rate Alerts**: 
  - Fast burn (2x rate): Alert in 1 hour
  - Slow burn (1.5x rate): Alert in 6 hours

---

## 🔄 Incident Response Playbook

### Severity Levels
| Level | Description | Response Time | Escalation |
|-------|-------------|---------------|------------|
| **P0 - Critical** | Service down, data loss | 5 minutes | Immediate |
| **P1 - High** | Major feature broken | 15 minutes | 1 hour |
| **P2 - Medium** | Minor feature issues | 1 hour | 4 hours |
| **P3 - Low** | Enhancement requests | 24 hours | None |

### Response Procedures
1. **Acknowledge**: Respond to alert within SLA
2. **Assess**: Determine severity and impact
3. **Mitigate**: Apply immediate fixes or rollback
4. **Communicate**: Update stakeholders via status page
5. **Resolve**: Implement permanent solution
6. **Review**: Conduct post-incident review

---

## 📞 Contact Information

### On-Call Rotation
- **Primary**: @oncall-engineer (Slack: @oncall)
- **Secondary**: @senior-dev (Phone: +1-XXX-XXX-XXXX)
- **Escalation**: @engineering-manager

### External Support
- **Firebase**: firebase-support@google.com
- **Stripe**: https://support.stripe.com
- **Gemini AI**: https://ai.google.dev/support

---

*Last Updated: 2025-01-19*  
*Review Schedule: Monthly*
