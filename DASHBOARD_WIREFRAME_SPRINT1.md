# 🎨 **JobGenie Dashboard Wireframe - Sprint 1 Implementation**

## 📱 **3-Column Dashboard Layout**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🧞 JobGenie Header                                         │
│  [Logo] [Search Global]                    [Notifications 🔔] [Profile Avatar ▼]   │
└─────────────────────────────────────────────────────────────────────────────────────┘
┌─────────────┬─────────────────────────────────────────────────────┬─────────────────┐
│   SIDEBAR   │                  MAIN FEED                          │   RIGHT PANEL   │
│   (240px)   │                  (Flexible)                        │     (280px)     │
├─────────────┼─────────────────────────────────────────────────────┼─────────────────┤
│ 👤 Profile  │ 🔍 Search & Filters Bar                            │ 🎯 Quick Filters│
│ John Smith  │ ┌─────────────────────────────────────────────────┐ │ ┌─────────────┐ │
│ SWE @ Tech  │ │ [🔍 Search] [📍 Location] [⚙️ Filters (3)] │ │ │📍 Location  │ │
│ 85% Complete│ └─────────────────────────────────────────────────┘ │ │ ☑️ Remote   │ │
│             │                                                     │ │ ☐ Hybrid    │ │
│ 📁 Collections                                                    │ │ ☐ On-site   │ │
│ • Saved Jobs│ 💼 Smart Job Card #1                              │ │             │ │
│ • Applied   │ ┌─────────────────────────────────────────────────┐ │ │💰 Salary    │ │
│ • Interviews│ │🏢 [Logo] TechCorp        [92% Match] [💾 Save]│ │ │ Min: $80k   │ │
│ • Archived  │ │Senior Software Engineer                         │ │ │ Max: $150k  │ │
│             │ │San Francisco, CA • Remote • $120k-150k         │ │ │             │ │
│ 📊 Insights │ │Posted 2 days ago • Large Company               │ │ │🏢 Company   │ │
│ • Match Trends│ │                                               │ │ │ ☑️ Startup  │ │
│ • Salary Data│ │⚡ Perfect Skills Match ⚡ Recently Posted     │ │ │ ☑️ Large    │ │
│ • Industry  │ │                                                 │ │ │ ☐ Enterprise│ │
│             │ │Skills: React TypeScript Node.js AWS Docker     │ │ │             │ │
│ 🤖 AI Coach │ │✅ React ✅ TypeScript ✅ Node.js ❌ Kubernetes│ │ │📅 Posted   │ │
│ • Resume Tips│ │                                                 │ │ │ ☑️ 24 hours │ │
│ • Interview │ │💡 Why recommended: Strong skills match (5/6    │ │ │ ☑️ 3 days   │ │
│   Prep      │ │   required skills). Perfect experience level   │ │ │ ☐ 1 week    │ │
│             │ │   fit. Remote-friendly position.               │ │ │             │ │
│ ⚙️ Settings  │ │                                                 │ │ │🔔 Alerts    │ │
│             │ │[▼ Show Match Breakdown]                         │ │ │New matches: │ │
│             │ │                                                 │ │ │    📧 Daily │ │
│             │ │[Apply Now] [View Details]                       │ │ │    📱 Push  │ │
│             │ └─────────────────────────────────────────────────┘ │ │             │ │
│             │                                                     │ │📈 Analytics │ │
│             │ 💼 Smart Job Card #2                              │ │ │Profile views│ │
│             │ ┌─────────────────────────────────────────────────┐ │ │Applications │ │
│             │ │🏢 [Logo] StartupXYZ      [78% Match] [💾 Save]│ │ │Match trends │ │
│             │ │Full Stack Developer                             │ │ │             │ │
│             │ │New York, NY • Hybrid • $90k-130k              │ │ └─────────────┘ │
│             │ │Posted 1 week ago • Startup                      │ │                 │
│             │ │                                                 │ │                 │
│             │ │⚡ Growth Opportunity ⚡ High Compensation      │ │                 │
│             │ │                                                 │ │                 │
│             │ │Skills: Vue.js JavaScript Python PostgreSQL     │ │                 │
│             │ │✅ JavaScript ❌ Vue.js ✅ Python ❌ PostgreSQL│ │                 │
│             │ │                                                 │ │                 │
│             │ │💡 Why recommended: Good skills match with room │ │                 │
│             │ │   to grow. Growth opportunity to advance your  │ │                 │
│             │ │   career. Salary exceeds expectations.         │ │                 │
│             │ │                                                 │ │                 │
│             │ │[Apply Now] [View Details]                       │ │                 │
│             │ └─────────────────────────────────────────────────┘ │                 │
│             │                                                     │                 │
│             │ 💼 Smart Job Card #3                              │                 │
│             │ ┌─────────────────────────────────────────────────┐ │                 │
│             │ │🏢 [Logo] BigCorp         [65% Match] [💾 Save]│ │                 │
│             │ │DevOps Engineer                                  │ │                 │
│             │ │Seattle, WA • On-site • $100k-140k             │ │                 │
│             │ │Posted 3 days ago • Enterprise                   │ │                 │
│             │ │                                                 │ │                 │
│             │ │⚡ Senior Opportunity                           │ │                 │
│             │ │                                                 │ │                 │
│             │ │Skills: Kubernetes Docker AWS Terraform         │ │                 │
│             │ │❌ Kubernetes ✅ Docker ✅ AWS ❌ Terraform    │ │                 │
│             │ │                                                 │ │                 │
│             │ │💡 Skills gap exists - great learning          │ │                 │
│             │ │   opportunity. Overqualified - could be a      │ │                 │
│             │ │   leadership opportunity.                       │ │                 │
│             │ │                                                 │ │                 │
│             │ │[Apply Now] [View Details]                       │ │                 │
│             │ └─────────────────────────────────────────────────┘ │                 │
│             │                                                     │                 │
│             │ [Load More Jobs] 🔄                               │                 │
│             │                                                     │                 │
└─────────────┴─────────────────────────────────────────────────────┴─────────────────┘
```

---

## 📊 **Match Breakdown Expansion (When Clicked)**

```
💼 Smart Job Card #1 [EXPANDED]
┌─────────────────────────────────────────────────────────────────────────────┐
│🏢 [Logo] TechCorp                              [92% Match] [💾 Save]      │
│Senior Software Engineer                                                     │
│San Francisco, CA • Remote • $120k-150k                                    │
│Posted 2 days ago • Large Company                                           │
│                                                                             │
│⚡ Perfect Skills Match ⚡ Recently Posted                                 │
│                                                                             │
│Skills: React TypeScript Node.js AWS Docker                                 │
│✅ React ✅ TypeScript ✅ Node.js ❌ Kubernetes                           │
│                                                                             │
│💡 Why recommended: Strong skills match (5/6 required skills).             │
│   Perfect experience level fit. Remote-friendly position.                  │
│                                                                             │
│📊 MATCH BREAKDOWN:                                                         │
│┌─────────────────────────────────────────────────────────────────────────┐│
││ Skills Match: 83% ████████████████████████████████████████████████████▓▓││
││ 5/6 required skills                                                     ││
││                                                                         ││
││ Experience: 95% ████████████████████████████████████████████████████████││
││ 4 years vs 3-5 required                                                ││
││                                                                         ││
││ Location: 100% ██████████████████████████████████████████████████████████││
││ Remote available                                                        ││
││                                                                         ││
││ Salary: 90% ████████████████████████████████████████████████████████████▓││
││ Within your range                                                       ││
││                                                                         ││
││ Preferences: 85% ████████████████████████████████████████████████████████││
││ Job type & company match                                                ││
│└─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│🎯 SKILLS TO DEVELOP:                                                       │
│┌─────────────────────────────────────────────────────────────────────────┐│
││ ❌ Kubernetes  ❌ GraphQL  ❌ Microservices                             ││
│└─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│[Apply Now] [View Details] [▲ Hide Breakdown]                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 **Mobile Responsive (< 768px)**

```
┌─────────────────────────────────────┐
│        🧞 JobGenie Mobile           │
│ [☰] [Search] [🔔] [👤]             │
├─────────────────────────────────────┤
│ 🔍 Search & Filters                 │
│ ┌─────────────────────────────────┐ │
│ │ [🔍 Search jobs...]             │ │
│ │ [📍 Remote] [⚙️ Filters (3)]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💼 Job Card (Mobile)                │
│ ┌─────────────────────────────────┐ │
│ │🏢 TechCorp    [92% Match] [💾] │ │
│ │Senior Software Engineer         │ │
│ │Remote • $120k-150k             │ │
│ │                                 │ │
│ │⚡ Perfect Skills Match         │ │
│ │                                 │ │
│ │💡 5/6 skills match, remote     │ │
│ │   friendly position             │ │
│ │                                 │ │
│ │[Apply] [Details] [▼]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💼 Job Card (Mobile)                │
│ ┌─────────────────────────────────┐ │
│ │🏢 StartupXYZ  [78% Match] [💾] │ │
│ │Full Stack Developer             │ │
│ │NYC • Hybrid • $90k-130k        │ │
│ │                                 │ │
│ │⚡ Growth Opportunity           │ │
│ │                                 │ │
│ │💡 Good match with room to grow │ │
│ │                                 │ │
│ │[Apply] [Details] [▼]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Load More] 🔄                     │
└─────────────────────────────────────┘
```

---

## 🎨 **Design Specifications**

### **Color Palette**
- **Primary Blue**: `#2563eb` (buttons, links, match badges)
- **Success Green**: `#059669` (high match scores, checkmarks)
- **Warning Yellow**: `#d97706` (medium matches, skills gaps)
- **Error Red**: `#dc2626` (low matches, missing skills)
- **Gray Scale**: `#f9fafb` to `#111827` (backgrounds, text)

### **Typography**
- **Brand Font**: Pacifico (logo only)
- **Body Font**: Inter (all text)
- **Sizes**: `text-xs` to `text-3xl` (Tailwind scale)

### **Component Specifications**

#### **Smart Job Card**
```css
.job-card {
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  padding: 24px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.job-card:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.match-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 14px;
}

.match-high { /* 80%+ */
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.match-medium { /* 60-79% */
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
}

.match-low { /* <60% */
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}
```

#### **Progress Bars**
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill-high {
  background: linear-gradient(90deg, #059669, #10b981);
}

.progress-fill-medium {
  background: linear-gradient(90deg, #d97706, #f59e0b);
}

.progress-fill-low {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}
```

### **Interactive States**
- **Hover**: Subtle elevation + shadow increase
- **Active**: Slight scale down (0.98)
- **Focus**: Blue ring outline for accessibility
- **Loading**: Skeleton placeholders with shimmer animation

---

## 🎯 **Key UX Principles**

### **Information Hierarchy**
1. **Match Score** - Most prominent (top right)
2. **Job Title** - Large, bold font
3. **Company + Location** - Secondary info
4. **Skills Match** - Visual badges with status
5. **Reasoning** - Explanatory text in muted color
6. **Actions** - Clear CTAs at bottom

### **Progressive Disclosure**
- **Collapsed**: Essential info + match score
- **Expanded**: Full breakdown + skills gap analysis
- **Mobile**: Simplified view with key details

### **Accessibility Features**
- **High Contrast**: WCAG AA compliant colors
- **Keyboard Navigation**: Tab order, focus indicators
- **Screen Readers**: Proper ARIA labels, semantic HTML
- **Motion**: Respects `prefers-reduced-motion`

### **Performance Optimizations**
- **Lazy Loading**: Job cards load as user scrolls
- **Image Optimization**: Company logos with fallbacks
- **Skeleton States**: Loading placeholders
- **Debounced Search**: 300ms delay on filter changes

---

## 📊 **Metrics & Analytics Integration Points**

### **Tracking Events**
```typescript
// Job card interactions
trackEvent('job_card_view', { jobId, matchScore, position })
trackEvent('job_card_expand', { jobId, matchScore })
trackEvent('job_apply_click', { jobId, matchScore, source: 'feed' })
trackEvent('job_save_toggle', { jobId, action: 'save|unsave' })

// Filter usage
trackEvent('filter_applied', { filterType, value })
trackEvent('search_query', { query, resultCount })

// Feed engagement
trackEvent('feed_scroll_depth', { depth: 'page_1|page_2|etc' })
trackEvent('load_more_jobs', { currentCount, newCount })
```

### **A/B Testing Ready**
- Match score display variations
- Job card layout experiments
- Filter UI placement tests
- CTA button text/color variants

---

**This wireframe represents the complete Sprint 1 implementation with all acceptance criteria met and ready for user testing and iteration!** 🚀✨
