
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'examiner', 'instructor', 'lab_admin', 'student');
CREATE TYPE public.exam_status AS ENUM ('draft', 'scheduled', 'active', 'completed');
CREATE TYPE public.attempt_status AS ENUM ('in_progress', 'submitted', 'graded');
CREATE TYPE public.question_type AS ENUM ('mcq', 'true_false', 'fill_blank', 'short_answer', 'essay', 'matching');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  programmes TEXT[] DEFAULT '{}',
  levels TEXT[] DEFAULT '{}',
  examiner_id UUID,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, school_id)
);

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role public.user_role NOT NULL DEFAULT 'student',
  reg_number VARCHAR(50) UNIQUE,
  department_id UUID REFERENCES public.departments(id),
  level VARCHAR(10),
  last_login TIMESTAMPTZ,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ADD CONSTRAINT fk_examiner FOREIGN KEY (examiner_id) REFERENCES public.users(id);

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id),
  programme VARCHAR(100),
  level VARCHAR(10),
  instructor_id UUID REFERENCES public.users(id),
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, department_id)
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.question_type NOT NULL,
  text TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  department_id UUID NOT NULL REFERENCES public.departments(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  programme VARCHAR(100),
  level VARCHAR(10),
  duration INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  questions_to_answer INTEGER NOT NULL,
  total_marks NUMERIC(6,2) NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status public.exam_status NOT NULL DEFAULT 'draft',
  instructions TEXT,
  pin_mode VARCHAR(20) NOT NULL DEFAULT 'individual',
  shared_pin VARCHAR(8),
  created_by UUID REFERENCES public.users(id),
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.exam_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id),
  pin VARCHAR(8) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  UNIQUE(exam_id, student_id),
  UNIQUE(exam_id, pin)
);

CREATE TABLE public.exam_questions (
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  sort_order INTEGER,
  PRIMARY KEY (exam_id, question_id)
);

CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams(id),
  student_id UUID NOT NULL REFERENCES public.users(id),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC(6,2),
  total_marks NUMERIC(6,2),
  status public.attempt_status NOT NULL DEFAULT 'in_progress',
  current_question INTEGER DEFAULT 0,
  synced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id),
  answer TEXT,
  essay_score NUMERIC(6,2),
  essay_feedback TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE,
  UNIQUE(attempt_id, question_id)
);

CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  attempted_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_departments_updated BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_exams_updated BEFORE UPDATE ON public.exams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_department ON public.users(department_id);
CREATE INDEX idx_questions_course ON public.questions(course_id);
CREATE INDEX idx_exams_status ON public.exams(status);
CREATE INDEX idx_exams_department ON public.exams(department_id);
CREATE INDEX idx_exam_pins_lookup ON public.exam_pins(pin, exam_id);
CREATE INDEX idx_exam_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX idx_exam_attempts_student ON public.exam_attempts(student_id);
CREATE INDEX idx_answers_attempt ON public.answers(attempt_id);

INSERT INTO public.site_settings (id, settings) VALUES (1, '{}') ON CONFLICT (id) DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
