-- Seed user (admin@esports.gg / admin123)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@esports.gg', '$2a$10$xPPPqYzP7Kf7kcYZ6bLOUeGFdJMKHnHNqFnGxNlFf5z8EGq5HlKy6', 'Admin', 'admin');

-- Seed teams (15+)
INSERT INTO teams (name, game, region, ranking, wins, losses, coach, founded_year, logo_url, description) VALUES
('Shadow Wolves', 'League of Legends', 'North America', 1, 42, 12, 'David Chen', 2018, NULL, 'Dominant NA force known for aggressive early-game strategies.'),
('Phoenix Rising', 'CS2', 'Europe', 2, 38, 15, 'Erik Johansson', 2019, NULL, 'European powerhouse with exceptional tactical depth.'),
('Dragon''s Breath', 'Valorant', 'Asia Pacific', 3, 35, 18, 'Takeshi Yamamoto', 2020, NULL, 'APAC champions with unmatched aim precision.'),
('Iron Fortress', 'Dota 2', 'CIS', 4, 33, 20, 'Alexei Petrov', 2017, NULL, 'Masters of late-game teamfight execution.'),
('Neon Strikers', 'Overwatch 2', 'South Korea', 5, 40, 14, 'Park Ji-hoon', 2019, NULL, 'Aggressive dive-comp specialists from Korea.'),
('Crimson Tide', 'League of Legends', 'Europe', 6, 30, 22, 'Lucas Fernandez', 2018, NULL, 'Methodical European roster focused on macro play.'),
('Arctic Storm', 'CS2', 'North America', 7, 28, 25, 'Michael Torres', 2020, NULL, 'Rising NA contender with strong AWP players.'),
('Void Walkers', 'Valorant', 'Europe', 8, 32, 21, 'Sophie Laurent', 2021, NULL, 'Creative European squad known for off-meta agent picks.'),
('Titan Esports', 'Dota 2', 'Southeast Asia', 9, 27, 26, 'Nguyen Van Minh', 2016, NULL, 'SEA veterans with deep hero pools.'),
('Celestial Gaming', 'Overwatch 2', 'North America', 10, 25, 28, 'Sarah Williams', 2020, NULL, 'Flexible NA roster excelling in control maps.'),
('Thunder Hawks', 'League of Legends', 'South Korea', 11, 36, 17, 'Kim Soo-jin', 2017, NULL, 'Korean powerhouse with world-class bot lane.'),
('Phantom Brigade', 'CS2', 'CIS', 12, 29, 24, 'Dmitry Volkov', 2019, NULL, 'CIS squad known for aggressive T-side strategies.'),
('Emerald Serpents', 'Valorant', 'Brazil', 13, 31, 22, 'Rafael Silva', 2021, NULL, 'Brazilian rising stars with incredible clutch potential.'),
('Solar Flare', 'Dota 2', 'China', 14, 34, 19, 'Li Wei', 2018, NULL, 'Chinese team famous for disciplined 4-protect-1 strats.'),
('Omega Force', 'Overwatch 2', 'Europe', 15, 26, 27, 'Hans Mueller', 2020, NULL, 'European squad specializing in bunker compositions.'),
('Nexus Gaming', 'League of Legends', 'China', 16, 37, 16, 'Zhang Hao', 2017, NULL, 'LPL contenders with explosive teamfighting.');

-- Seed players (15+)
INSERT INTO players (username, real_name, team_id, game, role, country, apm, accuracy, positioning_score, kda, winrate, avatar_url, bio) VALUES
('ShadowBlade', 'Marcus Johnson', 1, 'League of Legends', 'Mid Laner', 'USA', 310.50, 78.20, 85.00, 5.20, 68.50, NULL, 'Veteran mid laner known for assassin champions and roaming plays.'),
('PhoenixShot', 'Emil Larsson', 2, 'CS2', 'AWPer', 'Sweden', 180.00, 92.50, 90.50, 1.85, 62.30, NULL, 'One of the best AWPers in European CS2 with insane flick shots.'),
('DragonFist', 'Kenji Tanaka', 3, 'Valorant', 'Duelist', 'Japan', 250.75, 88.30, 82.00, 3.40, 65.80, NULL, 'Aggressive duelist player with exceptional entry fragging.'),
('IronGuard', 'Sergei Ivanov', 4, 'Dota 2', 'Position 1', 'Russia', 380.20, 72.10, 88.50, 6.10, 58.40, NULL, 'Hard carry specialist who excels at farming efficiency.'),
('NeonDash', 'Lee Min-ho', 5, 'Overwatch 2', 'DPS', 'South Korea', 400.00, 85.60, 92.30, 4.80, 72.10, NULL, 'Hitscan prodigy with the fastest reaction times in OWL.'),
('CrimsonBow', 'Pierre Dubois', 6, 'League of Legends', 'ADC', 'France', 295.30, 81.40, 78.90, 4.50, 55.20, NULL, 'Consistent ADC player with excellent teamfight positioning.'),
('FrostByte', 'Jake Morrison', 7, 'CS2', 'Entry Fragger', 'Canada', 220.10, 76.80, 71.20, 1.52, 48.90, NULL, 'Fearless entry fragger who creates space for the team.'),
('VoidStep', 'Amelie Renard', 8, 'Valorant', 'Controller', 'France', 195.40, 68.50, 93.70, 2.80, 61.40, NULL, 'Mastermind controller with exceptional smoke placements.'),
('TitanCrush', 'Pham Duc Anh', 9, 'Dota 2', 'Position 3', 'Vietnam', 350.80, 65.20, 86.40, 3.90, 52.70, NULL, 'Offlane specialist known for space creation and initiation.'),
('StarPulse', 'Emily Carter', 10, 'Overwatch 2', 'Support', 'USA', 280.60, 70.30, 95.10, 7.20, 53.80, NULL, 'Top-tier support with incredible game sense and callouts.'),
('ThunderLord', 'Kim Tae-yang', 11, 'League of Legends', 'Jungler', 'South Korea', 340.90, 74.60, 89.20, 5.80, 71.30, NULL, 'Aggressive jungler with dominant early-game pathing.'),
('PhantomAce', 'Ivan Kozlov', 12, 'CS2', 'Rifler', 'Ukraine', 210.30, 82.90, 80.50, 1.68, 56.10, NULL, 'Clutch rifler who consistently delivers in high-pressure rounds.'),
('EmeraldViper', 'Lucas Oliveira', 13, 'Valorant', 'Initiator', 'Brazil', 230.50, 79.70, 84.30, 3.10, 59.60, NULL, 'Creative initiator with flashy plays and excellent info gathering.'),
('SolarWind', 'Wang Jie', 14, 'Dota 2', 'Position 5', 'China', 290.40, 58.90, 91.80, 2.30, 64.20, NULL, 'Visionary support player known for ward mastery and saves.'),
('OmegaShield', 'Felix Braun', 15, 'Overwatch 2', 'Tank', 'Germany', 320.70, 62.40, 87.60, 3.50, 49.50, NULL, 'Aggressive main tank with excellent shield management.'),
('NexusFire', 'Chen Xiao', 16, 'League of Legends', 'Top Laner', 'China', 305.20, 76.80, 83.10, 4.10, 69.80, NULL, 'Split-push specialist with deep champion pool.'),
('BlazeRunner', 'Tom Harris', 1, 'League of Legends', 'ADC', 'USA', 285.40, 83.70, 79.50, 4.90, 67.20, NULL, 'Mechanically gifted ADC with exceptional kiting.'),
('IceVenom', 'Anna Petrova', 2, 'CS2', 'IGL', 'Russia', 175.60, 71.20, 88.90, 1.45, 61.80, NULL, 'Brilliant IGL with unmatched tactical knowledge.');

-- Seed tournaments (15+)
INSERT INTO tournaments (name, game, start_date, end_date, prize_pool, location, status, organizer, format, max_teams, description) VALUES
('World Championship 2025', 'League of Legends', '2025-10-01', '2025-11-05', 2500000.00, 'Seoul, South Korea', 'completed', 'Riot Games', 'Double Elimination', 24, 'The premier League of Legends international tournament.'),
('CS2 Major: Berlin', 'CS2', '2025-11-10', '2025-11-24', 1250000.00, 'Berlin, Germany', 'completed', 'ESL', 'Swiss System + Playoffs', 24, 'Tier 1 CS2 Major with the best teams worldwide.'),
('Valorant Champions Tour', 'Valorant', '2025-08-15', '2025-09-10', 1000000.00, 'Los Angeles, USA', 'completed', 'Riot Games', 'Double Elimination', 16, 'The pinnacle of competitive Valorant.'),
('The International 14', 'Dota 2', '2025-10-15', '2025-10-29', 15000000.00, 'Seattle, USA', 'completed', 'Valve', 'Group Stage + Double Elim', 20, 'Dota 2s biggest annual tournament with crowd-funded prize pool.'),
('Overwatch Champions Series', 'Overwatch 2', '2025-09-01', '2025-09-21', 500000.00, 'Tokyo, Japan', 'completed', 'Blizzard', 'Round Robin + Playoffs', 12, 'Global Overwatch 2 championship series.'),
('Spring Split 2026', 'League of Legends', '2026-01-15', '2026-04-10', 400000.00, 'Online / Regional', 'ongoing', 'Riot Games', 'Best of 3 League', 10, 'Regional spring season for LoL competitive leagues.'),
('CS2 RMR Spring', 'CS2', '2026-03-01', '2026-03-15', 200000.00, 'Katowice, Poland', 'ongoing', 'ESL', 'Swiss System', 16, 'Regional Major Ranking qualifier event.'),
('VCT Masters Shanghai', 'Valorant', '2026-04-20', '2026-05-05', 750000.00, 'Shanghai, China', 'upcoming', 'Riot Games', 'Double Elimination', 12, 'Mid-season international Valorant event.'),
('DPC Spring Tour', 'Dota 2', '2026-02-01', '2026-03-30', 500000.00, 'Online / Regional', 'ongoing', 'Valve', 'Round Robin', 8, 'Dota Pro Circuit regional league matches.'),
('OW Champions Series Spring', 'Overwatch 2', '2026-05-10', '2026-05-25', 300000.00, 'London, UK', 'upcoming', 'Blizzard', 'Group Stage + Playoffs', 10, 'Spring installment of the OW championship.'),
('Mid-Season Invitational', 'League of Legends', '2026-05-15', '2026-06-01', 600000.00, 'Paris, France', 'upcoming', 'Riot Games', 'Play-In + Groups + Knockout', 13, 'International LoL tournament between split champions.'),
('CS2 Major: Copenhagen', 'CS2', '2026-06-15', '2026-06-29', 1250000.00, 'Copenhagen, Denmark', 'upcoming', 'PGL', 'Swiss System + Playoffs', 24, 'Second CS2 Major of 2026.'),
('VCT Masters Bangkok', 'Valorant', '2026-07-10', '2026-07-25', 750000.00, 'Bangkok, Thailand', 'upcoming', 'Riot Games', 'Double Elimination', 12, 'Second Masters event of VCT 2026 season.'),
('ESL Pro League Season 21', 'CS2', '2026-03-20', '2026-04-15', 850000.00, 'Malta', 'ongoing', 'ESL', 'Round Robin + Playoffs', 24, 'Premier CS2 league with top teams globally.'),
('Dreamhack Summer Open', 'Valorant', '2026-06-01', '2026-06-08', 150000.00, 'Jonkoping, Sweden', 'upcoming', 'Dreamhack', 'Single Elimination', 16, 'Open-bracket Valorant tournament at Dreamhack.'),
('Asia Championship', 'Dota 2', '2026-08-01', '2026-08-15', 400000.00, 'Singapore', 'upcoming', 'PGL', 'Double Elimination', 12, 'Asian Dota 2 championship featuring top SEA and CN teams.');

-- Seed matches (15+)
INSERT INTO matches (team1_id, team2_id, tournament_id, match_date, score_team1, score_team2, map, duration_minutes, winner_id, vod_url, notes) VALUES
(1, 6, 1, '2025-10-05 14:00:00', 3, 1, 'Summoner''s Rift', 142, 1, NULL, 'Shadow Wolves dominated early game in all wins.'),
(2, 7, 2, '2025-11-12 16:00:00', 16, 12, 'Inferno', 38, 2, NULL, 'PhoenixShot had a monster AWP game with 28 kills.'),
(3, 8, 3, '2025-08-20 18:00:00', 13, 9, 'Ascent', 35, 3, NULL, 'Dragon''s Breath dominated the attacking half.'),
(4, 9, 4, '2025-10-18 12:00:00', 2, 1, 'N/A', 95, 4, NULL, 'Iron Fortress secured Roshan at key moments.'),
(5, 10, 5, '2025-09-05 20:00:00', 3, 2, 'Ilios', 48, 5, NULL, 'Neon Strikers won a nail-biting control map series.'),
(11, 1, 1, '2025-10-20 15:00:00', 3, 2, 'Summoner''s Rift', 178, 11, NULL, 'Thunder Hawks edged out Shadow Wolves in a 5-game thriller.'),
(12, 2, 2, '2025-11-18 14:00:00', 16, 14, 'Mirage', 42, 12, NULL, 'Phantom Brigade won in overtime with a clutch 1v3.'),
(13, 3, 3, '2025-09-02 17:00:00', 13, 11, 'Haven', 40, 13, NULL, 'Emerald Serpents pulled off incredible retakes.'),
(14, 4, 4, '2025-10-22 13:00:00', 2, 0, 'N/A', 68, 14, NULL, 'Solar Flare executed flawless 4-protect-1 strategy.'),
(15, 5, 5, '2025-09-15 19:00:00', 3, 1, 'King''s Row', 42, 5, NULL, 'Neon Strikers dominated with dive comp.'),
(6, 11, 6, '2026-02-10 16:00:00', 1, 2, 'Summoner''s Rift', 72, 11, NULL, 'Thunder Hawks secured crucial baron to close game 3.'),
(7, 12, 7, '2026-03-05 15:00:00', 9, 16, 'Dust 2', 35, 12, NULL, 'Phantom Brigade showed strong CT-side dominance.'),
(1, 16, 6, '2026-02-20 18:00:00', 2, 1, 'Summoner''s Rift', 85, 1, NULL, 'Shadow Wolves won a back-and-forth series.'),
(8, 13, 14, '2026-03-22 20:00:00', 13, 7, 'Bind', 30, 8, NULL, 'Void Walkers controlled every round with smokes.'),
(9, 14, 9, '2026-02-15 11:00:00', 1, 2, 'N/A', 78, 14, NULL, 'Solar Flare outplayed Titan Esports in late game.'),
(10, 15, 10, '2026-05-12 17:00:00', 2, 3, 'Numbani', 52, 15, NULL, 'Omega Force defense held strong on final map.');

-- Seed training schedules (15+)
INSERT INTO training_schedules (player_id, title, description, scheduled_date, duration_minutes, focus_area, intensity, status, coach_notes) VALUES
(1, 'Assassin Mechanics Drill', 'Practice Zed, Akali, and LeBlanc combos in practice tool.', '2026-03-21', 120, 'Mechanics', 'high', 'planned', 'Focus on one-shot combo timing windows.'),
(2, 'AWP Flick Training', 'Aimbotz and workshop flick shot maps for 2 hours.', '2026-03-21', 120, 'Aim', 'high', 'planned', 'Track flick accuracy % over sessions.'),
(3, 'Site Execute Drills', 'Practice Jett dash entries and trade setups on Ascent.', '2026-03-22', 90, 'Strategy', 'medium', 'planned', 'Coordinate with controller for smoke timings.'),
(4, 'Last Hit Practice', 'Free farm drills with Anti-Mage and Phantom Assassin.', '2026-03-22', 60, 'Mechanics', 'low', 'planned', 'Target 80+ CS at 10 minutes consistently.'),
(5, 'Aim Arena Warmup', 'Custom game aim duels and tracking drills.', '2026-03-20', 90, 'Aim', 'medium', 'completed', 'Great improvement on tracking accuracy.'),
(6, 'Teamfight Positioning VOD', 'Review 5 recent teamfights focusing on ADC positioning.', '2026-03-20', 60, 'Game Sense', 'low', 'completed', 'Identified pattern of overstepping forward.'),
(7, 'Retake Scenarios', 'Practice 2v3 and 2v4 retake strats on Mirage and Inferno.', '2026-03-23', 90, 'Strategy', 'high', 'planned', 'Work on post-plant molotov lineups.'),
(8, 'Smoke Lineup Workshop', 'Learn and practice new smoke lineups for Lotus and Breeze.', '2026-03-23', 120, 'Strategy', 'medium', 'planned', 'Document all new lineups with screenshots.'),
(9, 'Offlane Matchup Study', 'Analyze top 5 offlane heroes and their lane matchups.', '2026-03-24', 75, 'Game Sense', 'low', 'planned', 'Prepare counter-picks for expected meta.'),
(10, 'Ana Nano Boost Timing', 'Practice optimal nano boost timing on dive targets in scrims.', '2026-03-24', 90, 'Game Sense', 'medium', 'planned', 'Track nano efficiency rate in each scrim map.'),
(11, 'Jungle Pathing Optimization', 'Analyze and practice 3 different jungle routes per side.', '2026-03-19', 120, 'Strategy', 'high', 'completed', 'Shaved 15 seconds off first clear time.'),
(12, 'Spray Control Workshop', 'AK-47 and M4A4 spray patterns at various ranges.', '2026-03-25', 60, 'Aim', 'medium', 'planned', 'Focus on long-range spray transfers.'),
(13, 'Sova Arrow Lineups', 'Master recon dart lineups for all competitive maps.', '2026-03-25', 90, 'Strategy', 'medium', 'planned', 'Priority on Bind and Haven lineups.'),
(14, 'Warding Strategy Session', 'Review optimal ward placements for current meta.', '2026-03-19', 45, 'Game Sense', 'low', 'completed', 'Excellent understanding of vision control.'),
(15, 'Shield Management Drills', 'Practice resource management with Reinhardt and Sigma.', '2026-03-26', 90, 'Mechanics', 'high', 'planned', 'Focus on barrier uptime during team engages.'),
(1, 'Team Scrim Block', 'Full 5v5 scrimmage with focus on mid-jungle synergy.', '2026-03-26', 180, 'Teamwork', 'high', 'planned', 'Record comms for post-scrim review.'),
(5, 'VOD Review - OWL Finals', 'Study Grand Finals VODs for meta compositions.', '2026-03-21', 60, 'Game Sense', 'low', 'planned', 'Note any unconventional comp choices.');
