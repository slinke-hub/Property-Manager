
-- Create receipts table for tracking uploaded receipts
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  extracted_iban TEXT,
  extracted_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'failed')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_settings table to store admin IBAN
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_dues table to track owner dues
CREATE TABLE public.monthly_dues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  paid_at TIMESTAMP WITH TIME ZONE,
  receipt_id UUID REFERENCES public.receipts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS on all tables
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_dues ENABLE ROW LEVEL SECURITY;

-- RLS policies for receipts
CREATE POLICY "Users can view their own receipts" ON public.receipts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts" ON public.receipts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all receipts" ON public.receipts
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update receipts" ON public.receipts
FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- RLS policies for admin_settings
CREATE POLICY "Everyone can view admin settings" ON public.admin_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage admin settings" ON public.admin_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS policies for monthly_dues
CREATE POLICY "Users can view their own dues" ON public.monthly_dues
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all dues" ON public.monthly_dues
FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage dues" ON public.monthly_dues
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own dues" ON public.monthly_dues
FOR UPDATE USING (auth.uid() = user_id);

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts bucket
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all receipts" ON storage.objects
FOR SELECT USING (bucket_id = 'receipts' AND has_role(auth.uid(), 'admin'));

-- Insert default admin IBAN setting
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES ('admin_iban', 'ES00 0000 0000 0000 0000 0000');

-- Trigger for updated_at on receipts
CREATE TRIGGER update_receipts_updated_at
BEFORE UPDATE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on admin_settings
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
