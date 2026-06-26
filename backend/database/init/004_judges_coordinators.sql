-- ─── JUDGES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judges (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_name           text NOT NULL,
  first_name          text NOT NULL,
  middle_name         text,
  avatar_url          text,
  organization        text NOT NULL,
  position            text NOT NULL,
  specialization      text NOT NULL,
  experience_years    integer NOT NULL DEFAULT 0,
  phone               text,
  email               text,
  judge_category      text NOT NULL DEFAULT 'other',
  directions          text[] NOT NULL DEFAULT '{}',
  assigned_competition text,
  assigned_stage      text,
  assigned_location   text,
  assigned_projects   integer NOT NULL DEFAULT 0,
  eval_start_date     date,
  eval_end_date       date,
  login               text UNIQUE NOT NULL,
  password_hash       text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  platform_url        text,
  agreed_criteria     boolean NOT NULL DEFAULT false,
  agreed_independent  boolean NOT NULL DEFAULT false,
  agreed_confidential boolean NOT NULL DEFAULT false,
  agreed_no_conflict  boolean NOT NULL DEFAULT false,
  agreed_no_share     boolean NOT NULL DEFAULT false,
  status              text NOT NULL DEFAULT 'active',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS judges_status_idx ON judges(status);
CREATE INDEX IF NOT EXISTS judges_login_idx ON judges(login);

-- ─── COORDINATORS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coordinators (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  last_name    text NOT NULL,
  first_name   text NOT NULL,
  middle_name  text,
  avatar_url   text,
  organization text NOT NULL,
  position     text NOT NULL,
  phone        text,
  email        text,
  role         text NOT NULL DEFAULT 'otm',
  location     text,
  competition  text,
  login        text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  must_change_password boolean NOT NULL DEFAULT true,
  status       text NOT NULL DEFAULT 'active',
  valid_until  date,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS coordinators_status_idx ON coordinators(status);
CREATE INDEX IF NOT EXISTS coordinators_login_idx ON coordinators(login);
