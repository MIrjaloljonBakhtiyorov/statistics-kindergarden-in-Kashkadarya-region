CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS health_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  checked_at timestamptz NOT NULL DEFAULT now()
);
