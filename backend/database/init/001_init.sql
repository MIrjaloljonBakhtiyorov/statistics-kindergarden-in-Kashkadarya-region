CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS health_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS directions (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#155EEF',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_number text NOT NULL UNIQUE,
  team_name text NOT NULL,
  project_name text NOT NULL,
  direction_id text NOT NULL REFERENCES directions(id),
  region text NOT NULL,
  participant_name text NOT NULL,
  phone text NOT NULL,
  email text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  stage text NOT NULL DEFAULT 'receiving',
  score numeric(5, 2),
  user_id uuid,
  source_user_application_id uuid,
  participation_type text,
  institution text,
  district text,
  project_goal text,
  project_problem text,
  presentation_url text,
  video_url text,
  demo_url text,
  github_url text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_direction_id_idx ON applications(direction_id);
CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS applications_institution_idx ON applications(institution);
CREATE INDEX IF NOT EXISTS applications_district_idx ON applications(district);
CREATE INDEX IF NOT EXISTS applications_source_user_application_idx ON applications(source_user_application_id);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  password_hash text,
  role text NOT NULL DEFAULT 'participant',
  participation_type text NOT NULL DEFAULT 'university',
  middle_name text,
  birth_date date,
  gender text,
  pinfl text,
  passport_series text,
  passport_number text,
  phone text,
  phone_verified boolean NOT NULL DEFAULT false,
  email_verified boolean NOT NULL DEFAULT false,
  telegram text,
  district text,
  mahalla text,
  street text,
  employment_status text NOT NULL DEFAULT 'other',
  faculty text,
  education_direction text,
  course integer,
  profile_completion integer NOT NULL DEFAULT 25,
  avatar_url text,
  institution text,
  region text,
  profile_locked boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  registered_at timestamptz NOT NULL DEFAULT now(),
  last_login timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_registered_at_idx ON users(registered_at DESC);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(lower(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  action_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id, is_read);

INSERT INTO directions (id, name, color, sort_order)
VALUES
  ('it-ai', 'IT va Sun''iy intellekt', '#155EEF', 1),
  ('agrotech', 'Agrotexnologiyalar', '#0F9F6E', 2),
  ('edtech', 'Ta''lim texnologiyalari', '#4338CA', 3),
  ('med-social', 'Tibbiyot va ijtimoiy xizmatlar', '#E11D48', 4),
  ('fintech', 'Fintex', '#F5A623', 5),
  ('govtech', 'Davlat xizmatlari va raqamlashtirish', '#6D28D9', 6),
  ('greentech', 'Yashil texnologiyalar', '#16A34A', 7),
  ('tourism', 'Turizm va xizmat ko''rsatish', '#0891B2', 8),
  ('industry-logistics', 'Sanoat va logistika', '#EA580C', 9),
  ('other', 'Boshqa innovatsion loyihalar', '#7C3AED', 10)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order,
  is_active = true;
