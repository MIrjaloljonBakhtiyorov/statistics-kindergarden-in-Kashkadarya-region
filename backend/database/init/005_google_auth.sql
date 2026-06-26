
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id text,
  ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS profile_status text NOT NULL DEFAULT 'incomplete';

CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id) WHERE google_id IS NOT NULL;

-- express-session uchun sessions jadvali (connect-pg-simple)
CREATE TABLE IF NOT EXISTS sessions (
  sid varchar NOT NULL COLLATE "default" PRIMARY KEY,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions(expire);
