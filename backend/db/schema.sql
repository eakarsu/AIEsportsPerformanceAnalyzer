-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS training_schedules CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'analyst',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Teams table (created before players since players reference teams)
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  game VARCHAR(100),
  region VARCHAR(100),
  ranking INTEGER,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  coach VARCHAR(255),
  founded_year INTEGER,
  logo_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  real_name VARCHAR(255),
  team_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  game VARCHAR(100),
  role VARCHAR(100),
  country VARCHAR(100),
  apm DECIMAL(10,2),
  accuracy DECIMAL(5,2),
  positioning_score DECIMAL(5,2),
  kda DECIMAL(5,2),
  winrate DECIMAL(5,2),
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  game VARCHAR(100),
  start_date DATE,
  end_date DATE,
  prize_pool DECIMAL(15,2),
  location VARCHAR(255),
  status VARCHAR(50) DEFAULT 'upcoming',
  organizer VARCHAR(255),
  format VARCHAR(100),
  max_teams INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  team1_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  team2_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE SET NULL,
  match_date TIMESTAMP,
  score_team1 INTEGER,
  score_team2 INTEGER,
  map VARCHAR(100),
  duration_minutes INTEGER,
  winner_id INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  vod_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Training schedules table
CREATE TABLE training_schedules (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE,
  duration_minutes INTEGER,
  focus_area VARCHAR(100),
  intensity VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'planned',
  coach_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
