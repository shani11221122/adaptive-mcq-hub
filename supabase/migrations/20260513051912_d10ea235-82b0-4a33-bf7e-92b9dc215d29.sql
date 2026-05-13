-- ============================================================
--  MDCAT Preparation App - Full Database Schema
-- ============================================================

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username text NOT NULL UNIQUE,
    email text,
    is_premium boolean NOT NULL DEFAULT false,
    is_admin boolean NOT NULL DEFAULT false,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Questions table (MCQ bank)
CREATE TYPE public.subject_enum AS ENUM ('biology', 'chemistry', 'physics', 'english', 'reasoning');
CREATE TYPE public.difficulty_enum AS ENUM ('easy', 'intermediate', 'hard');

CREATE TABLE IF NOT EXISTS public.questions (
    id text PRIMARY KEY,
    subject subject_enum NOT NULL,
    question text NOT NULL,
    options text[] NOT NULL,
    correct_answer integer NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
    difficulty difficulty_enum NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 3. Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject subject_enum NOT NULL,
    difficulty difficulty_enum NOT NULL,
    correct_count integer NOT NULL DEFAULT 0,
    incorrect_count integer NOT NULL DEFAULT 0,
    total_questions integer NOT NULL DEFAULT 0,
    score_percent integer,
    time_taken_seconds integer,
    answers jsonb DEFAULT '[]'::jsonb,
    question_ids text[] DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- 4. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan text NOT NULL DEFAULT 'Premium Monthly',
    method text,
    reference text,
    amount numeric(10,2),
    start_date timestamptz,
    expiry_date timestamptz,
    is_active boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Mock test progress table
CREATE TABLE IF NOT EXISTS public.mock_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    questions jsonb NOT NULL DEFAULT '[]'::jsonb,
    answers integer[] DEFAULT '{}',
    current_index integer NOT NULL DEFAULT 0,
    seconds_left integer NOT NULL DEFAULT 0,
    saved_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_progress ENABLE ROW LEVEL SECURITY;

-- 6. Admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  RLS Policies
-- ============================================================

-- Profiles policies
CREATE POLICY "Profiles viewable by owner"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Profiles viewable by admin"
    ON public.profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Questions are publicly readable"
    ON public.questions FOR SELECT
    TO authenticated, anon USING (true);

CREATE POLICY "Only admins can insert questions"
    ON public.questions FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

CREATE POLICY "Only admins can update questions"
    ON public.questions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

CREATE POLICY "Only admins can delete questions"
    ON public.questions FOR DELETE
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

-- Quiz results policies
CREATE POLICY "Users can view own quiz results"
    ON public.quiz_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz results"
    ON public.quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz results"
    ON public.quiz_results FOR DELETE
    USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Mock progress policies
CREATE POLICY "Users can view own mock progress"
    ON public.mock_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own mock progress"
    ON public.mock_progress FOR ALL
    USING (auth.uid() = user_id);

-- Admin settings policies
CREATE POLICY "Admin settings readable by admins"
    ON public.admin_settings FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

CREATE POLICY "Admin settings writable by admins"
    ON public.admin_settings FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_admin = true));

-- ============================================================
--  Helper Functions & Triggers
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mock_progress_updated_at
    BEFORE UPDATE ON public.mock_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profile creation on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, email, is_premium, is_admin)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        NEW.email,
        false,
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ============================================================
--  Indexes for Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_subject_difficulty ON public.questions(subject, difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON public.quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_subject ON public.quiz_results(subject);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_progress_user_id ON public.mock_progress(user_id);