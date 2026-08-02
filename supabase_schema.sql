-- =============================================================================
-- Draft Ethan - Supabase Database Schema & RLS Setup
-- =============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    is_pro BOOLEAN DEFAULT FALSE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE NOT NULL,
    free_usage_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );


-- 2. Create HISTORY_ITEMS table
CREATE TABLE IF NOT EXISTS public.history_items (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    job_title TEXT NOT NULL,
    company_name TEXT,
    request_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster querying by user_id and creation date
CREATE INDEX IF NOT EXISTS idx_history_items_user_created 
    ON public.history_items (user_id, created_at DESC);

-- Enable RLS for history_items
ALTER TABLE public.history_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for history_items
CREATE POLICY "Users can manage their own history items"
    ON public.history_items FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 3. Create PAYMENT_REQUESTS table
CREATE TABLE IF NOT EXISTS public.payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT,
    depositor_name TEXT,
    amount NUMERIC NOT NULL,
    product TEXT NOT NULL,
    status TEXT DEFAULT 'opened' CHECK (status IN ('opened', 'pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for status and user_id
CREATE INDEX IF NOT EXISTS idx_payment_requests_status 
    ON public.payment_requests (status, created_at DESC);

-- Enable RLS for payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_requests
CREATE POLICY "Users can view and insert their own payment requests"
    ON public.payment_requests FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment requests"
    ON public.payment_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );


-- 4. Create USAGE_LOGS table (Server side logging)
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_title TEXT,
    character_count INT,
    is_pro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for usage_logs
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically, allow insert for authenticated/anon
CREATE POLICY "Allow log insert"
    ON public.usage_logs FOR INSERT
    WITH CHECK (true);
