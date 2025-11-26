-- Create community wallet table (single shared wallet)
CREATE TABLE public.community_wallet (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  balance NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community contributions table (monthly fees from owners)
CREATE TABLE public.community_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Create community transactions table (all transactions including payments)
CREATE TABLE public.community_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_wallet_id UUID NOT NULL REFERENCES public.community_wallet(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('contribution', 'payment')),
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_wallet
-- Everyone can view the community wallet
CREATE POLICY "Everyone can view community wallet"
ON public.community_wallet
FOR SELECT
USING (true);

-- Only admins can update the community wallet balance
CREATE POLICY "Admins can update community wallet"
ON public.community_wallet
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for community_contributions
-- Everyone can view all contributions
CREATE POLICY "Everyone can view contributions"
ON public.community_contributions
FOR SELECT
USING (true);

-- Owners can add their own contributions
CREATE POLICY "Owners can add contributions"
ON public.community_contributions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.has_role(auth.uid(), 'owner')
);

-- RLS Policies for community_transactions
-- Everyone can view all transactions
CREATE POLICY "Everyone can view transactions"
ON public.community_transactions
FOR SELECT
USING (true);

-- Owners can create contribution transactions
CREATE POLICY "Owners can create contribution transactions"
ON public.community_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  type = 'contribution' AND
  public.has_role(auth.uid(), 'owner')
);

-- Admins can create payment transactions
CREATE POLICY "Admins can create payment transactions"
ON public.community_transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  type = 'payment' AND
  public.has_role(auth.uid(), 'admin')
);

-- Add trigger for community_wallet updated_at
CREATE TRIGGER update_community_wallet_updated_at
BEFORE UPDATE ON public.community_wallet
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial community wallet
INSERT INTO public.community_wallet (balance) VALUES (0.00);