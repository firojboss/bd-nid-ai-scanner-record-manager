// Supabase PostgreSQL Database Setup Script for BD NID AI Scanner
// Run this directly in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

export const SUPABASE_SQL_SETUP = `-- ==============================================================================
-- 1. BD NID RECORDS TABLE (PostgreSQL / Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bd_nid_records (
  id TEXT PRIMARY KEY,
  nid_number VARCHAR(20) NOT NULL UNIQUE,
  name_bangla VARCHAR(255) NOT NULL,
  name_english VARCHAR(255),
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  spouse_name VARCHAR(255),
  date_of_birth DATE,
  pin_number VARCHAR(30),
  place_of_birth VARCHAR(100),
  blood_group VARCHAR(10),
  address_bangla TEXT,
  address_english TEXT,
  issue_date VARCHAR(50),
  card_type VARCHAR(30) DEFAULT 'smart_card',
  card_side VARCHAR(20) DEFAULT 'front',
  accuracy_score NUMERIC(5,2) DEFAULT 98.00,
  field_confidence JSONB DEFAULT '{}'::jsonb,
  validation_issues JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(30) DEFAULT 'verified',
  notes TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  scan_source VARCHAR(30) DEFAULT 'upload',
  original_file_name VARCHAR(255),
  original_file_size VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid searching
CREATE INDEX IF NOT EXISTS idx_nid_records_nid ON public.bd_nid_records(nid_number);
CREATE INDEX IF NOT EXISTS idx_nid_records_name_bn ON public.bd_nid_records(name_bangla);
CREATE INDEX IF NOT EXISTS idx_nid_records_name_en ON public.bd_nid_records(name_english);
CREATE INDEX IF NOT EXISTS idx_nid_records_district ON public.bd_nid_records(place_of_birth);
CREATE INDEX IF NOT EXISTS idx_nid_records_created ON public.bd_nid_records(created_at DESC);

-- ==============================================================================
-- 2. DATASHEET MULTI-SITE ACCOUNTS TABLE (Excel / Betting / Crypto / MFS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bd_datasheet_accounts (
  id TEXT PRIMARY KEY,
  site_id VARCHAR(50) NOT NULL,
  site_name VARCHAR(100) NOT NULL,
  site_logo TEXT,
  account_id VARCHAR(100) NOT NULL,
  password TEXT NOT NULL,
  phone_number VARCHAR(30),
  email VARCHAR(255),
  two_fa TEXT,
  two_fa_disable_key TEXT,
  name VARCHAR(255),
  nid_number VARCHAR(30),
  nid_record_id TEXT REFERENCES public.bd_nid_records(id) ON DELETE SET NULL,
  created_timestamp VARCHAR(100),
  edited_timestamp VARCHAR(100),
  balance VARCHAR(50) DEFAULT '0',
  status VARCHAR(30) DEFAULT 'New Account',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_datasheet_site ON public.bd_datasheet_accounts(site_id);
CREATE INDEX IF NOT EXISTS idx_datasheet_nid ON public.bd_datasheet_accounts(nid_number);
CREATE INDEX IF NOT EXISTS idx_datasheet_acc_id ON public.bd_datasheet_accounts(account_id);

-- ==============================================================================
-- 3. NOTEPAD EXPENSES TABLE (Red & White Theme Daily Account Expenses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bd_note_expenses (
  id TEXT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  details TEXT,
  date VARCHAR(50),
  time VARCHAR(50),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  payment_method VARCHAR(50) DEFAULT 'Cash',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_expenses_category ON public.bd_note_expenses(category);
CREATE INDEX IF NOT EXISTS idx_note_expenses_date ON public.bd_note_expenses(date);
CREATE INDEX IF NOT EXISTS idx_note_expenses_timestamp ON public.bd_note_expenses(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bd_nid_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_datasheet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bd_note_expenses ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read & write for app API integration
CREATE POLICY "Allow public read bd_nid_records" ON public.bd_nid_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert bd_nid_records" ON public.bd_nid_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bd_nid_records" ON public.bd_nid_records FOR UPDATE USING (true);
CREATE POLICY "Allow public delete bd_nid_records" ON public.bd_nid_records FOR DELETE USING (true);

CREATE POLICY "Allow public read bd_datasheet_accounts" ON public.bd_datasheet_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public insert bd_datasheet_accounts" ON public.bd_datasheet_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bd_datasheet_accounts" ON public.bd_datasheet_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete bd_datasheet_accounts" ON public.bd_datasheet_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public read bd_note_expenses" ON public.bd_note_expenses FOR SELECT USING (true);
CREATE POLICY "Allow public insert bd_note_expenses" ON public.bd_note_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update bd_note_expenses" ON public.bd_note_expenses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete bd_note_expenses" ON public.bd_note_expenses FOR DELETE USING (true);
`;

