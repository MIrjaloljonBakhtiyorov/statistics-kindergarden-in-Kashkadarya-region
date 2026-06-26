-- ─── JUDGE PROJECTS (loyihalar hakamga biriktirilgan) ────────────────────────
CREATE TABLE IF NOT EXISTS judge_projects (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id            uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  application_number  text NOT NULL,
  project_name        text NOT NULL,
  team_name           text,
  direction           text NOT NULL DEFAULT '',
  stage               text NOT NULL DEFAULT 'otm',
  region              text,
  institution         text,
  eval_deadline       date,
  assigned_date       timestamptz NOT NULL DEFAULT now(),
  eval_status         text NOT NULL DEFAULT 'pending',
  -- Loyiha tafsilotlari
  summary             text,
  problem             text,
  problem_relevance   text,
  problem_scale       text,
  solution            text,
  solution_innovation text,
  mvp_exists          boolean DEFAULT false,
  prototype_exists    boolean DEFAULT false,
  demo_url            text,
  github_url          text,
  target_customers    text,
  market_size         text,
  competitors         text,
  business_model      text,
  revenue_sources     text,
  financial_need      text,
  pilot_region        text,
  pilot_org           text,
  scalability         text,
  -- Jamoa
  team_members        jsonb DEFAULT '[]',
  -- Materiallar
  materials           jsonb DEFAULT '[]',
  -- Taqdimot jadvali
  presentation_date   date,
  presentation_time   text,
  presentation_venue  text,
  presentation_link   text,
  presentation_duration integer DEFAULT 10,
  qa_duration         integer DEFAULT 5,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jp_judge_idx ON judge_projects(judge_id);
CREATE INDEX IF NOT EXISTS jp_status_idx ON judge_projects(eval_status);

-- ─── JUDGE EVALUATIONS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judge_evaluations (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id              uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  project_id            uuid NOT NULL REFERENCES judge_projects(id) ON DELETE CASCADE,
  status                text NOT NULL DEFAULT 'pending',
  scores                jsonb NOT NULL DEFAULT '{}',
  comments              jsonb NOT NULL DEFAULT '{}',
  total_score           integer,
  -- Xulosa maydonlari
  strengths             text,
  weaknesses            text,
  tech_risks            text,
  market_risks          text,
  business_model_issues text,
  team_assessment       text,
  improvements          text,
  pilot_feasibility     text,
  regional_relevance    text,
  next_steps            text,
  recommendation        text,
  justification         text,
  conflict_of_interest  boolean DEFAULT false,
  submitted_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE(judge_id, project_id)
);

CREATE INDEX IF NOT EXISTS je_judge_idx ON judge_evaluations(judge_id);
CREATE INDEX IF NOT EXISTS je_status_idx ON judge_evaluations(status);

-- ─── JUDGE REOPEN REQUESTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judge_reopen_requests (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  eval_id         uuid NOT NULL REFERENCES judge_evaluations(id) ON DELETE CASCADE,
  judge_id        uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  reason_type     text NOT NULL,
  reason          text NOT NULL,
  attachment_url  text,
  status          text NOT NULL DEFAULT 'pending',
  admin_response  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── JUDGE ISSUE REPORTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judge_issue_reports (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id        uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  project_id      uuid NOT NULL REFERENCES judge_projects(id) ON DELETE CASCADE,
  issue_type      text NOT NULL,
  description     text NOT NULL,
  attachment_url  text,
  status          text NOT NULL DEFAULT 'new',
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ─── JUDGE CONFLICT REPORTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judge_conflict_reports (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id    uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  project_id  uuid NOT NULL REFERENCES judge_projects(id) ON DELETE CASCADE,
  reason      text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(judge_id, project_id)
);

-- ─── JUDGE NOTIFICATIONS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS judge_notifications (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  judge_id    uuid NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
  type        text NOT NULL DEFAULT 'system',
  title       text NOT NULL,
  body        text NOT NULL,
  action_url  text,
  action_label text,
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jn_judge_idx ON judge_notifications(judge_id);

-- ─── DEMO MA'LUMOTLARI ───────────────────────────────────────────────────────
-- Demo hakam yaratish (login: hakam001, parol: Hakam@2026)
-- Parol hash: bcrypt of "Hakam@2026"
-- Bu faqat demo uchun. Haqiqiy hakamlar admin tomonidan yaratiladi.
