-- ==============================================================================
-- Cubecca MVP - Supabase PostgreSQL Schema
-- ==============================================================================

-- ENUMS
CREATE TYPE draft_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE subscription_tier AS ENUM ('trial', 'active', 'past_due', 'canceled');

-- 1. PROFILES (Extends Supabase auth.users)
-- Manages user-level settings, GBP OAuth tokens, and billing state.
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    
    -- Google OAuth Tokens (Store securely, consider Vault or Edge function encryption in production)
    gbp_access_token TEXT,
    gbp_refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    -- Global AI Settings
    global_tone TEXT DEFAULT 'Professional',
    business_context TEXT, -- e.g., "Manager is Sarah, we validate parking"
    receive_email_alerts BOOLEAN DEFAULT TRUE,
    
    -- Billing
    sub_status subscription_tier DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    stripe_customer_id TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS
-- Represents physical business locations tied to a Google Business Profile.
-- A profile can manage multiple locations.
CREATE TABLE locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gbp_location_id TEXT NOT NULL, -- Google's unique location ID
    location_name TEXT NOT NULL,
    address TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REVIEWS
-- The raw reviews fetched from Google Maps/GBP.
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    gbp_review_id TEXT NOT NULL UNIQUE, -- Google's unique review ID
    
    -- Review payload
    reviewer_name TEXT,
    reviewer_avatar_url TEXT,
    star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
    comment TEXT,
    
    -- State management
    is_replied BOOLEAN DEFAULT FALSE,
    posted_at TIMESTAMPTZ, -- When the customer posted it on Google
    created_at TIMESTAMPTZ DEFAULT NOW() -- When we ingested it
);

-- 4. DRAFTS
-- The AI-generated responses waiting for human-in-the-loop triage.
-- 1:1 relationship with Reviews for the MVP.
CREATE TABLE drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE UNIQUE,
    
    ai_content TEXT NOT NULL,
    status draft_status DEFAULT 'pending',
    
    -- Tracking for analytics / refactoring
    prompt_used TEXT, 
    refactor_comments TEXT, -- If user clicked "Refactor" and added a comment
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WEEKLY INSIGHTS
-- Stores the generated weekly summaries for the dashboard.
CREATE TABLE weekly_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    summary_text TEXT NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- RLS (Row Level Security) Boilerplate Reminders
-- ==============================================================================
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;