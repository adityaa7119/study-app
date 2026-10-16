-- StudyBuddy Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_seed TEXT NOT NULL DEFAULT 'studybuddy',
  target_exam TEXT NOT NULL DEFAULT 'JEE',
  daily_target_hours INTEGER NOT NULL DEFAULT 6,
  exam_date DATE,
  streak_count INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  credit_points INTEGER NOT NULL DEFAULT 100,
  total_focus_minutes INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'History', 'Other')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own schedules"
  ON schedules FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_schedules_user_week ON schedules(user_id, week_start_date);

-- ============================================================
-- TABLE: focus_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  actual_minutes INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  quit_early BOOLEAN NOT NULL DEFAULT FALSE,
  penalty_points INTEGER NOT NULL DEFAULT 0,
  tab_switches INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own focus sessions"
  ON focus_sessions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_focus_sessions_user_date ON focus_sessions(user_id, started_at);

-- ============================================================
-- TABLE: quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('daily', 'weekly', 'duel', 'practice')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Quizzes are readable by all authenticated users
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read quizzes"
  ON quizzes FOR SELECT TO authenticated USING (true);

-- ============================================================
-- TABLE: quiz_attempts
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER NOT NULL DEFAULT 0,
  credits_wagered INTEGER NOT NULL DEFAULT 0,
  credits_won INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own quiz attempts"
  ON quiz_attempts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id, completed_at DESC);

-- ============================================================
-- TABLE: notes (library resources)
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  content TEXT NOT NULL,
  note_type TEXT NOT NULL CHECK (note_type IN ('markdown', 'formula', 'concept', 'summary')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read notes"
  ON notes FOR SELECT TO authenticated USING (true);

CREATE INDEX idx_notes_subject ON notes(subject);

-- ============================================================
-- TABLE: transactions (credit ledger)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive = credit, negative = debit
  balance_after INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (
    transaction_type IN (
      'quiz_win', 'quiz_wager_loss', 'focus_complete', 'focus_quit_penalty',
      'streak_bonus', 'daily_login', 'redeem_item', 'admin_credit'
    )
  ),
  reference_id UUID, -- optional FK to quiz_attempt or focus_session
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own transactions"
  ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own transactions"
  ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);

-- ============================================================
-- FUNCTION: handle_new_user (auto-create profile on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  -- Give 100 welcome credits
  INSERT INTO public.transactions (user_id, amount, balance_after, description, transaction_type)
  VALUES (NEW.id, 100, 100, 'Welcome bonus', 'admin_credit');
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- SEED: Sample quiz data
-- ============================================================
INSERT INTO quizzes (title, subject, quiz_type, difficulty, questions) VALUES
(
  'Physics Daily Quiz',
  'Physics',
  'daily',
  'medium',
  '[
    {"id":"q1","text":"What is the SI unit of force?","options":["Newton","Joule","Pascal","Watt"],"correct":0,"explanation":"Force is measured in Newtons (N), named after Sir Isaac Newton. F = ma"},
    {"id":"q2","text":"Which of the following is NOT a vector quantity?","options":["Displacement","Velocity","Speed","Acceleration"],"correct":2,"explanation":"Speed is a scalar quantity (magnitude only). Displacement, velocity, and acceleration are vectors."},
    {"id":"q3","text":"A body moving with uniform velocity has:","options":["Zero acceleration","Non-zero net force","Increasing momentum","Changing direction"],"correct":0,"explanation":"Uniform velocity means constant speed and direction, so acceleration = 0 and net force = 0."},
    {"id":"q4","text":"The work done by a force is maximum when the angle between force and displacement is:","options":["0°","45°","90°","180°"],"correct":0,"explanation":"W = Fd·cosθ. When θ=0°, cos0°=1, giving maximum work."},
    {"id":"q5","text":"Which law states that energy can neither be created nor destroyed?","options":["Newton''s first law","Law of conservation of energy","Ohm''s law","Boyle''s law"],"correct":1,"explanation":"The law of conservation of energy states total energy of an isolated system remains constant."}
  ]'
),
(
  'Chemistry Weekly Mock',
  'Chemistry',
  'weekly',
  'hard',
  '[
    {"id":"q1","text":"What is the electronic configuration of Iron (Fe, Z=26)?","options":["[Ar] 3d⁶ 4s²","[Ar] 3d⁸","[Kr] 3d⁶ 4s²","[Ar] 4s² 3d⁶"],"correct":0,"explanation":"Fe: [Ar] 3d⁶ 4s². The 3d orbitals fill after 4s but are written before 4s in the noble gas configuration."},
    {"id":"q2","text":"Which of the following is an example of a Lewis acid?","options":["NH₃","H₂O","BF₃","OH⁻"],"correct":2,"explanation":"BF₃ is a Lewis acid because it can accept an electron pair due to the empty p orbital on boron."},
    {"id":"q3","text":"The IUPAC name of CH₃-CH₂-CHO is:","options":["Propanal","Propanol","Propanone","Propenal"],"correct":0,"explanation":"CHO is an aldehyde group. 3-carbon chain with aldehyde = Propanal."},
    {"id":"q4","text":"What type of hybridization is present in ethene (C₂H₄)?","options":["sp","sp²","sp³","sp³d"],"correct":1,"explanation":"Each carbon in ethene forms a double bond: one σ (sp²) and one π (p orbital overlap). Hence sp² hybridization."},
    {"id":"q5","text":"The pH of a 0.001 M HCl solution is:","options":["1","2","3","4"],"correct":2,"explanation":"[H⁺] = 0.001 = 10⁻³ M. pH = -log[H⁺] = -log(10⁻³) = 3."}
  ]'
),
(
  'Math Rapid Duel',
  'Mathematics',
  'duel',
  'medium',
  '[
    {"id":"q1","text":"If f(x) = x² + 3x + 2, find f(-1).","options":["0","2","-2","6"],"correct":0,"explanation":"f(-1) = (-1)² + 3(-1) + 2 = 1 - 3 + 2 = 0"},
    {"id":"q2","text":"What is the value of sin(30°)?","options":["√3/2","1/2","√2/2","1"],"correct":1,"explanation":"sin(30°) = 1/2. Remember: sin(0°)=0, sin(30°)=1/2, sin(45°)=√2/2, sin(60°)=√3/2, sin(90°)=1"},
    {"id":"q3","text":"The derivative of sin(x) is:","options":["cos(x)","-cos(x)","tan(x)","-sin(x)"],"correct":0,"explanation":"d/dx[sin(x)] = cos(x). This is a fundamental derivative."},
    {"id":"q4","text":"What is 7 mod 3?","options":["1","2","3","0"],"correct":0,"explanation":"7 ÷ 3 = 2 remainder 1. So 7 mod 3 = 1."},
    {"id":"q5","text":"The sum of first n natural numbers is:","options":["n(n+1)/2","n(n-1)/2","n²","(n+1)²/2"],"correct":0,"explanation":"1+2+3+...+n = n(n+1)/2. This is Gauss's formula."}
  ]'
);

-- ============================================================
-- SEED: Sample notes/library
-- ============================================================
INSERT INTO notes (title, subject, chapter, tags, content, note_type, is_pinned) VALUES
(
  'Newton''s Laws of Motion',
  'Physics',
  'Laws of Motion',
  ARRAY['mechanics','newton','force','inertia'],
  '## Newton''s Three Laws of Motion

### First Law (Law of Inertia)
An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction **unless acted upon by an unbalanced force**.

> **Key concept**: Inertia is the resistance of an object to change its state of motion.

### Second Law (F = ma)
The acceleration of an object depends on the **net force** acting on it and its **mass**.

$$F = ma$$

- F = net force (Newtons)
- m = mass (kg)
- a = acceleration (m/s²)

### Third Law (Action-Reaction)
For every action, there is an **equal and opposite reaction**.

$$F_{12} = -F_{21}$$

### Applications
- Rocket propulsion (3rd law)
- Seat belts (1st law)
- Pushing a car (2nd law)',
  'markdown',
  TRUE
),
(
  'Key Physics Formulas',
  'Physics',
  'Formula Sheet',
  ARRAY['formulas','kinematics','energy','waves'],
  '## Essential Physics Formulas

| Quantity | Formula | Units |
|----------|---------|-------|
| Velocity | v = u + at | m/s |
| Displacement | s = ut + ½at² | m |
| Velocity² | v² = u² + 2as | m²/s² |
| Force | F = ma | N |
| Momentum | p = mv | kg·m/s |
| KE | KE = ½mv² | J |
| PE (gravity) | PE = mgh | J |
| Work | W = Fd·cosθ | J |
| Power | P = W/t = Fv | W |
| Pressure | P = F/A | Pa |
| Wave speed | v = fλ | m/s |
| Ohm''s Law | V = IR | V |',
  'formula',
  TRUE
),
(
  'Periodic Table Trends',
  'Chemistry',
  'Periodic Classification',
  ARRAY['periodic table','trends','atomic radius','ionization'],
  '## Periodic Table Key Trends

### Atomic Radius
- **Across period** (L→R): **Decreases** (more protons pull electrons closer)
- **Down group**: **Increases** (new electron shells added)

### Ionization Energy
- **Across period** (L→R): **Increases** (harder to remove electrons)
- **Down group**: **Decreases** (outer electrons further from nucleus)

### Electronegativity
- **Across period** (L→R): **Increases**
- **Down group**: **Decreases**
- Most electronegative: **Fluorine (F)**

### Electron Affinity
- Generally increases across period (exceptions: Group 2, 15)

### Metallic Character
- Increases down a group and left across a period

> 💡 **Memory tip**: "AIEM" - Atomic radius decreases, Ionization energy increases, Electronegativity increases, Metallic character decreases → left to right',
  'concept',
  FALSE
),
(
  'Integration Formulas',
  'Mathematics',
  'Calculus',
  ARRAY['calculus','integration','formulas','integrals'],
  '## Standard Integration Formulas

### Basic Integrals
$$\int x^n dx = \frac{x^{n+1}}{n+1} + C \quad (n \neq -1)$$

$$\int \frac{1}{x} dx = \ln|x| + C$$

$$\int e^x dx = e^x + C$$

$$\int a^x dx = \frac{a^x}{\ln a} + C$$

### Trigonometric Integrals
$$\int \sin x \, dx = -\cos x + C$$

$$\int \cos x \, dx = \sin x + C$$

$$\int \sec^2 x \, dx = \tan x + C$$

$$\int \csc^2 x \, dx = -\cot x + C$$

### Inverse Trig
$$\int \frac{dx}{\sqrt{1-x^2}} = \sin^{-1}x + C$$

$$\int \frac{dx}{1+x^2} = \tan^{-1}x + C$$',
  'formula',
  FALSE
);
