# 📄 **JobGenie Feature Spec — Sprint 1: Core Matching & Discovery**

## 🎯 **Goal**

Transform raw LinkedIn profiles + imported data into a **personalized, explainable job feed**. Users should see relevant jobs immediately after signup, with transparent scoring and an intuitive dashboard.

---

## 🛠️ **Features & Acceptance Criteria**

### 1. **Explainable Job Matching**

* **AC1:** System computes a match percentage (0–100%) between user profile and job postings.
* **AC2:** Match score is broken into components (e.g., Skills 60%, Experience 20%, Location 20%).
* **AC3:** Match breakdown is displayed in UI as a tooltip or expandable section.
* **AC4:** Scores update dynamically as users enrich their profile.

**Implementation Status**: ✅ COMPLETED
- `JobMatchingEngine` class with component-based scoring
- Skills, experience, location, salary matching algorithms
- Explainable reasoning generation
- Real-time score updates

### 2. **Personalized Job Feed**

* **AC1:** User sees a scrollable feed of recommended jobs on the dashboard immediately after onboarding.
* **AC2:** Feed is ranked by match score + recency.
* **AC3:** Feed supports infinite scroll (or pagination) for >50 jobs.
* **AC4:** Users can filter feed by location, remote preference, salary range, and job type.
* **AC5:** Saved preferences persist across sessions.

**Implementation Status**: 🔄 IN PROGRESS
- Job feed component with infinite scroll
- Ranking algorithm (match score + recency)
- Filter system with persistence
- Mobile-responsive design

### 3. **Smart Job Cards**

* **AC1:** Each job card displays: Job title, company, location, salary (if available), posted date, match % badge.
* **AC2:** "Apply Now" (external link) + "Save Job" actions are visible.
* **AC3:** Hover/expand reveals **why this job was recommended** (skills overlap, location match, etc.).
* **AC4:** Mobile-responsive design (2-column tablet, 1-column mobile).

**Implementation Status**: 🔄 IN PROGRESS
- Smart job card component
- Match explanation tooltips
- Action buttons (Apply, Save)
- Responsive grid layout

### 4. **Job Collections**

* **AC1:** Users can save jobs into "Collections" (default = "Saved Jobs", custom collections allowed).
* **AC2:** Jobs can be removed/moved between collections.
* **AC3:** Collections accessible from dashboard sidebar.
* **AC4:** Saved jobs remain synced across devices (Firebase persistence).

**Implementation Status**: ⏳ PENDING
- Collections management system
- Firebase persistence
- Sidebar navigation
- Drag & drop organization

### 5. **Email Digest**

* **AC1:** Users receive a daily/weekly "Top 5 Jobs for You" email.
* **AC2:** Email content matches in-app feed (same scores, jobs).
* **AC3:** Email has clear CTA to view job in app.
* **AC4:** Opt-in/opt-out toggle in settings (GDPR-compliant).

**Implementation Status**: ⏳ PENDING
- Email template system
- Digest generation service
- Preference management
- GDPR compliance

---

## 📊 **Metrics to Track**

* Job feed engagement rate (scroll depth, clicks per session)
* Apply click-through rate per job card
* % of users saving jobs into collections
* Email digest open + click-through rates
* Avg. time to first "Apply" action

---

## 🔧 **Dependencies**

* ✅ LinkedIn OAuth + Profile Import (**done in Sprint 0**)
* ✅ Job schema normalized (title, skills, company, location, salary, description)
* 🔄 Basic job ingestion pipeline (LinkedIn Jobs API + mock dataset for testing)
* ✅ Firebase (auth, Firestore for saved jobs, FCM/email for digests)

---

## 🚀 **Deliverables**

* ✅ Job matching algorithm v1 (skills/experience/location weighting)
* 🔄 Explainable match score UI on job cards
* 🔄 Personalized job feed (ranked + filterable)
* ⏳ Job Collections (save, organize, sync)
* ⏳ Email Digest MVP (Top 5 jobs)

---

## ⏱️ **Timeline**

**Sprint 1 = 2–3 weeks** (Currently in Week 1)

* ✅ Week 1: Matching algorithm v1 + feed rendering
* 🔄 Week 2: Smart job cards + collections
* ⏳ Week 3: Email digest MVP + QA

---

## 🏗️ **Technical Implementation**

### **Branch Structure**
- `feature/sprint-1-core-matching` - Main Sprint 1 branch
- Future: `feature/job-collections`, `feature/email-digest`

### **Core Components**
- `JobMatchingEngine` - Scoring algorithm with explainable components
- `JobFeed` - Personalized feed with infinite scroll
- `JobCard` - Smart cards with match explanations
- `JobFilters` - Advanced filtering system
- `JobCollections` - Save and organize functionality

### **Data Flow**
1. User profile → JobMatchingEngine → Match scores
2. Job data + Match scores → JobFeed → Ranked list
3. JobFeed → JobCard components → UI display
4. User actions → JobCollections → Firebase persistence

---

## 🎨 **UI/UX Specifications**

### **Dashboard Layout (3-Column)**
```
[Sidebar]  [Main Feed]  [Right Panel]
- Profile  - Job Cards  - Filters
- Collections - Infinite - Quick Actions
- Settings    Scroll    - Notifications
```

### **Job Card Design**
```
┌─────────────────────────────────────────┐
│ 🏢 Company Logo    [92% Match] [💾 Save] │
│ Senior Software Engineer                 │
│ TechCorp • San Francisco, CA • Remote   │
│ $120k-$150k • Posted 2 days ago        │
│ ─────────────────────────────────────── │
│ Skills: React, TypeScript, Node.js      │
│ Why recommended: 5/6 skills match...    │
│ [Apply Now] [View Details]              │
└─────────────────────────────────────────┘
```

### **Match Explanation Tooltip**
```
Match Breakdown (92%):
├── Skills Match: 83% (5/6 skills)
├── Experience: 95% (3-5 years req.)
├── Location: 100% (Remote available)
└── Salary: 90% (Within range)
```

---

**Status**: 🔄 **ACTIVE DEVELOPMENT**
**Next Milestone**: Complete Job Feed + Smart Cards by end of Week 1
