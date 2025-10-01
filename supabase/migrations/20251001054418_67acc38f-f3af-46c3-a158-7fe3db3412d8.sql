-- Create account_types table
CREATE TABLE IF NOT EXISTS public.account_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  affects_net_worth BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on account_types
ALTER TABLE public.account_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for account_types
CREATE POLICY "Users can view system and their own account types"
  ON public.account_types FOR SELECT
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own account types"
  ON public.account_types FOR INSERT
  WITH CHECK (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can update their own account types"
  ON public.account_types FOR UPDATE
  USING (user_id = auth.uid() AND is_system = false);

CREATE POLICY "Users can delete their own account types"
  ON public.account_types FOR DELETE
  USING (user_id = auth.uid() AND is_system = false);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  account_type_id UUID NOT NULL REFERENCES public.account_types(id),
  balance NUMERIC DEFAULT 0,
  initial_balance NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  color TEXT,
  icon TEXT,
  account_number TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- RLS policies for accounts
CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  USING (user_id = auth.uid());

-- Add account columns to transactions table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='transactions' AND column_name='from_account_id') THEN
    ALTER TABLE public.transactions ADD COLUMN from_account_id UUID REFERENCES public.accounts(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='transactions' AND column_name='to_account_id') THEN
    ALTER TABLE public.transactions ADD COLUMN to_account_id UUID REFERENCES public.accounts(id);
  END IF;
END $$;

-- Create trigger for account_types updated_at
CREATE TRIGGER update_account_types_updated_at
  BEFORE UPDATE ON public.account_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for accounts updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default system account types
INSERT INTO public.account_types (name, category, description, icon, color, is_system, is_default, affects_net_worth)
VALUES 
  ('Cash', 'asset', 'Physical cash on hand', 'Wallet', '#10b981', true, true, true),
  ('Checking', 'asset', 'Bank checking account', 'Building', '#3b82f6', true, true, true),
  ('Savings', 'asset', 'Savings account', 'PiggyBank', '#8b5cf6', true, true, true),
  ('Credit Card', 'liability', 'Credit card account', 'CreditCard', '#ef4444', true, true, true),
  ('Investment', 'asset', 'Investment accounts', 'TrendingUp', '#f59e0b', true, false, true),
  ('Loan', 'liability', 'Loan accounts', 'HandCoins', '#dc2626', true, false, true),
  ('Wallet', 'asset', 'Digital wallet', 'Wallet', '#06b6d4', true, false, true)
ON CONFLICT DO NOTHING;

-- Function to create default accounts for new users
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cash_type_id UUID;
BEGIN
  -- Get the Cash account type ID
  SELECT id INTO v_cash_type_id 
  FROM public.account_types 
  WHERE name = 'Cash' AND is_system = true 
  LIMIT 1;
  
  -- Create a default Cash account for the user
  INSERT INTO public.accounts (user_id, name, account_type_id, balance, initial_balance, is_default)
  VALUES (user_uuid, 'Cash', v_cash_type_id, 0, 0, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Function to create default accounts for existing users
CREATE OR REPLACE FUNCTION public.create_default_accounts_for_existing_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cash_type_id UUID;
BEGIN
  -- Get the Cash account type ID
  SELECT id INTO v_cash_type_id 
  FROM public.account_types 
  WHERE name = 'Cash' AND is_system = true 
  LIMIT 1;
  
  -- Loop through all users who don't have any accounts
  FOR v_user_id IN 
    SELECT DISTINCT t.user_id 
    FROM public.transactions t
    LEFT JOIN public.accounts a ON a.user_id = t.user_id
    WHERE a.id IS NULL
  LOOP
    -- Create default Cash account
    INSERT INTO public.accounts (user_id, name, account_type_id, balance, initial_balance, is_default)
    VALUES (v_user_id, 'Cash', v_cash_type_id, 0, 0, true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Function to create default account types for a user
CREATE OR REPLACE FUNCTION public.create_default_account_types(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- System account types are automatically visible to all users
  -- No need to create user-specific copies
  RETURN;
END;
$$;

-- Execute function to create accounts for existing users
SELECT public.create_default_accounts_for_existing_users();