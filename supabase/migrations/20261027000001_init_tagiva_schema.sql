-- ============================================================================
-- Migration: 20261027000001_init_tagiva_schema.sql
-- Product: Tagiva (tagiva.com)
-- Master Specification: docs/DATABASE.md, PRD.md (D-01 to D-60)
-- ============================================================================

-- 1. Create Core Tables
-- ----------------------------------------------------------------------------

-- 1.1 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  tax_id TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  invoice_prefix TEXT NOT NULL DEFAULT 'USR'
    CONSTRAINT chk_profiles_invoice_prefix CHECK (invoice_prefix ~ '^[A-Z0-9]{2,6}$'),
  default_currency TEXT NOT NULL DEFAULT 'IDR'
    CONSTRAINT chk_profiles_default_currency CHECK (
      default_currency IN ('IDR', 'USD', 'SGD', 'EUR', 'AUD', 'GBP', 'MYR', 'JPY')
    ),
  default_language TEXT NOT NULL DEFAULT 'en'
    CONSTRAINT chk_profiles_default_language CHECK (default_language IN ('en', 'id')),
  bank_details JSONB NOT NULL DEFAULT '{"bank_name": "", "account_number": "", "account_holder": "", "notes": ""}'::jsonb,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 invoice_sequences
CREATE TABLE IF NOT EXISTS public.invoice_sequences (
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  issue_year INTEGER NOT NULL CONSTRAINT chk_issue_year CHECK (issue_year BETWEEN 2000 AND 2100),
  last_seq INTEGER NOT NULL DEFAULT 0 CONSTRAINT chk_last_seq CHECK (last_seq >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, issue_year)
);

-- 1.3 customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- 1.4 invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  template_id TEXT NOT NULL DEFAULT 'modern-minimalist',

  -- Numbering (D-30, D-55): NULL while status = 'draft', assigned when issued
  invoice_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CONSTRAINT chk_invoices_status CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),

  -- Localization & Currency (D-17, D-46)
  language TEXT NOT NULL DEFAULT 'en'
    CONSTRAINT chk_invoices_language CHECK (language IN ('en', 'id')),
  currency TEXT NOT NULL DEFAULT 'IDR'
    CONSTRAINT chk_invoices_currency CHECK (
      currency IN ('IDR', 'USD', 'SGD', 'EUR', 'AUD', 'GBP', 'MYR', 'JPY')
    ),

  -- Dates
  issue_date DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date,
  due_date DATE NOT NULL,

  -- Sender Snapshot (ARCH-A04, D-27)
  sender_name TEXT NOT NULL DEFAULT '',
  sender_email TEXT NOT NULL DEFAULT '',
  sender_phone TEXT NOT NULL DEFAULT '',
  sender_address TEXT NOT NULL DEFAULT '',
  sender_tax_id TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  payment_instructions JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Recipient
  client_name TEXT NOT NULL DEFAULT '',
  client_company TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_address TEXT NOT NULL DEFAULT '',

  -- Financials (NFR-4, D-44, D-45)
  subtotal NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_type TEXT NOT NULL DEFAULT 'percent'
    CONSTRAINT chk_invoices_discount_type CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (discount_value >= 0),
  discount_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_label TEXT NOT NULL DEFAULT 'PPN',
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  tax_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),

  notes TEXT NOT NULL DEFAULT '',

  -- Public Link (FR-8)
  public_token TEXT UNIQUE,
  public_link_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- Lifecycle Timestamps
  issued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Invariant: Drafts MUST NOT have an invoice_number; non-drafts MUST have a valid invoice_number (D-30, D-55)
  CONSTRAINT chk_draft_number_invariant CHECK (
    (status = 'draft' AND invoice_number IS NULL)
    OR
    (status <> 'draft' AND invoice_number ~ '^INV-[A-Z0-9]{2,6}-[0-9]{4}-(0[1-9]|1[0-2])-[0-9]{4,}$')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_number_per_user
  ON public.invoices(user_id, invoice_number)
  WHERE invoice_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_public_token ON public.invoices(public_token) WHERE public_token IS NOT NULL;

-- 1.5 invoice_items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(12, 4) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  line_total NUMERIC(18, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id, sort_order);

-- 1.6 subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  plan_duration_months INTEGER NOT NULL
    CONSTRAINT chk_plan_duration CHECK (plan_duration_months IN (1, 3, 6, 12)),
  billing_mode TEXT NOT NULL DEFAULT 'manual'
    CONSTRAINT chk_billing_mode CHECK (billing_mode IN ('manual', 'auto_renew')),
  status TEXT NOT NULL DEFAULT 'active'
    CONSTRAINT chk_subscription_status CHECK (status IN ('active', 'past_due', 'expired', 'cancelled')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  grace_period_end TIMESTAMPTZ,
  gateway_provider TEXT NOT NULL
    CONSTRAINT chk_gateway_provider CHECK (gateway_provider IN ('xendit', 'midtrans', 'mayar')),
  gateway_customer_id TEXT,
  gateway_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status, current_period_end DESC);

-- 1.7 billing_events
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  gateway_provider TEXT NOT NULL,
  gateway_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  duration_months INTEGER,
  amount_idr NUMERIC(18, 2),
  raw_payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.8 subscription_reminders
CREATE TABLE IF NOT EXISTS public.subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  period_end_date_wib DATE NOT NULL,
  reminder_type TEXT NOT NULL
    CONSTRAINT chk_reminder_type CHECK (reminder_type IN ('30d', '14d', '3d', '0d', 'auto_renew_3d')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscription_id, period_end_date_wib, reminder_type)
);

-- 1.9 invoice_email_logs
CREATE TABLE IF NOT EXISTS public.invoice_email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  sent_date_wib DATE NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Jakarta')::date,
  resend_message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user_date ON public.invoice_email_logs(user_id, sent_date_wib);
CREATE INDEX IF NOT EXISTS idx_email_logs_invoice_date ON public.invoice_email_logs(invoice_id, sent_date_wib);


-- 2. Database Functions (RPCs)
-- ----------------------------------------------------------------------------

-- 2.1 get_user_plan_state(p_user_id UUID)
CREATE OR REPLACE FUNCTION public.get_user_plan_state(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_active BOOLEAN;
  v_has_any BOOLEAN;
BEGIN
  -- Active Pro: current_period_end is in the future, OR status is past_due within the 3-day grace window (D-52)
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND (
        (status IN ('active', 'cancelled') AND current_period_end > NOW())
        OR (status = 'past_due' AND grace_period_end IS NOT NULL AND grace_period_end > NOW())
      )
  ) INTO v_has_active;

  IF v_has_active THEN
    RETURN 'pro';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id
  ) INTO v_has_any;

  IF v_has_any THEN
    RETURN 'lapsed';
  END IF;

  RETURN 'free';
END;
$$;

-- 2.2 issue_invoice(p_invoice_id UUID)
CREATE OR REPLACE FUNCTION public.issue_invoice(p_invoice_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.invoices%ROWTYPE;
  v_prefix TEXT;
  v_year INTEGER;
  v_month TEXT;
  v_next_seq INTEGER;
  v_seq_str TEXT;
  v_new_number TEXT;
BEGIN
  -- Lock the invoice row
  SELECT * INTO v_invoice
  FROM public.invoices
  WHERE id = p_invoice_id AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found or access denied';
  END IF;

  -- If already issued, return existing number idempotently
  IF v_invoice.status <> 'draft' AND v_invoice.invoice_number IS NOT NULL THEN
    RETURN v_invoice.invoice_number;
  END IF;

  -- Read user's current prefix (D-18, D-54)
  SELECT invoice_prefix INTO v_prefix
  FROM public.profiles
  WHERE user_id = v_invoice.user_id;

  -- Extract YYYY and MM from issue_date (D-56)
  v_year := EXTRACT(YEAR FROM v_invoice.issue_date)::INTEGER;
  v_month := TO_CHAR(v_invoice.issue_date, 'MM');

  -- Atomically increment the yearly counter for (user_id, issue_year)
  INSERT INTO public.invoice_sequences (user_id, issue_year, last_seq, updated_at)
  VALUES (v_invoice.user_id, v_year, 1, NOW())
  ON CONFLICT (user_id, issue_year)
  DO UPDATE SET
    last_seq = public.invoice_sequences.last_seq + 1,
    updated_at = NOW()
  RETURNING last_seq INTO v_next_seq;

  -- Zero-pad to 4 digits, or expand to 5+ digits if > 9999 (A-05)
  IF v_next_seq <= 9999 THEN
    v_seq_str := LPAD(v_next_seq::TEXT, 4, '0');
  ELSE
    v_seq_str := v_next_seq::TEXT;
  END IF;

  v_new_number := FORMAT('INV-%s-%s-%s-%s', v_prefix, v_year, v_month, v_seq_str);

  -- Update the invoice record
  UPDATE public.invoices
  SET
    invoice_number = v_new_number,
    status = 'sent',
    issued_at = NOW(),
    updated_at = NOW()
  WHERE id = p_invoice_id;

  RETURN v_new_number;
END;
$$;

-- 2.3 get_public_invoice_by_token(p_token TEXT)
CREATE OR REPLACE FUNCTION public.get_public_invoice_by_token(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invoice public.invoices%ROWTYPE;
  v_items JSONB;
  v_is_pro BOOLEAN;
  v_result JSONB;
BEGIN
  IF p_token IS NULL OR trim(p_token) = '' THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_invoice
  FROM public.invoices
  WHERE public_token = p_token
    AND public_link_enabled = TRUE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'description', description,
      'quantity', quantity,
      'unit_price', unit_price,
      'line_total', line_total,
      'sort_order', sort_order
    ) ORDER BY sort_order ASC
  ), '[]'::jsonb) INTO v_items
  FROM public.invoice_items
  WHERE invoice_id = v_invoice.id;

  v_is_pro := (public.get_user_plan_state(v_invoice.user_id) = 'pro');

  v_result := jsonb_build_object(
    'invoice', to_jsonb(v_invoice),
    'items', v_items,
    'show_platform_footer', NOT v_is_pro
  );

  RETURN v_result;
END;
$$;


-- 3. Triggers
-- ----------------------------------------------------------------------------

-- 3.1 handle_new_user() on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_raw_name TEXT;
  v_clean_name TEXT;
  v_prefix TEXT;
BEGIN
  v_raw_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '');
  v_clean_name := UPPER(REGEXP_REPLACE(v_raw_name, '[^a-zA-Z0-9]', '', 'g'));

  IF LENGTH(v_clean_name) >= 3 THEN
    v_prefix := SUBSTRING(v_clean_name FROM 1 FOR 3);
  ELSIF LENGTH(v_clean_name) = 2 THEN
    v_prefix := v_clean_name;
  ELSE
    v_prefix := 'USR';
  END IF;

  INSERT INTO public.profiles (
    user_id,
    business_name,
    email,
    invoice_prefix,
    default_currency,
    default_language,
    onboarding_completed
  ) VALUES (
    NEW.id,
    COALESCE(v_raw_name, ''),
    COALESCE(NEW.email, ''),
    v_prefix,
    'IDR',
    'en',
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.2 Invoice Immutability and State Guards (A-16, D-55)
CREATE OR REPLACE FUNCTION public.check_invoice_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Prevent changing assigned invoice number once issued
  IF OLD.invoice_number IS NOT NULL AND NEW.invoice_number IS DISTINCT FROM OLD.invoice_number THEN
    RAISE EXCEPTION 'Invoice number is immutable once assigned (D-55)';
  END IF;

  -- Prevent reverting back to draft
  IF OLD.status <> 'draft' AND NEW.status = 'draft' THEN
    RAISE EXCEPTION 'Cannot revert an issued invoice back to draft (A-16)';
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_immutability ON public.invoices;
CREATE TRIGGER trg_invoice_immutability
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.check_invoice_immutability();


-- 4. Row Level Security (RLS) Policies
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_email_logs ENABLE ROW LEVEL SECURITY;

-- 4.1 profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- If logo_url is being updated to a non-empty string, require Pro
      logo_url IS NULL
      OR logo_url = ''
      OR logo_url = (SELECT p.logo_url FROM public.profiles p WHERE p.user_id = auth.uid())
      OR public.get_user_plan_state(auth.uid()) = 'pro'
    )
  );

-- 4.2 invoice_sequences
CREATE POLICY "invoice_sequences_select_own"
  ON public.invoice_sequences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4.3 customers
CREATE POLICY "customers_manage_own"
  ON public.customers FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4.4 invoices
CREATE POLICY "invoices_select_own"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_own"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.get_user_plan_state(auth.uid()) = 'pro'
      OR (SELECT COUNT(*) FROM public.invoices WHERE user_id = auth.uid()) < 3
    )
  );

CREATE POLICY "invoices_update_own"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.get_user_plan_state(auth.uid()) IN ('free', 'pro')
      OR (
        public.get_user_plan_state(auth.uid()) = 'lapsed'
        AND status = 'paid'
      )
    )
  );

CREATE POLICY "invoices_delete_own"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND (
      public.get_user_plan_state(auth.uid()) = 'pro'
      OR (
        public.get_user_plan_state(auth.uid()) = 'free'
        AND status = 'draft'
      )
    )
  );

-- 4.5 invoice_items
CREATE POLICY "invoice_items_select_own"
  ON public.invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_modify_own"
  ON public.invoice_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
    AND public.get_user_plan_state(auth.uid()) IN ('free', 'pro')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
    AND public.get_user_plan_state(auth.uid()) IN ('free', 'pro')
  );

-- 4.6 subscriptions
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4.7 billing_events
CREATE POLICY "billing_events_select_own"
  ON public.billing_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4.8 subscription_reminders
CREATE POLICY "subscription_reminders_select_own"
  ON public.subscription_reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4.9 invoice_email_logs
CREATE POLICY "email_logs_select_own"
  ON public.invoice_email_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "email_logs_insert_pro"
  ON public.invoice_email_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.get_user_plan_state(auth.uid()) = 'pro'
  );


-- 5. Storage Bucket & Policies (business-logos)
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  TRUE,
  2097152, -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

CREATE POLICY "Public read for business logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-logos');

CREATE POLICY "Pro users can upload business logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'business-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.get_user_plan_state(auth.uid()) = 'pro'
  );

CREATE POLICY "Pro users can update their business logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'business-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.get_user_plan_state(auth.uid()) = 'pro'
  );

CREATE POLICY "Pro users can delete their business logo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'business-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND public.get_user_plan_state(auth.uid()) = 'pro'
  );
