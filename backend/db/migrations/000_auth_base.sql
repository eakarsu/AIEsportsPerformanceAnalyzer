CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_logs (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL,
  sleep_hours NUMERIC(4,1),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  mood VARCHAR(50),
  burnout_risk_analysis TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  analysis_type VARCHAR(100),
  entity_id INTEGER,
  entity_type VARCHAR(50),
  content TEXT,
  model VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
