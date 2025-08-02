You are to generate a **complete, runnable Employee Performance Management System (EPMS)** using the following context and stack.

---

## Business Context
The HR department needs a system to **streamline employee performance reviews, goal tracking, and skill assessments**.  
The system will be used by:
- **Employees** (to set goals, self-review, record skills)
- **Reviewers/Managers** (to review goals, provide feedback)
- **Admins/HR** (to view analytics and performance trends).

---

## Core Features
1. **Employee Profiles**
   - Personal info (name, email, phone).
   - Role details (title, department).
   - Reporting structure (manager, reviewer, appraiser).
   - Performance cycle (e.g., 2024–2025, quarterly breakdown).

2. **Goal Setting & Tracking**
   - Employees can **add/edit goals** (until reviewed).
   - Goal includes: title, description, target, timeline, progress %, employee comments.
   - Reviewers can approve/reject/lock goals after review.
   - Supports **quarterly feedback** (self + manager).

3. **Performance Reviews (360-degree)**
   - Self-assessment.
   - Reviewer feedback (with ratings & comments).
   - Optional peer feedback.

4. **Skill Assessment**
   - Employee logs skills with competency level (Beginner/Intermediate/Expert).
   - Development areas.

5. **Reports & Analytics (Admin Only)**
   - Goal achievement rates by role and department.
   - Performance trend charts per quarter.
   - Exportable reports (CSV).

---

## Technical Stack
- **Frontend:** React + Tailwind (blue-white theme, reusable components, clean UI).
- **Backend:** java.
- **Database:** SQL Server (using SQLAlchemy ORM).
- **Authentication:** JWT-based login with 3 roles (Employee, Reviewer, Admin).
- **Hosting-ready:** Containerized with Docker.

---

## Pages (Frontend)
1. **Login Page** – role-based redirection.
2. **My Dashboard (Employee)** – shows:
   - Name, Role, Reporting Structure.
   - Current cycle (e.g., 2024–2025) with quarterly feedback.
   - Add/Edit Goals (if not reviewed yet).
3. **My Goals Page**
   - Card view of goals (title, progress bar).
   - "View" button → modal with details (target, actual, employee & appraiser comments).
4. **Skill Assessment Page**
   - Add/edit skills and competency levels.
   - List development areas.
5. **Reports Page (Admin only)**
   - Goal achievement charts by role.
   - Export reports (CSV).
   - Performance trend graphs.

---

## Required Deliverables (Runnable)
1. **Backend (FastAPI)**:
   - User authentication (JWT) with Employee, Reviewer, Admin roles.
   - Endpoints:
     - `/auth/login`, `/auth/register`
     - `/employees` (profile CRUD)
     - `/goals` (CRUD, lock after review)
     - `/feedback` (self & reviewer)
     - `/skills` (CRUD for skills)
     - `/reports` (aggregated analytics)
   - Database models (SQLAlchemy) for:
     - `users`, `goals`, `feedback`, `skills`, `audit_logs`.
   - Dockerfile to run with SQL Server.

2. **Frontend (React)**:
   - Blue-white Tailwind theme.
   - Reusable components: `DashboardCard`, `GoalCard`, `Modal`, `SkillForm`, `Chart`.
   - State management (Zustand or Redux).
   - Fetch data via backend API.

3. **SQL Server Schema**:
   - `users`: (id, name, email, password_hash, role, department, manager_id)
   - `goals`: (id, employee_id, title, description, target, progress, reviewer_id, status, quarter)
   - `feedback`: (id, goal_id, comments, rating, given_by, quarter)
   - `skills`: (id, employee_id, skill_name, level, development_area)
   - `audit_logs`: (id, user_id, action, timestamp).

4. **Extras:**
   - Role-based navigation (hide admin pages for employees).
   - API error handling and validation.
   - Seed script to populate sample data.

---

## Instructions for Generation
- Generate **backend first** (FastAPI app + SQLAlchemy + JWT auth + Dockerfile).
- Generate **React frontend** (with Tailwind, reusable components, calling backend).
- Provide **docker-compose.yml** to run FastAPI + SQL Server + React frontend.
- Ensure app is **runnable out of the box** (`docker-compose up` should bring up the whole system).
- Use environment variables for database credentials and JWT secret.

---
Now, generate the **entire runnable codebase** (backend + frontend + docker) so that I can run `docker-compose up` and start using the Employee Performance Management System.
