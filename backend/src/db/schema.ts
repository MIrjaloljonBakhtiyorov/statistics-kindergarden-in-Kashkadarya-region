import { pool } from "./pool.js";

export async function ensureDatabaseSchema() {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
      status text NOT NULL DEFAULT 'active',
      registered_at timestamptz NOT NULL DEFAULT now(),
      last_login timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date date;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS gender text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS pinfl text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_series text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS passport_number text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS district text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS mahalla text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS street text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_status text NOT NULL DEFAULT 'other';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS education_direction text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS course integer;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion integer NOT NULL DEFAULT 25;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires timestamptz;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires timestamptz;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change timestamptz;
    -- Google OAuth
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id text;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'local';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_status text NOT NULL DEFAULT 'incomplete';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_locked boolean NOT NULL DEFAULT false;

    CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id) WHERE google_id IS NOT NULL;

    UPDATE users
    SET email = lower(email)
    WHERE email IS NOT NULL;

    CREATE INDEX IF NOT EXISTS users_registered_at_idx ON users(registered_at DESC);
    CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);
    CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(lower(email)) WHERE email IS NOT NULL;

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
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE applications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS source_user_application_id uuid;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS participation_type text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS institution text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS district text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS project_goal text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS project_problem text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS presentation_url text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS video_url text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS demo_url text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS github_url text;
    ALTER TABLE applications ADD COLUMN IF NOT EXISTS website_url text;

    CREATE INDEX IF NOT EXISTS applications_direction_id_idx ON applications(direction_id);
    CREATE INDEX IF NOT EXISTS applications_created_at_idx ON applications(created_at DESC);
    CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
    CREATE INDEX IF NOT EXISTS applications_institution_idx ON applications(institution);
    CREATE INDEX IF NOT EXISTS applications_district_idx ON applications(district);
    CREATE INDEX IF NOT EXISTS applications_source_user_application_idx ON applications(source_user_application_id);

    CREATE TABLE IF NOT EXISTS user_applications (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_name text NOT NULL,
      direction text NOT NULL,
      goal text NOT NULL,
      problem text NOT NULL,
      presentation_url text,
      video_url text,
      demo_url text,
      github_url text,
      website_url text,
      status text NOT NULL DEFAULT 'submitted',
      admin_comment text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE user_applications ADD COLUMN IF NOT EXISTS application_number text;
    ALTER TABLE user_applications ADD COLUMN IF NOT EXISTS admin_application_id uuid REFERENCES applications(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS user_applications_user_id_idx ON user_applications(user_id);
    CREATE INDEX IF NOT EXISTS user_applications_created_at_idx ON user_applications(created_at DESC);
    CREATE INDEX IF NOT EXISTS user_applications_status_idx ON user_applications(status);

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

    -- ─── TEAMS ─────────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS teams (
      id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        text NOT NULL,
      description text,
      direction   text NOT NULL,
      owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status      text NOT NULL DEFAULT 'active',
      invite_code text UNIQUE NOT NULL DEFAULT substr(md5(random()::text), 1, 10),
      created_at  timestamptz NOT NULL DEFAULT now(),
      updated_at  timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 10);
    -- backfill invite_code for rows that have null
    UPDATE teams SET invite_code = substr(md5(id::text || random()::text), 1, 10) WHERE invite_code IS NULL;
    ALTER TABLE teams ALTER COLUMN invite_code SET NOT NULL;

    CREATE TABLE IF NOT EXISTS team_members (
      id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id    uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role       text NOT NULL DEFAULT 'project_leader',
      status     text NOT NULL DEFAULT 'active',
      joined_at  timestamptz NOT NULL DEFAULT now(),
      UNIQUE(team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS team_invites (
      id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      team_id      uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      invited_by   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invited_user uuid REFERENCES users(id) ON DELETE SET NULL,
      email        text,
      role         text NOT NULL DEFAULT 'member',
      status       text NOT NULL DEFAULT 'pending',
      token        text UNIQUE NOT NULL DEFAULT substr(md5(random()::text || uuid_generate_v4()::text), 1, 32),
      expires_at   timestamptz NOT NULL DEFAULT now() + interval '7 days',
      created_at   timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS teams_owner_idx      ON teams(owner_id);
    CREATE INDEX IF NOT EXISTS team_members_tm_idx  ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS team_members_usr_idx ON team_members(user_id);
    CREATE INDEX IF NOT EXISTS team_invites_tok_idx ON team_invites(token);
    CREATE INDEX IF NOT EXISTS team_invites_usr_idx ON team_invites(invited_user);

    -- ─── JUDGES ──────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS judges (
      id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      last_name            text NOT NULL,
      first_name           text NOT NULL,
      middle_name          text,
      avatar_url           text,
      organization         text NOT NULL,
      position             text NOT NULL,
      specialization       text NOT NULL,
      experience_years     integer NOT NULL DEFAULT 0,
      phone                text,
      email                text,
      judge_category       text NOT NULL DEFAULT 'other',
      directions           text[] NOT NULL DEFAULT '{}',
      assigned_competition text,
      assigned_stage       text,
      assigned_location    text,
      assigned_projects    integer NOT NULL DEFAULT 0,
      eval_start_date      date,
      eval_end_date        date,
      login                text UNIQUE NOT NULL,
      password_hash        text NOT NULL,
      must_change_password boolean NOT NULL DEFAULT true,
      platform_url         text,
      agreed_criteria      boolean NOT NULL DEFAULT false,
      agreed_independent   boolean NOT NULL DEFAULT false,
      agreed_confidential  boolean NOT NULL DEFAULT false,
      agreed_no_conflict   boolean NOT NULL DEFAULT false,
      agreed_no_share      boolean NOT NULL DEFAULT false,
      status               text NOT NULL DEFAULT 'active',
      created_at           timestamptz NOT NULL DEFAULT now(),
      updated_at           timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS judges_status_idx ON judges(status);
    CREATE INDEX IF NOT EXISTS judges_login_idx  ON judges(login);

    CREATE TABLE IF NOT EXISTS judge_projects (
      id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      judge_id              uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
      application_number    text NOT NULL,
      project_name          text NOT NULL,
      team_name             text,
      direction             text NOT NULL DEFAULT '',
      stage                 text NOT NULL DEFAULT 'otm',
      region                text,
      institution           text,
      eval_deadline         date,
      assigned_date         timestamptz NOT NULL DEFAULT now(),
      eval_status           text NOT NULL DEFAULT 'pending',
      summary               text,
      problem               text,
      problem_relevance     text,
      problem_scale         text,
      solution              text,
      solution_innovation   text,
      mvp_exists            boolean DEFAULT false,
      prototype_exists      boolean DEFAULT false,
      demo_url              text,
      github_url            text,
      target_customers      text,
      market_size           text,
      competitors           text,
      business_model        text,
      revenue_sources       text,
      financial_need        text,
      pilot_region          text,
      pilot_org             text,
      scalability           text,
      team_members          jsonb DEFAULT '[]',
      materials             jsonb DEFAULT '[]',
      presentation_date     date,
      presentation_time     text,
      presentation_venue    text,
      presentation_link     text,
      presentation_duration integer DEFAULT 10,
      qa_duration           integer DEFAULT 5,
      created_at            timestamptz NOT NULL DEFAULT now(),
      updated_at            timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS jp_judge_idx ON judge_projects(judge_id);
    CREATE INDEX IF NOT EXISTS jp_status_idx ON judge_projects(eval_status);

    -- ─── COORDINATORS ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS coordinators (
      id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      last_name            text NOT NULL,
      first_name           text NOT NULL,
      middle_name          text,
      avatar_url           text,
      organization         text NOT NULL,
      position             text NOT NULL,
      phone                text,
      email                text,
      role                 text NOT NULL DEFAULT 'otm',
      location             text,
      competition          text,
      login                text UNIQUE NOT NULL,
      password_hash        text NOT NULL,
      must_change_password boolean NOT NULL DEFAULT true,
      status               text NOT NULL DEFAULT 'active',
      valid_until          date,
      created_at           timestamptz NOT NULL DEFAULT now(),
      updated_at           timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS coordinators_status_idx ON coordinators(status);
    CREATE INDEX IF NOT EXISTS coordinators_login_idx  ON coordinators(login);

    -- ─── SESSIONS ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS sessions (
      sid    varchar NOT NULL PRIMARY KEY,
      sess   json    NOT NULL,
      expire timestamp(6) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);
  `);
}
