# 📊 JobGenie Monitoring Dashboard Configuration

## 🎯 **OVERVIEW**

This document provides ready-to-use JSON configurations for monitoring JobGenie's AI features in production. Includes dashboards for Grafana, Datadog, and custom monitoring solutions.

**Target Metrics:**
- API Performance & Errors
- AI/LLM Usage & Costs  
- User Engagement & Conversion
- Infrastructure Health

---

## 📈 **GRAFANA DASHBOARD CONFIG**

### **Main Dashboard JSON**
```json
{
  "dashboard": {
    "id": null,
    "title": "JobGenie AI Features - Production",
    "tags": ["jobgenie", "ai", "production"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "API Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"jobgenie\", status=~\"5..\"}[5m]) / rate(http_requests_total{service=\"jobgenie\"}[5m]) * 100",
            "legendFormat": "Error Rate %"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 1},
                {"color": "red", "value": 5}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 0, "y": 0}
      },
      {
        "id": 2,
        "title": "Response Time (P95)",
        "type": "stat",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\"jobgenie\"}[5m])) * 1000",
            "legendFormat": "P95 Latency (ms)"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "ms",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 1500},
                {"color": "red", "value": 5000}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 6, "y": 0}
      },
      {
        "id": 3,
        "title": "AI Token Usage (Daily)",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(ai_tokens_used_total{service=\"jobgenie\"}[24h])",
            "legendFormat": "Tokens Used"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "short",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 100000},
                {"color": "red", "value": 500000}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 12, "y": 0}
      },
      {
        "id": 4,
        "title": "Daily AI Spend",
        "type": "stat",
        "targets": [
          {
            "expr": "increase(ai_cost_total{service=\"jobgenie\"}[24h])",
            "legendFormat": "Cost ($)"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "currencyUSD",
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 100},
                {"color": "red", "value": 500}
              ]
            }
          }
        },
        "gridPos": {"h": 8, "w": 6, "x": 18, "y": 0}
      },
      {
        "id": 5,
        "title": "API Requests per Second",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{service=\"jobgenie\"}[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec",
            "min": 0
          }
        ],
        "gridPos": {"h": 9, "w": 12, "x": 0, "y": 8}
      },
      {
        "id": 6,
        "title": "Cache Hit Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(cache_hits_total{service=\"jobgenie\"}[5m]) / (rate(cache_hits_total{service=\"jobgenie\"}[5m]) + rate(cache_misses_total{service=\"jobgenie\"}[5m])) * 100",
            "legendFormat": "Cache Hit Rate %"
          }
        ],
        "yAxes": [
          {
            "label": "Percentage",
            "min": 0,
            "max": 100
          }
        ],
        "gridPos": {"h": 9, "w": 12, "x": 12, "y": 8}
      },
      {
        "id": 7,
        "title": "AI Feature Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(ai_feature_usage_total{service=\"jobgenie\"}[5m])",
            "legendFormat": "{{feature}}"
          }
        ],
        "yAxes": [
          {
            "label": "Usage/sec",
            "min": 0
          }
        ],
        "gridPos": {"h": 9, "w": 24, "x": 0, "y": 17}
      }
    ]
  }
}
```

### **Alert Rules Configuration**
```json
{
  "groups": [
    {
      "name": "jobgenie_ai_alerts",
      "rules": [
        {
          "alert": "HighErrorRate",
          "expr": "rate(http_requests_total{service=\"jobgenie\", status=~\"5..\"}[5m]) / rate(http_requests_total{service=\"jobgenie\"}[5m]) > 0.05",
          "for": "2m",
          "labels": {
            "severity": "critical"
          },
          "annotations": {
            "summary": "High error rate detected",
            "description": "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
          }
        },
        {
          "alert": "HighLatency",
          "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service=\"jobgenie\"}[5m])) > 10",
          "for": "5m",
          "labels": {
            "severity": "warning"
          },
          "annotations": {
            "summary": "High latency detected",
            "description": "P95 latency is {{ $value }}s for the last 5 minutes"
          }
        },
        {
          "alert": "HighAICost",
          "expr": "increase(ai_cost_total{service=\"jobgenie\"}[24h]) > 500",
          "for": "1m",
          "labels": {
            "severity": "warning"
          },
          "annotations": {
            "summary": "High AI spending detected",
            "description": "Daily AI cost is ${{ $value }} (over $500 limit)"
          }
        },
        {
          "alert": "LowCacheHitRate",
          "expr": "rate(cache_hits_total{service=\"jobgenie\"}[10m]) / (rate(cache_hits_total{service=\"jobgenie\"}[10m]) + rate(cache_misses_total{service=\"jobgenie\"}[10m])) < 0.5",
          "for": "10m",
          "labels": {
            "severity": "warning"
          },
          "annotations": {
            "summary": "Low cache hit rate",
            "description": "Cache hit rate is {{ $value | humanizePercentage }} (below 50%)"
          }
        }
      ]
    }
  ]
}
```

---

## 📊 **DATADOG DASHBOARD CONFIG**

### **Dashboard JSON**
```json
{
  "title": "JobGenie AI Features - Production",
  "description": "Monitoring dashboard for JobGenie AI features including performance, costs, and user engagement",
  "widgets": [
    {
      "id": 1,
      "definition": {
        "title": "API Error Rate",
        "type": "query_value",
        "requests": [
          {
            "q": "avg:jobgenie.api.error_rate{*}",
            "aggregator": "avg"
          }
        ],
        "precision": 2,
        "unit": "%",
        "conditional_formats": [
          {
            "comparator": "<",
            "value": 1,
            "palette": "white_on_green"
          },
          {
            "comparator": ">=",
            "value": 5,
            "palette": "white_on_red"
          }
        ]
      },
      "layout": {"x": 0, "y": 0, "width": 3, "height": 2}
    },
    {
      "id": 2,
      "definition": {
        "title": "P95 Response Time",
        "type": "query_value",
        "requests": [
          {
            "q": "avg:jobgenie.api.response_time.95percentile{*}",
            "aggregator": "avg"
          }
        ],
        "precision": 0,
        "unit": "ms",
        "conditional_formats": [
          {
            "comparator": "<",
            "value": 1500,
            "palette": "white_on_green"
          },
          {
            "comparator": ">=",
            "value": 5000,
            "palette": "white_on_red"
          }
        ]
      },
      "layout": {"x": 3, "y": 0, "width": 3, "height": 2}
    },
    {
      "id": 3,
      "definition": {
        "title": "Daily AI Spend",
        "type": "query_value",
        "requests": [
          {
            "q": "sum:jobgenie.ai.cost{*}.rollup(sum, 86400)",
            "aggregator": "last"
          }
        ],
        "precision": 2,
        "unit": "$",
        "conditional_formats": [
          {
            "comparator": "<",
            "value": 100,
            "palette": "white_on_green"
          },
          {
            "comparator": ">=",
            "value": 500,
            "palette": "white_on_red"
          }
        ]
      },
      "layout": {"x": 6, "y": 0, "width": 3, "height": 2}
    },
    {
      "id": 4,
      "definition": {
        "title": "Active Users",
        "type": "query_value",
        "requests": [
          {
            "q": "sum:jobgenie.users.active{*}.rollup(sum, 3600)",
            "aggregator": "last"
          }
        ],
        "precision": 0,
        "conditional_formats": [
          {
            "comparator": ">",
            "value": 100,
            "palette": "white_on_green"
          }
        ]
      },
      "layout": {"x": 9, "y": 0, "width": 3, "height": 2}
    },
    {
      "id": 5,
      "definition": {
        "title": "API Requests",
        "type": "timeseries",
        "requests": [
          {
            "q": "sum:jobgenie.api.requests{*} by {endpoint}",
            "display_type": "line",
            "style": {
              "palette": "dog_classic",
              "line_type": "solid",
              "line_width": "normal"
            }
          }
        ],
        "yaxis": {
          "label": "",
          "scale": "linear",
          "min": "auto",
          "max": "auto"
        }
      },
      "layout": {"x": 0, "y": 2, "width": 6, "height": 3}
    },
    {
      "id": 6,
      "definition": {
        "title": "AI Feature Usage",
        "type": "timeseries",
        "requests": [
          {
            "q": "sum:jobgenie.ai.feature_usage{*} by {feature}",
            "display_type": "bars",
            "style": {
              "palette": "cool",
              "line_type": "solid",
              "line_width": "normal"
            }
          }
        ]
      },
      "layout": {"x": 6, "y": 2, "width": 6, "height": 3}
    },
    {
      "id": 7,
      "definition": {
        "title": "Cache Performance",
        "type": "timeseries",
        "requests": [
          {
            "q": "avg:jobgenie.cache.hit_rate{*}",
            "display_type": "line",
            "style": {
              "palette": "green",
              "line_type": "solid",
              "line_width": "thick"
            }
          }
        ],
        "yaxis": {
          "min": 0,
          "max": 100
        }
      },
      "layout": {"x": 0, "y": 5, "width": 12, "height": 3}
    }
  ],
  "template_variables": [
    {
      "name": "env",
      "prefix": "env",
      "default": "production"
    }
  ],
  "layout_type": "ordered"
}
```

### **Monitor Configurations**
```json
[
  {
    "name": "JobGenie High Error Rate",
    "type": "metric alert",
    "query": "avg(last_5m):avg:jobgenie.api.error_rate{*} > 5",
    "message": "Error rate is above 5% for JobGenie API @slack-alerts",
    "tags": ["service:jobgenie", "alert:critical"],
    "options": {
      "thresholds": {
        "critical": 5,
        "warning": 1
      },
      "notify_no_data": true,
      "no_data_timeframe": 10
    }
  },
  {
    "name": "JobGenie High Latency",
    "type": "metric alert",
    "query": "avg(last_10m):avg:jobgenie.api.response_time.95percentile{*} > 10000",
    "message": "P95 response time is above 10s for JobGenie API @slack-alerts",
    "tags": ["service:jobgenie", "alert:warning"],
    "options": {
      "thresholds": {
        "critical": 10000,
        "warning": 5000
      }
    }
  },
  {
    "name": "JobGenie High AI Spend",
    "type": "metric alert",
    "query": "avg(last_1h):sum:jobgenie.ai.cost{*}.rollup(sum, 86400) > 500",
    "message": "Daily AI spending is above $500 @slack-finance",
    "tags": ["service:jobgenie", "alert:cost"],
    "options": {
      "thresholds": {
        "critical": 500,
        "warning": 200
      }
    }
  }
]
```

---

## 🔍 **CUSTOM METRICS COLLECTION**

### **Application Metrics (Prometheus Format)**
```javascript
// src/lib/metrics.js
import { register, Counter, Histogram, Gauge } from 'prom-client'

// API Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'endpoint', 'status_code', 'service']
})

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'endpoint', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
})

// AI Metrics
export const aiTokensUsed = new Counter({
  name: 'ai_tokens_used_total',
  help: 'Total AI tokens consumed',
  labelNames: ['model', 'feature', 'service']
})

export const aiCostTotal = new Counter({
  name: 'ai_cost_total',
  help: 'Total AI cost in USD',
  labelNames: ['model', 'feature', 'service']
})

export const aiFeatureUsage = new Counter({
  name: 'ai_feature_usage_total',
  help: 'AI feature usage count',
  labelNames: ['feature', 'user_type', 'service']
})

// Cache Metrics
export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Cache hits',
  labelNames: ['cache_type', 'service']
})

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Cache misses',
  labelNames: ['cache_type', 'service']
})

// User Metrics
export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['time_window', 'service']
})

// Usage in API endpoint
export const recordAIUsage = (model, feature, tokensUsed, cost) => {
  aiTokensUsed.inc({ model, feature, service: 'jobgenie' }, tokensUsed)
  aiCostTotal.inc({ model, feature, service: 'jobgenie' }, cost)
  aiFeatureUsage.inc({ feature, user_type: 'authenticated', service: 'jobgenie' })
}
```

### **Metrics Endpoint**
```javascript
// src/api/metrics.js
import { register } from 'prom-client'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const metrics = await register.metrics()
    res.setHeader('Content-Type', register.contentType)
    res.status(200).send(metrics)
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect metrics' })
  }
}
```

---

## 📱 **BUSINESS METRICS DASHBOARD**

### **Executive Dashboard Config**
```json
{
  "dashboard": {
    "title": "JobGenie Business Metrics",
    "panels": [
      {
        "title": "Daily Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "jobgenie_active_users{time_window=\"24h\"}",
            "legendFormat": "DAU"
          }
        ],
        "thresholds": [
          {"color": "red", "value": 0},
          {"color": "yellow", "value": 100},
          {"color": "green", "value": 500}
        ]
      },
      {
        "title": "AI Feature Adoption",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (feature) (increase(ai_feature_usage_total[24h]))",
            "legendFormat": "{{feature}}"
          }
        ]
      },
      {
        "title": "Revenue per AI Feature",
        "type": "table",
        "targets": [
          {
            "expr": "sum by (feature) (increase(ai_cost_total[24h])) * 2",
            "legendFormat": "{{feature}} Revenue"
          }
        ]
      },
      {
        "title": "User Conversion Funnel",
        "type": "bargauge",
        "targets": [
          {
            "expr": "jobgenie_user_registrations",
            "legendFormat": "Registrations"
          },
          {
            "expr": "jobgenie_ai_first_use",
            "legendFormat": "First AI Use"
          },
          {
            "expr": "jobgenie_premium_conversions",
            "legendFormat": "Premium Conversions"
          }
        ]
      }
    ]
  }
}
```

---

## 🚨 **ALERTING CONFIGURATION**

### **Slack Integration**
```yaml
# alertmanager.yml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'slack-alerts'

receivers:
- name: 'slack-alerts'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#jobgenie-alerts'
    title: 'JobGenie Alert: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    send_resolved: true

- name: 'slack-critical'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#jobgenie-critical'
    title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
    text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    send_resolved: true
```

### **PagerDuty Integration**
```yaml
receivers:
- name: 'pagerduty-critical'
  pagerduty_configs:
  - routing_key: 'YOUR_PAGERDUTY_INTEGRATION_KEY'
    description: '{{ .GroupLabels.alertname }}: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
    severity: 'critical'
    links:
    - href: 'https://grafana.yourcompany.com/d/jobgenie'
      text: 'JobGenie Dashboard'
```

---

## 📋 **SETUP INSTRUCTIONS**

### **1. Grafana Setup**
```bash
# Import dashboard
curl -X POST \
  http://grafana.yourcompany.com/api/dashboards/db \
  -H 'Authorization: Bearer YOUR_GRAFANA_TOKEN' \
  -H 'Content-Type: application/json' \
  -d @grafana-dashboard.json

# Import alerts
curl -X POST \
  http://grafana.yourcompany.com/api/provisioning/alert-rules \
  -H 'Authorization: Bearer YOUR_GRAFANA_TOKEN' \
  -H 'Content-Type: application/json' \
  -d @grafana-alerts.json
```

### **2. Datadog Setup**
```bash
# Create dashboard
curl -X POST "https://api.datadoghq.com/api/v1/dashboard" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: YOUR_API_KEY" \
  -H "DD-APPLICATION-KEY: YOUR_APP_KEY" \
  -d @datadog-dashboard.json

# Create monitors
curl -X POST "https://api.datadoghq.com/api/v1/monitor" \
  -H "Content-Type: application/json" \
  -H "DD-API-KEY: YOUR_API_KEY" \
  -H "DD-APPLICATION-KEY: YOUR_APP_KEY" \
  -d @datadog-monitors.json
```

### **3. Application Integration**
```javascript
// Add to your API endpoints
import { recordAIUsage, httpRequestsTotal, httpRequestDuration } from '@/lib/metrics'

// In your AI generation endpoint
const start = Date.now()
try {
  const result = await generateAIContent(prompt, model)
  const duration = (Date.now() - start) / 1000
  
  // Record metrics
  recordAIUsage(model, 'cover_letter', result.tokensUsed, result.cost)
  httpRequestsTotal.inc({ method: 'POST', endpoint: '/api/ai/generate', status_code: '200', service: 'jobgenie' })
  httpRequestDuration.observe({ method: 'POST', endpoint: '/api/ai/generate', service: 'jobgenie' }, duration)
  
  return result
} catch (error) {
  httpRequestsTotal.inc({ method: 'POST', endpoint: '/api/ai/generate', status_code: '500', service: 'jobgenie' })
  throw error
}
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] **Dashboards Created**: Grafana and/or Datadog dashboards imported
- [ ] **Alerts Configured**: Critical alerts set up with proper thresholds
- [ ] **Metrics Collection**: Application sending metrics to monitoring system
- [ ] **Notification Channels**: Slack/PagerDuty integration tested
- [ ] **Team Access**: All team members have dashboard access
- [ ] **Documentation**: Team trained on dashboard usage and alert response

---

**🎯 This configuration provides comprehensive monitoring for JobGenie's AI features with production-ready alerting and cost tracking. Copy the relevant JSON configs to your monitoring platform and customize the thresholds based on your specific requirements!**
