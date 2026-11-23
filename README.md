# Kyungdong University Global (KDU Global) - Unified Student & Admin Portal

A comprehensive, clean, minimalist, modern light-mode campus web application for **Kyungdong University Global (KDU Global)**. Built with pure **HTML5, CSS3, and ES6+ JavaScript** powered by a **100% self-contained local database engine**.

**Zero cloud setup, zero external CDNs or remote dependencies, and zero build tools required.**

---

## ⚡ Direct Quick Start

Simply double-click:
```cmd
run.cmd
```

- If Python is installed, it boots a local server on `http://localhost:8000` and automatically opens your browser.
- If Python is not in PATH, it opens `index.html` directly in your default web browser.

---

## 👥 Dual-Role Authentication & Demo Accounts

The portal features dedicated UI rendering and permissions for **Students** and **University Administrators / Faculty**:

| Role | Pre-Seeded Email | Password | Pre-Seeded Name | ID / Staff ID | Features |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@kduniv.ac.kr` | `password123` | Min-Jun Kim | `2026-KD1042` | Access student submission forms, registration buttons, personal records, and borrow/booking tools. |
| **Admin** | `admin@kduniv.ac.kr` | `admin123` | Prof. David Park (Director) | `KDU-ADM-01` | Full administrative control: post notices, build quizzes, grade submissions, manage facilities, and manage attendees. |

> **Tip:** On the Sign In screen, click **"👨‍🎓 Student Demo"** or **"🛡️ Admin Demo"** for instant 1-click test login.

> **Accounts:** the Register form creates **student** accounts only (Student ID and email must be unique, password at least 6 characters). Admin accounts come only from the seed data in `db.js`, so nobody can sign up as an administrator.
>
> **Note:** this is a front-end demo. Passwords are kept in the browser's localStorage, which is fine for a class project but is not real security. A real system would check passwords on a server.

---

## 🏛️ All 10 Integrated Campus Systems

The dashboard features a responsive sidebar (it collapses to icons on desktop and slides in as a menu on phones) that switches seamlessly between all 10 systems:

### 1. University Information & Lost/Found System
- **Campus Notices:** Official announcements with live search plus **Category** and **Priority** (`Normal`, `Important`, `Urgent`) filters and a Reset button.
- **Lost & Found Desk:** Item listings with status badges (`Lost`, `Found`, `Claimed`), search and status filter, and a reporting form. Students can delete their own reports.
- **Admin Tools:** Post official notices, mark lost items as claimed, or delete records.

### 2. University Event Management System
- **Event Listings:** Symposia, cultural festivals, and hackathons with date, venue, capacity, and live seat filling progress bars.
- **Student Actions:** 1-Click seat reservation and cancellation with duplicate registration prevention.
- **Admin Tools:** Create new campus events, delete listings, and view live **Attendee Rosters** with student IDs and timestamps.

### 3. Online Book Store / Library Exchange
- **Catalog Search:** Academic course textbooks filterable by title, author, or course code (`CS302`, `AI201`, `BIZ202`, `ENG101`).
- **Student Actions:** Borrow textbooks for 14-day loan periods and return borrowed books.
- **Admin Tools:** Add new books to the catalog, view all university borrowing transactions, and process returns.

### 4. Student Club Management System
- **Club Directory:** Recognized societies (AI & Robotics Society, Global Cultural Exchange, FinTech Circle, Debate Union).
- **Student Actions:** Join or leave clubs with membership tracking.
- **Club Bulletins:** Live bulletin board for meeting schedules and workshop announcements.
- **Admin Tools:** Register new clubs, post club bulletins, or disband clubs.

### 5. Student Feedback & Satisfaction System
- **Feedback Form:** Submit evaluations for Course Instruction, Facilities, Dining, or Administration.
- **Interactive Ratings:** 1-to-5 star rating component and written comments.
- **Aggregated Analytics:** Live campus average satisfaction score (e.g. `4.7 / 5.0`) and student comment feeds.
- **Admin Tools:** Moderation and removal of inappropriate feedback.

### 6. Online Quiz & Self-Assessment System
- **Interactive Quiz Taker:** Timed multiple-choice quizzes with a live countdown that auto-submits at 0:00 (e.g. *CS101 Web Architecture*, *AI201 Machine Learning*).
- **Instant Automated Grading:** Real-time score calculation upon submission with question-by-question solution review and pedagogical explanations.
- **Admin Tools:** Visual **Quiz Builder** allowing instructors to create quizzes with custom questions and answer keys.

### 7. Student Assignment Submission System
- **Coursework Tracker:** Live deadline countdowns (`Due in 4 days`, `Urgent: Due in 8 hours`, or `Overdue`), instructions, and max points.
- **Submission Form:** Submit repository links, cloud document URLs, and submission comments. Submissions close at the deadline, and a graded submission can no longer be changed.
- **Grading & Feedback:** Students view their grades (`48 / 50 (A+)`) and instructor comments.
- **Admin / Instructor Tools:** Post new assignments, browse submission ledgers, and open the **Grading Modal** to record scores and feedback.

### 8. Campus Facility Booking System
- **Facility Directory:** High-Performance AI Labs, Conference Auditoriums, Study Pods, and Gymnasiums with equipment specs.
- **Reservation Form:** Select facility, date, and time slot with **automated schedule conflict detection** (past dates are blocked).
- **Admin Tools:** Review campus-wide reservations, approve/cancel bookings, and register new campus spaces.

### 9. Campus Media & Film Hub
- **Screenings Catalog:** Curated documentary screenings, academic guest keynotes, and cinema study nights with IMDb ratings, genres, and screening halls.
- **Details & Reservations:** Filter by genre, view full synopses, and reserve or cancel a seat (one seat per student).
- **Admin Tools:** Publish new media screenings and manage listings.

### 10. Student Counseling Appointment System
- **Specialist Profiles:** Licensed psychologists and academic advisors with office locations, specializations, and available days.
- **Booking Form:** Select counselor, date, time slot, and session mode (In-Person Office 104 vs. Confidential Zoom Call). Bookings must fall on the counselor's working days; neither the counselor nor the student can be double-booked.
- **History Ledger:** Students view scheduled sessions; Admins/Counselors update session statuses and document confidential consultation advice.

---

## 📁 File Structure

```
├── run.cmd          # Windows launcher (local server or direct open)
├── index.html       # Semantic HTML layout with sidebar & 10 module views
├── styles.css       # Clean, modern light-mode CSS design system
├── db.js            # 100% local database engine (LocalStorage CRUD & Seed Data)
├── app.js           # Modular ES6+ logic & dual-role UI rendering
└── README.md        # Comprehensive documentation
```

---

## 🛠️ Data Reset Option
To restore all 10 modules back to the clean factory demo state at any time, click **"🔄 Reset Demo DB"** at the bottom of the navigation sidebar.
