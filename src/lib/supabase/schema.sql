-- ============================================
-- Manthan Tech Fest - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL CHECK (category IN ('technical', 'cultural', 'sports')),
  fee INTEGER NOT NULL DEFAULT 0, -- fee in paise (INR * 100)
  fee_calculation TEXT NOT NULL DEFAULT 'per_team' CHECK (fee_calculation IN ('per_team', 'per_participant')),
  max_participants INTEGER DEFAULT 200,
  current_participants INTEGER DEFAULT 0,
  event_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  venue TEXT NOT NULL,
  rules TEXT[],
  prize_text TEXT,
  prize_winner INTEGER,
  prize_runner_up INTEGER,
  prize_second_runner_up INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  team_size INTEGER DEFAULT 1, -- 1 = individual
  team_size_fixed INTEGER,
  team_size_min INTEGER,
  team_size_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REGISTRATIONS TABLE
-- ============================================
CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  year TEXT,
  department TEXT,
  event_ids UUID[] NOT NULL,
  team_registrations JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount INTEGER NOT NULL, -- in paise
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
  payment_method TEXT CHECK (payment_method IN ('razorpay', 'cash')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  cash_amount INTEGER,
  cash_received_by TEXT,
  cash_received_at TIMESTAMPTZ,
  cash_receipt_number TEXT,
  cash_notes TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  qr_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward-compatible migration for existing deployments
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('razorpay', 'cash'));
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cash_amount INTEGER;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cash_received_by TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cash_received_at TIMESTAMPTZ;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cash_receipt_number TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS cash_notes TEXT;

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
-- Uses Supabase Auth. This table maps auth users to admin roles.
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RATE LIMITING TABLE
-- ============================================
CREATE TABLE rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MANUAL CASH ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS manual_cash_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  payer_name TEXT NOT NULL,
  payer_phone TEXT,
  payer_email TEXT,
  amount INTEGER NOT NULL,
  receipt_number TEXT,
  notes TEXT,
  collected_by TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Events: Public read, admin-only write
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'admin')
  );

-- Registrations: Service role only for inserts, admins can read/update
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view registrations"
  ON registrations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Service role can insert registrations"
  ON registrations FOR INSERT
  WITH CHECK (true); -- Controlled via service role key on backend

CREATE POLICY "Admins can update registrations"
  ON registrations FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Admin users: Only admins can manage
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Rate limits: Service role only
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

ALTER TABLE manual_cash_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view manual cash entries"
  ON manual_cash_entries FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Admins and staff can insert manual cash entries"
  ON manual_cash_entries FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ============================================
-- INDEXES & PERFORMANCE OPTIMIZATION
-- ============================================
CREATE INDEX idx_registrations_ticket_id ON registrations(ticket_id);
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_payment_status ON registrations(payment_status);
CREATE INDEX idx_registrations_razorpay_order_id ON registrations(razorpay_order_id);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_rate_limits_ip_endpoint ON rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_manual_cash_entries_collected_at ON manual_cash_entries(collected_at DESC);

-- GIN Indexes for complex JSON / Array data queries
CREATE INDEX IF NOT EXISTS idx_registrations_event_ids ON registrations USING GIN (event_ids);
CREATE INDEX IF NOT EXISTS idx_registrations_team_data ON registrations USING GIN (team_registrations);

-- ============================================
-- EXPORT VIEWS FOR DATA ANALYTICS & SPREADSHEETS
-- ============================================
CREATE OR REPLACE VIEW organized_event_registrations_export WITH (security_invoker = true) AS
SELECT 
    e.category AS event_category,
    e.name AS event_name,
    r.ticket_id,
    r.name AS lead_participant_name,
    r.email AS lead_email,
    r.phone AS lead_phone,
    r.college,
    r.department,
    r.year,
    r.payment_status,
    r.payment_method,
    r.total_amount,
    r.created_at AS registration_date,
    tr.team_name,
    tr.team_size,
    (
        SELECT string_agg(m->>'name', ', ') 
        FROM jsonb_array_elements(tr.team_data->'members') AS m
    ) AS other_team_members,
    r.checked_in
FROM registrations r
CROSS JOIN LATERAL unnest(r.event_ids) AS eid(event_id)
JOIN events e ON e.id = eid.event_id
LEFT JOIN LATERAL (
    SELECT 
        t->>'team_name' AS team_name,
        (t->>'team_size')::int AS team_size,
        t AS team_data
    FROM jsonb_array_elements(
        CASE 
            WHEN jsonb_typeof(r.team_registrations) = 'array' THEN r.team_registrations 
            ELSE '[]'::jsonb 
        END
    ) AS t
    WHERE (t->>'event_id')::uuid = eid.event_id
) tr ON true;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_manual_cash_entries_updated_at ON manual_cash_entries;
CREATE TRIGGER update_manual_cash_entries_updated_at
  BEFORE UPDATE ON manual_cash_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment participant count
CREATE OR REPLACE FUNCTION increment_participant_count(event_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA - Sample Events
-- ============================================
INSERT INTO events (name, slug, description, category, fee, event_date, venue, rules, team_size) VALUES
-- Technical Events
('Prompt2Website: The Vibe Coding Challenge', 'prompt2website-the-vibe-coding-challenge', 'AI Website Building challenge. Turn prompts into powerful websites with solo participation.', 'technical', 5000, '2026-03-15 10:00:00+05:30', 'Computer Lab 1', ARRAY['Each participant must build a website based on the given problem statement within 1 hour.', 'Internet access is allowed.', 'Use of AI tools (ChatGPT, GitHub Copilot, etc.) is allowed.', 'Participants may use any programming language or technology stack.', 'Pre-built full projects, GitHub cloning, or previously developed projects are strictly not allowed.', 'The website must be developed completely during the competition time.', 'After completion, each participant must present their project for 2–3 minutes.', 'Judges may ask questions regarding code, logic, and functionality.', 'If a participant is unable to explain their code properly, marks will be reduced.', 'The decision of judges will be final and binding.', 'Participation: Solo participants only.', 'Duration: 1 hour.'], 1),
('TypeSprint: The Ultimate Typing Showdown', 'typesprint-the-ultimate-typing-showdown', 'Typing Competition event focused on speed and precision. Fast fingers. Faster victory.', 'technical', 5000, '2026-03-16 09:00:00+05:30', 'Computer Lab 2', ARRAY['The typing test will be conducted using organizer-selected typing software.', 'Each participant will get only one attempt to complete the test.', 'Participants must type the given text exactly as shown on the screen.', 'The use of mobile phones, external help, or unfair means is strictly prohibited.', 'Participants must use the keyboard and system provided by the organizers (or assigned system).', 'The final score will be based on Typing Speed (WPM) and Accuracy (%).', 'In case of a tie, the participant with higher accuracy will be given preference.', 'Participants must follow all instructions given by the event coordinators.', 'Any form of misconduct may lead to disqualification.', 'The decision of the organizers will be final.', 'Participation: Solo participants only.', 'Duration: 1-2 hours.'], 1),
('QuizStorm: Battle of Brains', 'quizstorm-battle-of-brains', 'A competitive quiz event designed to test knowledge, speed, logic, and presence of mind in a fun and engaging format.', 'technical', 4000, '2026-03-15 12:30:00+05:30', 'Computer Lab 2', ARRAY['Participation is open to all students in Solo and Duo categories.', 'Entry fee: Solo ₹40, Duo ₹80 (calculated at ₹40 per participant).', 'Duration: 1-2 hours.', 'The quiz consists of 3 rounds: Round 1 (Elimination), Round 2 (Score Based), Round 3 (Final Showdown).', 'Round 1 – Brand Vision (Logo Identification): identify logos of tech companies and popular brands; top 50% qualify for Round 2.', 'Round 2 – Rapid Recall (Rapid Fire): each participant gets 60 seconds to answer maximum questions; pass is allowed; top scorers move to Final Round.', 'Round 3 – Final Face-Off (Guess the Image): identify personalities, gadgets, apps, products, or technologies from images; tie-breaker question in case of tie.', 'Judging criteria: total score across rounds, accuracy of answers, and final round performance.', 'Solo and Duo quiz events will be conducted separately with different sets of questions.'], 2),
('CanvaCraft: The Poster Design Challenge', 'canvacraft-the-poster-design-challenge', 'Poster Designing (Canva) event where participants create a theme-based A4 poster within 90 minutes.', 'technical', 4900, '2026-03-16 04:00:00+05:30', 'Computer Lab 1', ARRAY['Individual participation only.', 'Entry fee: ₹49 / ₹99 as per organizer category.', 'Duration: 90 minutes.', 'Each participant can submit only one poster.', 'The design must be created using Canva only.', 'Participants may use online resources and AI tools for design assistance.', 'Pre-defined Canva templates are not allowed.', 'The theme will be announced on the spot.', 'Copying from other participants will lead to disqualification.', 'Poster specification: Rectangle layout.', 'Poster size: A4 (2480 × 3508 px).', 'Accepted file formats: PNG / JPG.', 'Marking scheme (30 marks): Creativity and Innovation (10), Relevance to Theme (10), Color Combination & Layout (5), Typography & Clarity (5).'], 1),

-- Cultural Events
('NrityaVerse', 'nrityaverse', 'Dance competition where tradition meets limitless expression.', 'cultural', 20000, '2026-03-15 18:00:00+05:30', 'Main Stage', ARRAY['Individual performance (Solo) and Group performance with 4-6 participants.', 'Entry fee: ₹200 (Solo) / ₹400 (Group).', 'Duration: 2-6 minutes.', 'Any dance style allowed.', 'Props allowed (optional).', 'Participants must submit their music in advance.', 'Participants must report 30 minutes before their event.', 'Judges’ decision will be final and binding.', 'Any inappropriate content will lead to disqualification.', 'Prize: Solo – Winner ₹2000, Runner-up ₹1000; Group – Winner ₹3000, Runner-up ₹1000.'], 6),
('SurTarang', 'surtarang', 'Singing competition where participants ride the waves of melody.', 'cultural', 20000, '2026-03-16 15:00:00+05:30', 'Seminar Hall', ARRAY['Participation: Solo and Group participants.', 'Entry fee: ₹200 (Solo) / ₹400 (Group).', 'Duration: 3-4 minutes.', 'Any language allowed.', 'Participants must bring their own instruments if required.', 'Karaoke tracks must be submitted prior to the event.', 'Group must have minimum 3 and maximum 8 members.', 'Judges’ decision will be final and binding.', 'Prize: Solo – Winner ₹1000 | Group – Winner ₹2000.'], 8),

-- Sports Events
('Badminton', 'badminton', 'Outdoor badminton event under Manthan Sports Committee.', 'sports', 10000, '2026-03-15 09:00:00+05:30', 'Sports Court', ARRAY['Service must be underarm.', 'Shuttle must be below the waist.', 'Both feet must stay inside the service court.', 'If player''s score is even (0,2,4…) serve from right side.', 'If score is odd (1,3,5…) serve from left side.', 'Fault: shuttle lands outside boundary line.', 'Fault: shuttle hits net and does not cross.', 'Fault: player touches the net.', 'Fault: shuttle touches player''s body.', 'Fault: double hit or illegal stroke.'], 1),
('Box Cricket', 'box-cricket', 'Box cricket tournament under Manthan Sports Committee.', 'sports', 30000, '2026-03-15 08:00:00+05:30', 'Cricket Ground', ARRAY['Team size: 6 to 8 players.', 'Only 6 players are allowed on the field at a time.', 'Minimum 5 players are required to start the match.', 'Substitutions are allowed only between overs with umpire permission.', 'Match format: 5 to 10 overs per side as decided before match.', 'Each bowler can bowl max 1 over in a 5-over match or 2 overs in a 10-over match.', 'Underarm or overarm bowling is allowed as per tournament rule.', 'Free hit is applicable for no-balls if tournament rule applies.', 'Toss decides batting or bowling; visiting team calls toss.', 'Toss decision cannot be changed after toss.', 'All players must bat unless team is all out.', 'Batting order must be declared before match.', 'Dismissals: bowled, caught, run out, stumped, hit wicket.', 'Retired batsman cannot bat again unless injured-rule exception applies.', 'No-ball for overstepping crease.', 'Wide declared if ball is unreachable by batsman.', 'Maximum 1 bouncer per over if overarm bowling is allowed.', 'Change of bowler only after over completion.', 'All fielders must remain inside boundary.', 'Runs as per normal cricket rules; side net direct hit can be counted as 1 run as per local rule.', 'Back net without bounce can be counted as 6 runs if tournament rule applies.', 'Overthrow runs are allowed.', 'No-ball: 1 extra run + free hit if applicable.', 'Wide: 1 extra run + re-ball.', 'Powerplay/field restrictions/max-runs-per-over may apply if announced.', 'Match starts at scheduled time; delays can reduce overs.', 'Maximum 5 minutes break between innings.', 'Umpire decision is final and binding.', 'Misconduct/abusive language can lead to suspension or penalty.', 'Damage to property results in penalty.', 'Tie-breaker can be Super Over, then maximum boundaries rule if still tied.', 'Proper sports shoes are mandatory; no sharp objects allowed on field.', 'Players participate at their own risk.', 'Organizer/committee may modify rules before match and resolves disputes.'], 8),
('Volleyball', 'volleyball', 'Volleyball competition under Manthan Sports Committee.', 'sports', 25000, '2026-03-16 08:00:00+05:30', 'Volleyball Court', ARRAY['Team event', 'Standard volleyball rules apply', 'Teams must be present before fixture time', 'Organizers may reschedule based on weather'], 8),
('Tug of war', 'tug-of-war', 'Tug of war challenge under Manthan Sports Committee.', 'sports', 20000, '2026-03-16 10:00:00+05:30', 'Main Ground', ARRAY['Team size: 8 players per team.', 'Two teams compete against each other.', 'College ID is compulsory for all participants.', 'A long rope is used with a centre mark aligned over the ground center line.', 'Objective: pull the opposing team so the centre mark crosses your side boundary line.', 'Players hold the rope with hands only.', 'Teams start pulling only on referee signal.', 'Foul: sitting or lying down while pulling.', 'Foul: wrapping rope around body or arm.', 'Foul: sudden jerks before signal.', 'Foul: using gloves.'], 10),
('Chess', 'chess', 'Chess tournament under Manthan Sports Committee.', 'sports', 5000, '2026-03-15 11:00:00+05:30', 'Indoor Hall', ARRAY['Individual event', 'Rapid format unless stated otherwise', 'Touch-move rule applies', 'Unsportsmanlike behavior leads to disqualification'], 1),
('Carrom', 'carrom', 'Carrom tournament under Manthan Sports Committee.', 'sports', 5000, '2026-03-15 12:00:00+05:30', 'Indoor Hall', ARRAY['Individual event', 'Standard board and striker rules apply', 'Best-of format decided by organizers', 'Fouls as per standard rules'], 1),
('Ludo', 'ludo', 'Ludo competition under Manthan Sports Committee.', 'sports', 3000, '2026-03-16 11:00:00+05:30', 'Indoor Hall', ARRAY['Individual event', 'Standard ludo rules apply', 'Fair play is mandatory', 'Organizer decisions are binding'], 1),
('E-Sports', 'e-sports', 'E-Sports competition under Manthan Sports Committee.', 'sports', 10000, '2026-03-16 12:00:00+05:30', 'E-Sports Arena', ARRAY['Individual event', 'Game title and format announced by committee', 'Use only approved devices and accounts', 'Cheating leads to immediate disqualification'], 1);
