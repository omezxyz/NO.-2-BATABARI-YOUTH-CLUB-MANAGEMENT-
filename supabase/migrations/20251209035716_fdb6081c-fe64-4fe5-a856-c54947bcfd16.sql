-- Create members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_collections table
CREATE TABLE public.monthly_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2023),
  amount NUMERIC NOT NULL DEFAULT 100,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(member_id, month, year)
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_name TEXT NOT NULL,
  borrower_type TEXT NOT NULL CHECK (borrower_type IN ('member', 'outsider')),
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  principal_amount NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'defaulted')),
  notes TEXT,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  total_interest_paid NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan_payments table
CREATE TABLE public.loan_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  principal_paid NUMERIC NOT NULL DEFAULT 0,
  interest_paid NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Authenticated users can view members" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update members" ON public.members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete members" ON public.members FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view collections" ON public.monthly_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert collections" ON public.monthly_collections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update collections" ON public.monthly_collections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete collections" ON public.monthly_collections FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view loans" ON public.loans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert loans" ON public.loans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update loans" ON public.loans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete loans" ON public.loans FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view loan_payments" ON public.loan_payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert loan_payments" ON public.loan_payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update loan_payments" ON public.loan_payments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete loan_payments" ON public.loan_payments FOR DELETE TO authenticated USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_collections_member ON public.monthly_collections(member_id);
CREATE INDEX idx_collections_period ON public.monthly_collections(year, month);
CREATE INDEX idx_loans_member ON public.loans(member_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loan_payments_loan ON public.loan_payments(loan_id);
CREATE INDEX idx_loan_payments_date ON public.loan_payments(payment_date);