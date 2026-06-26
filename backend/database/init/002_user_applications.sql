-- User-specific applications table
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
  application_number text,
  admin_application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted',
  admin_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_applications_user_id_idx ON user_applications(user_id);
CREATE INDEX IF NOT EXISTS user_applications_created_at_idx ON user_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS user_applications_status_idx ON user_applications(status);
