# ATAPOLY CBT — Comprehensive Documentation


## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [File & Folder Structure](#file--folder-structure)
6. [System Flow](#system-flow)
7. [Setup & Installation](#setup--installation)
8. [Configuration](#configuration)
9. [Usage Guide](#usage-guide)
10. [API Overview](#api-overview)
11. [Database Schema Overview](#database-schema-overview)
12. [Testing & Development Workflow](#testing--development-workflow)
13. [Troubleshooting & FAQ](#troubleshooting--faq)
14. [Contribution Guidelines](#contribution-guidelines)
15. [License](#license)

---

## Project Overview
ATAPOLY CBT is a full-featured Computer-Based Testing platform for academic institutions. It enables secure, efficient, and scalable digital examinations, question management, automated grading, and analytics. The system is designed for deployment in computer labs, supporting both online and offline (LAN) operation, with data synchronization when internet is available.

---


## Features

### Role-Based Access & Permissions
- **Super Admin**: Full system control, manage all users, settings, faculties, departments, levels, exams, audit logs, and reports.
- **Admin**: Manage users, create/manage faculties, departments, levels, schedule exams, monitor, and report.
- **Examiner**: Department-level exam management, review/approve questions, monitor exams, departmental reports, manage instructors.
- **Instructor**: Create/manage questions, build exams, view course results, manage assigned courses.
- **Student**: Access exams, enter with secure PIN, answer within time, submit, view results.

### Examination Features
- Multiple question formats: MCQ, True/False, Short Answer, Essay, Matching, Fill-in-the-blank.
- Central question bank, organized by course/topic, reusable.
- Exam creation: set duration, start/end time, assign to course/department, generate secure PINs (individual/shared).
- Randomization: shuffle questions/options to reduce cheating.
- Auto-assign questions from course bank to exams.
- PIN generation: individual or shared PINs for exam access.
- Exam monitoring: live status of students, reset attempts, view progress.
- Import/export: CSV import for students/questions, export results and PINs.

### Security Features
- Secure authentication (JWT-based).
- Role-based access control.
- Exam access via unique PIN.
- Server-controlled session.
- Auto-submit on time expiry.
- Restricted content access (copy/paste, right-click, dev tools disabled during exam).
- Audit logs for all admin/staff actions.
- Password management and change.

### Result & Analytics
- Auto-grading for objective questions.
- Manual grading for subjective/essay questions.
- Student score summaries.
- Department/course analytics.
- Exportable results/reports (CSV, PDF).
- Pass rate, average score, completion stats.

### User Interface
- Clean, responsive, minimal, distraction-free.
- Dashboards per role.
- Real-time timer.
- Clear navigation.
- Keyboard shortcuts for exam navigation.
- Accessible design for lab environments.

---

## File & Folder Structure

```
atapoly-cbt-97581717/
├── README.md
├── COMPREHENSIVE_PROJECT_DOCUMENTATION.md
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig*.json
├── public/
│   ├── logo.png, robots.txt, ...
├── dev-dist/           # Vite/Service Worker build output
├── src/
│   ├── App.tsx        # Main React app entry
│   ├── main.tsx       # ReactDOM render
│   ├── index.css, App.css
│   ├── lib/           # API, types, utils, mock-data
│   ├── contexts/      # React context (Auth)
│   ├── hooks/         # Custom React hooks
│   ├── components/
│   │   ├── ui/        # UI primitives (Button, Card, etc)
│   │   ├── dialogs/   # Dialogs for CRUD (Add/Edit/Export)
│   │   ├── exam/      # Exam-specific components (Timer, Renderer)
│   │   ├── admin/     # Admin layout/sidebar
│   ├── pages/
│   │   ├── admin/     # All admin/staff pages (Dashboard, Exams, ...)
│   │   ├── StudentExamPortal.tsx
│   │   ├── Index.tsx, NotFound.tsx
│   ├── test/          # Vitest tests
├── server/
│   ├── index.js       # Express server entry
│   ├── package.json
│   ├── db/
│   │   ├── schema.sql # PostgreSQL schema
│   │   ├── init.js, seed.js, pool.js
│   ├── routes/        # Express API routes (auth, exams, ...)
│   ├── middleware/    # Express middleware (auth)
│   ├── services/      # Sync service
│   ├── public/        # Static frontend build
```

**Key files explained:**
- `src/pages/admin/`: All admin, examiner, instructor pages (Dashboard, Exams, Students, Results, etc.)
- `src/components/dialogs/`: All modal dialogs for CRUD (Add/Edit/Export/Import)
- `src/lib/api.ts`: Frontend API abstraction for all backend endpoints
- `server/routes/`: All backend API endpoints (auth, exams, questions, answers, admin, sync, import)
- `server/db/schema.sql`: Full database schema (tables, enums, relationships)

---

## System Flow

### 1. User Authentication & Role Routing
- User logs in (staff or student) via login page.
- Auth context loads user, role, and active exam (if student).
- Routing directs user to appropriate dashboard/portal based on role.

### 2. Exam Lifecycle
- **Creation:** Admin/examiner creates exam, sets parameters, assigns course/department, generates PINs.
- **PIN Generation:** Choose individual/shared PINs. PINs are assigned to eligible students.
- **Question Assignment:** Questions are auto-assigned from course bank; can be re-assigned.
- **Monitoring:** Live monitoring of exam progress, student status, reset attempts if needed.
- **Submission:** Student submits exam (auto or manual), answers are saved, score is calculated (auto/manual).

### 3. Question Management
- Instructors add/edit questions to course bank (MCQ, True/False, Essay, etc.).
- Questions can be imported via CSV.
- Questions are reused across multiple exams.

### 4. Grading & Results
- Objective questions are auto-graded.
- Subjective/essay questions are graded manually via the Grade Essay page.
- Results are available to students and staff, with analytics and export options.

### 5. Reporting & Analytics
- Reports can be generated by school, department, exam, or student.
- Exportable as CSV/PDF.

### 6. Audit & Security
- All admin/staff actions are logged in the audit log.
- Security features: PIN access, session control, restricted browser actions, password management.

---


---

## System Architecture
- **Frontend:** React (Vite, TypeScript, Radix UI, Shadcn UI, TanStack Query)
- **Backend:** Node.js/Express, REST API
- **Database:** PostgreSQL, custom schema
- **Sync Service:** For online/offline data synchronization
- **LAN/Internet:** Clients connect via LAN; server can sync online if available

```
+-----------------------------+
|      HOST MACHINE           |
|  +-----------+   +--------+ |
|  | Express   |   |  PGSQL | |
|  | :3001     |   | :5432  | |
|  +-----------+   +--------+ |
|         |         |         |
+---------|---------|---------+
          | LAN/Internet
+---------|---------+---------+
|   Clients (Browsers)        |
+-----------------------------+
```

---

## Technology Stack
- **Frontend:** React 18, Vite, TypeScript, Radix UI, TanStack Query, Shadcn UI, Lucide Icons, Sonner, etc.
- **Backend:** Node.js 18+, Express 4, PostgreSQL 15+, JWT, bcrypt, uuid, cors.
- **Database:** PostgreSQL, custom schema (see below).
- **Dev Tools:** ESLint, Vitest, VitePWA, etc.

---


## Setup & Installation

### Backend Setup
1. **Install PostgreSQL & Create User**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql
   # Or download for Windows from https://www.postgresql.org/download/
   # Create DB user
   sudo -u postgres psql -c "CREATE USER cbt_admin WITH PASSWORD 'cbt_password' CREATEDB;"
   ```
2. **Initialize Database**
   ```bash
   cd server
   npm install
   npm run db:init    # Creates database + schema
   npm run db:seed    # Inserts sample data
   ```
3. **Start the Server**
   ```bash
   npm start
   # Server runs on http://0.0.0.0:3001
   ```

### Frontend Setup
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run the app**
   ```bash
   npm run dev
   # App runs on http://localhost:8080 (default)
   ```

### Client Access
- On each client, open a browser and go to: `http://<HOST_IP>:3001` (or the frontend port if running separately)

### File Structure Notes
- All frontend code is in `src/` (React, TypeScript, UI, pages, dialogs, hooks, etc.)
- All backend code is in `server/` (Express, routes, db, middleware, services)
- Database schema and seed scripts are in `server/db/`
- Static assets (logo, manifest, etc.) are in `public/` and `server/public/`

---

---

## Configuration
### Environment Variables (Backend)
| Variable            | Default         | Description                        |
|---------------------|----------------|------------------------------------|
| `PORT`              | `3001`         | Server port                        |
| `DB_HOST`           | `localhost`    | PostgreSQL host                    |
| `DB_PORT`           | `5432`         | PostgreSQL port                    |
| `DB_NAME`           | `atapoly_cbt`  | Database name                      |
| `DB_USER`           | `cbt_admin`    | Database user                      |
| `DB_PASSWORD`       | `cbt_password` | Database password                  |
| `JWT_SECRET`        | (default key)  | **Change in production!**          |
| `ONLINE_SERVER_URL` | (empty)        | Online server URL for sync         |
| `SYNC_INTERVAL`     | `60000`        | Sync check interval (ms)           |

### Frontend
- Set `VITE_API_URL` in `.env` if backend is on a different host/port.

---

## Usage Guide
### Default Logins
- **Admin:** `admin@cbt.edu.ng` / `admin123`
- **Instructor:** `adeyemi@cbt.edu.ng` / `instructor123`
- **Student:** `ATAP/ND/COM/23/001` + exam PIN

### Role Actions
- **Super Admin/Admin:** Manage users, departments, courses, exams, view reports.
- **Examiner:** Review/approve questions, monitor exams, see department analytics.
- **Instructor:** Add/edit questions, build exams, view results.
- **Student:** Login with Reg. Number and PIN, take exam, submit, view results.

---

## API Overview
- **Auth:** `/api/auth/login`, `/api/auth/me`, `/api/auth/student/login`
- **Users:** `/api/admin/users`, `/api/admin/users/:id`
- **Departments/Courses:** `/api/admin/departments`, `/api/admin/courses`
- **Exams:** `/api/exams`, `/api/exams/:id`, `/api/exams/:id/generate-pins`, `/api/exams/:id/pins`
- **Questions:** `/api/questions`, `/api/questions/exam/:examId`
- **Answers:** `/api/answers/save-batch`, `/api/answers/:id`
- **Results:** `/api/results`, `/api/results/:examId`
- **Sync:** `/api/sync`

(See `src/lib/api.ts` and `server/routes/` for full details.)

---

## Database Schema Overview
- **users:** (id, name, email, password_hash, role, reg_number, department_id, level, ...)
- **departments:** (id, name, school_id, ...)
- **schools:** (id, name, ...)
- **courses:** (id, code, title, department_id, school_id, ...)
- **questions:** (id, type, text, options, correct_answer, course_id, ...)
- **exams:** (id, title, course_id, department_id, school_id, duration, total_questions, ...)
- **exam_pins:** (id, exam_id, student_id, pin, used, ...)
- **exam_questions:** (exam_id, question_id, sort_order, ...)
- **answers:** (id, attempt_id, question_id, answer, ...)
- **exam_attempts:** (id, exam_id, student_id, status, ...)
- **sync_log:** (id, table, record_id, status, ...)

(See `server/db/schema.sql` for full schema.)

---

## Testing & Development Workflow
- **Lint:** `npm run lint`
- **Test:** `npm run test` (frontend, uses Vitest)
- **Backend:** Manual testing via API endpoints, Postman, or frontend.
- **Database:** Use provided seed scripts for test data.

---

## Troubleshooting & FAQ
- **Server not starting:** Check PostgreSQL is running and credentials are correct.
- **Cannot login:** Ensure user exists and password is correct; check database.
- **PIN not generating:** Ensure students exist for the selected department/level.
- **Frontend/backend CORS:** Set `VITE_API_URL` or run both on same host/port.

---

## Contribution Guidelines
- Fork the repo, create a feature branch, submit PRs.
- Follow code style and commit message conventions.
- Add tests for new features.

---

## License
- (Add your license here, e.g., MIT, if applicable.)

---

**For more details, see the README files and code comments throughout the project.**
