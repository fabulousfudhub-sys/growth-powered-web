// This file is kept for backward compatibility but contains no mock data.
// All data now comes from the production PostgreSQL backend.

export type { UserRole, User, School, Department, Course, Question, ExamPin, Exam, ExamAttempt, AuditEntry } from './types';

export function generateExamPin(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}
