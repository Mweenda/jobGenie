# 🚀 Production Release Runbook - JobGenie

## 📋 Preflight Checklist (Before Release)

### Environment Variables Verification
```bash
# Staging/Production must have:
✅ VITE_FIREBASE_API_KEY
✅ VITE_FIREBASE_AUTH_DOMAIN  
✅ VITE_FIREBASE_PROJECT_ID
✅ VITE_FIREBASE_STORAGE_BUCKET
✅ VITE_FIREBASE_MESSAGING_SENDER_ID
✅ VITE_FIREBASE_APP_ID
✅ VITE_GEMINI_API_KEY
✅ STRIPE_SECRET_KEY
✅ STRIPE_WEBHOOK_SECRET
```

### Pre-Deploy Verification
1. **CI Status**: All tests pass in `dev` branch
2. **Database Backup**: Firestore export completed
3. **API Quotas**: LLM spend limits configured
4. **Monitoring**: Dashboards & alerts enabled
5. **Feature Flags**: Rollback switches ready

---

## 🔧 Deploy Steps (Staging)

```bash
# 1. Create release branch
git checkout dev
git pull origin dev
git checkout -b release/typescript-fixes-v1.0
git push origin release/typescript-fixes-v1.0

# 2. Merge to staging
git checkout staging
git merge release/typescript-fixes-v1.0
git push origin staging

# 3. Trigger staging deployment
# (depends on your deployment provider)

# 4. Run smoke tests
bash tools/smoke-test.sh https://staging.jobgenie.app https://api.staging.jobgenie.app
```

---

## 🎯 Canary Rollout Strategy (Production)

### Phase 1: 1% Traffic (30-60 minutes)
- **Deploy**: Feature flag or load balancer canary
- **Monitor**: 
  - Error rate < 1% (5-minute window)
  - P95 latency < 1.5s
  - LLM spend < 120% of baseline
- **Gate**: Manual approval after metrics validation

### Phase 2: 1% → 10% (24 hours)
- **Monitor**: Same thresholds + user feedback
- **Validation**: Core user flows working

### Phase 3: 10% → 50% (24-48 hours) 
- **Monitor**: Extended monitoring period
- **Validation**: Business metrics stable

### Phase 4: 50% → 100% (Final rollout)
- **Monitor**: Full production load
- **Celebration**: 🎉 Release complete!

---

## ⚡ Rollback Procedures

### Option 1: Feature Flag (Instant - Recommended)
```bash
# Disable smart apply features
curl -X POST -H "Authorization: Bearer $FEATURE_FLAG_KEY" \
  -d '{"flag":"typescript_fixes","enabled":false}' \
  https://api.featureflags.io/toggle
```

### Option 2: Container Rollback
```bash
# Kubernetes
kubectl rollout undo deployment/jobgenie-frontend -n production
kubectl rollout undo deployment/jobgenie-backend -n production

# Verify rollback
kubectl get pods -n production
```

### Option 3: Git Revert + Redeploy
```bash
# Identify merge commit
git log --oneline -10

# Revert the merge
git revert -m 1 <merge-commit-sha>
git push origin main

# Redeploy via CI/CD trigger
```

---

## ✅ Post-Deploy Verification

### Automated Smoke Tests
```bash
bash tools/smoke-test.sh https://app.jobgenie.com https://api.jobgenie.com
```

### Manual User Flow Validation
1. **Authentication**: Login → Header shows username + dropdown
2. **Job Search**: Search → Filter → Save → Apply workflow
3. **Messages**: Send/receive messages in chat interface  
4. **Settings**: Profile update → Notifications → Account management
5. **AI Features**: Cover letter generation → Interview prep

### Monitoring Dashboard Checks
- **Error Rate**: < 1% across all endpoints
- **Latency**: P95 < 1.5s, P99 < 3s
- **LLM Costs**: Within budget thresholds
- **Cache Hit Ratio**: > 70%
- **User Satisfaction**: No spike in support tickets

---

## 🚨 Alert Thresholds & Response

| Alert | Threshold | Response Time | Action |
|-------|-----------|---------------|---------|
| API Error Rate | > 1% (5min) | Immediate | Check traces, consider rollback |
| P95 Latency | > 1.5s (5min) | 5 minutes | Scale up or rollback |
| LLM Spend | > +20% daily | 15 minutes | Check usage, disable if needed |
| Auth Failures | > 10% (2min) | Immediate | Check Firebase, rollback |
| Cache Miss Rate | > 50% (10min) | 10 minutes | Check Redis, restart if needed |

---

## 📞 Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| **On-call Engineer** | @oncall-dev | Immediate |
| **Product Owner** | @product-lead | 30 minutes |
| **DevOps Lead** | @devops-team | Immediate |
| **Firebase Admin** | @firebase-admin | 15 minutes |
| **Stripe Support** | support@stripe.com | Via dashboard |

---

## 📊 Success Metrics

### Technical KPIs
- ✅ Zero TypeScript compilation errors
- ✅ Build time < 3 minutes  
- ✅ Test coverage > 80%
- ✅ Bundle size < 2MB gzipped

### Business KPIs  
- ✅ User engagement maintained
- ✅ Conversion rate stable
- ✅ Support ticket volume normal
- ✅ Core user flows unimpacted

---

## 🎯 Post-Release Actions

1. **Monitor for 48 hours** - Extended observation period
2. **Collect user feedback** - Support channels + analytics
3. **Document lessons learned** - Retrospective notes
4. **Update runbook** - Based on deployment experience
5. **Plan next iteration** - Feature roadmap updates

---

*Last updated: 2025-01-19*  
*Next review: After each major release*