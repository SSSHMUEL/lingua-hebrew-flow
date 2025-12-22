-- Add new columns to profiles table for onboarding data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS english_level text,
ADD COLUMN IF NOT EXISTS source_language text DEFAULT 'hebrew',
ADD COLUMN IF NOT EXISTS target_language text DEFAULT 'english',
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create subscriptions table to track user subscription status
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'trialing',
  plan text,
  paddle_subscription_id text,
  paddle_customer_id text,
  trial_start timestamp with time zone DEFAULT now(),
  trial_end timestamp with time zone DEFAULT (now() + interval '30 days'),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Only system/webhooks should update subscriptions, but allow users to read
CREATE POLICY "Service role can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, trial_start, trial_end)
  VALUES (NEW.id, 'trialing', now(), now() + interval '30 days');
  RETURN NEW;
END;
$$;

-- Trigger to create subscription when profile is created
CREATE TRIGGER on_profile_created_create_subscription
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();