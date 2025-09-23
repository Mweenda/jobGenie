---
title: "[]{#_ewssfhfagqbh .anchor}Fullstack Web App - Assignment1"
---

Student name:

Location: Lusaka

Cohort: AI Coding Bootcamp Cohort 1

Total Grade:

# Comments

# Rubric (1 = Unacceptable → 5 = Exceptional)

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Category**       **1 ---          **2 --- Needs     **3 --- Meets Expectations**                                   **4 --- Exceeds Expectations**                                 **5 ---
                     Unacceptable**   Work**                                                                                                                                          Exceptional**
  ------------------ ---------------- ----------------- -------------------------------------------------------------- -------------------------------------------------------------- --------------------
  **Design (UI/UX)** Inconsistent     Basic             Clean, consistent UI; mobile‑friendly; passes basic [[a11y     Thoughtful visual hierarchy; custom theming; comprehensive     Pixel‑perfect,
                     layout;          responsiveness;   checks]{.underline}](https://www.a11yproject.com/checklist/)   [[a11y]{.underline}](https://www.a11yproject.com/checklist/)   branded design;
                     illegible or     noticeable visual (contrast, keyboard nav).                                      (screen‑reader flows).                                         motion/interaction
                     inaccessible; no bugs; limited                                                                                                                                   polish; formal a11y
                     mobile support.  attention to                                                                                                                                    audit with fixes.
                                      a11y.                                                                                                                                           

  **Frontend         Frequent runtime Works but         Modular components; state handled via TanStack Query/RHF;      Well‑typed hooks; code‑splitting; performance optimizations    Production‑level
  Implementation**   errors;          brittle; large    minimal warnings.                                              (lazy‑load, memo).                                             quality: SSR/SEO,
                     spaghetti code;  components;                                                                                                                                     exhaustive error
                     no state mgmt    ad‑hoc state                                                                                                                                    states, lighthouse
                     conventions.     handling.                                                                                                                                       \~90+.

  **Backend / API**  Endpoints fail   CRUD works but    tRPC routes typed; Zod validation; Firestore rules enforce     Thoughtful data modelling; composite indexes; graceful         Multi‑env config;
                     or are missing;  poor error        auth.                                                          failures.                                                      seeding scripts;
                     insecure rules;  handling; some                                                                                                                                  zero‑downtime
                     no validation.   validation gaps.                                                                                                                                migrations or
                                                                                                                                                                                      blue‑green deploys.

  **Dev Experience & Manual builds;   Basic GitHub      Turbo‑cached pipeline: lint, type‑check, tests, Storybook      Parallel jobs, test reports, codecov; deploy promotes on       Cache‑aware, \<5 min
  CI/CD**            no linter/tests  Action to deploy; build, preview deploy.                                         tag/Changeset.                                                 runtime; canary
                     in pipeline;     tests run locally                                                                                                                               deploys;
                     flaky deploys.   only.                                                                                                                                           Slack/Discord
                                                                                                                                                                                      notifications &
                                                                                                                                                                                      rollbacks.

  **Cloud / IT Ops** Hard‑coded       Env vars in repo  Secrets via T3 Env + functions:config; Cloud Logging           Alerting rules, Crashlytics/Sentry integration; cost budgets.  IaC or scripts for
                     secrets; no      secrets; basic    dashboards.                                                                                                                   full recreate;
                     monitoring;      Firebase console                                                                                                                                autoscaling tuned;
                     unclear infra    logs.                                                                                                                                           custom metrics &
                     costs.                                                                                                                                                           alerts.

  **Product          No clear goals;  Trello/Issues     Defined MVP; backlog groomed; demo accepts against criteria.   Road‑map with milestones; burn‑down chart; stakeholder demos.  Data‑driven
  Management**       scope creep;     exist but vague;                                                                                                                                decisions
                     missing          ad‑hoc                                                                                                                                          (analytics); retro
                     acceptance       prioritization.                                                                                                                                 action items
                     criteria.                                                                                                                                                        implemented; public
                                                                                                                                                                                      changelog.

  **Quality &        No automated     \<30 % unit       ≥60 % unit+component coverage; Playwright happy path; lint &   Visual regression via Storybook; a11y checks; seed data        Mutation or
  Testing**          tests; manual QA coverage; flaky   Prettier pass CI.                                              resets; ≥80 % coverage.                                        property‑based
                     only.            E2E; lint                                                                                                                                       tests; contract/fuzz
                                      disabled.                                                                                                                                       tests;
                                                                                                                                                                                      zero‑regression
                                                                                                                                                                                      policy.

  **Security**       Public DB;       Auth enforced but Principle‑of‑least‑privilege rules; OWASP top‑10 reviewed;     Automated security tests (ZAP/GH Dependabot); 2FA enforced on  Threat model
                     default rules;   rules overly      secrets managed.                                               repo.                                                          documented; security
                     secrets in code. broad; no                                                                                                                                       ADRs; periodic
                                      dependency                                                                                                                                      penetration test
                                      scanning.                                                                                                                                       results.

  **Architecture &   Single huge      Ad‑hoc folders;   Follows monorepo layout; shared package for types; ADR in      Decoupled modules; clear domain boundaries; tree‑shakeable     Hexagonal/CQRS or
  Code               file; unclear    circular deps;    /docs.                                                         libraries.                                                     similar advanced
  Organization**     boundaries; no   inconsistent                                                                                                                                    patterns; plug‑in
                     ADRs.            naming.                                                                                                                                         architecture;
                                                                                                                                                                                      exemplary ADR trail.
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
