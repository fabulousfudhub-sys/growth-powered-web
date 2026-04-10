ATAPOLY CBT

ATAPOLY CBT is a modern Computer-Based Testing (CBT) web application designed for academic institutions such as polytechnics and universities. It provides a secure and efficient platform for conducting digital examinations, managing questions, evaluating results, and monitoring exam activities.

The system supports role-based access control, centralized exam management, automated grading, and real-time analytics, making it suitable for institutional deployment within computer laboratories.

Overview

ATAPOLY CBT allows institutions to move from traditional paper examinations to a fully digital testing environment. The platform ensures secure exam delivery, efficient question management, and accurate result processing.

Students access the system through web browsers on laboratory computers while the server handles exam logic, authentication, grading, and reporting. It supports online synching of data.

Key Features
Role-Based Access Control

The system includes multiple roles with controlled permissions.

Super Admin

• Full system access
• Configure system settings
• Manage all users and roles
• Manage faculties, departments, and levels
• Access all exams and reports

Admin

• Manage users within the institution
• Create and manage faculties, departments, and levels
• Create and schedule exams
• Monitor exams and view reports

Examiner

• Manage department-level exam activities
• Review and approve exam questions
• Monitor ongoing exams within their department
• Access departmental reports

Instructor

• Create questions for assigned courses
• Manage course question banks
• Build exams from questions
• View course exam results

Student

• Access available exams
• Enter exams using a secure Exam PIN
• Answer questions within the exam time limit
• Submit exams and view results when available

Examination Features
Question Management

The system supports multiple question formats.

• Multiple Choice Questions (MCQ)
• True or False
• Short Answer Questions
• Essay Questions

Question Bank

• Central repository for exam questions
• Questions organized by course and topic
• Reusable questions for multiple exams

Exam Creation

• Set exam duration
• Configure exam start and end time
• Assign exams to courses or departments
• Generate secure exam PINs

Randomization

• Shuffle question order
• Shuffle answer options
• Reduce cheating during exams

Security Features

• Secure authentication system
• Role-based access control
• Exam access using unique exam PIN
• Server-controlled exam session
• Automatic exam submission when time expires
• Restricted access to exam content

Result & Analytics

• Automatic grading for objective questions
• Manual grading for subjective questions
• Individual student score summaries
• Department performance reports
• Course-level analytics
• Exportable results and reports

User Interface

The interface is designed to be clean, responsive, and easy to use, especially for students taking exams in computer laboratories.

Key UI features include:

• Dashboard for each user role
• Clear exam navigation
• Real-time exam timer
• Responsive design for different screen sizes
• Minimal and distraction-free exam interface

System Architecture

ATAPOLY CBT follows a client-server architecture.

Students access the system using web browsers connected to the institutional network. The application server manages all exam processes including authentication, question delivery, answer submission, and result processing.

All exam data is processed on the server to ensure security and integrity.


Technology Stack

This project is built using modern web technologies.

Backend

• Node.js
• NestJS
• Prisma
• PostgreSQL

Frontend

• React
• Tailwind CSS or Material UI

Deployment

• Docker
• Nginx

Installation
1. Clone the Repository
git clone https://github.com/yourusername/atapoly-cbt.git
cd atapoly-cbt
2. Install Dependencies
Backend
cd backend
npm install
Frontend
cd frontend
npm install
3. Run the Development Server
Backend
npm run start:dev
Frontend
npm run dev
Docker Deployment

The project can be deployed using Docker containers for easier setup and scalability.

Build and start the containers:

docker compose up --build

This will start:

• Backend service
• Frontend service
• PostgreSQL database
• Nginx reverse proxy


Usage

Administrator creates faculties, departments, and courses

Instructors add questions to the question bank

Exams are created and scheduled

Students receive an exam PIN to access the test

Students complete the exam within the time limit

Results are generated and made available to administrators and instructors

Deployment Environment

ATAPOLY CBT is designed primarily for local network deployment within computer laboratories.

Features of this setup:

• Hosted on an institutional server
• Accessible through web browsers
• No installation required on student devices
• Centralized management of exams and results