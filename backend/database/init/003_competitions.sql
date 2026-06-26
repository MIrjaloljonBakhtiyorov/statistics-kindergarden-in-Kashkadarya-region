-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  year integer NOT NULL,
  description text NOT NULL,
  application_deadline date NOT NULL,
  current_stage text NOT NULL DEFAULT 'Tayyorlanmoqda',
  applications_count integer NOT NULL DEFAULT 0,
  responsible text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS competitions_year_idx ON competitions(year DESC);
CREATE INDEX IF NOT EXISTS competitions_status_idx ON competitions(status);
CREATE INDEX IF NOT EXISTS competitions_created_at_idx ON competitions(created_at DESC);
