CREATE TABLE IF NOT EXISTS student_profiles (
  user_id TEXT PRIMARY KEY,
  full_name TEXT,
  institution TEXT,
  course TEXT,
  study_level TEXT,
  study_year TEXT,
  state TEXT,
  category TEXT,
  family_income TEXT,
  academic_score TEXT,
  achievements TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);