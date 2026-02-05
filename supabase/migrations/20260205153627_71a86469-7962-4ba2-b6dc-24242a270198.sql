-- Create enum for audience/learning level types
CREATE TYPE public.audience_type AS ENUM ('kids', 'students', 'business');

-- Create enum for word status in user's personal list
CREATE TYPE public.word_status AS ENUM ('new', 'queued', 'learned');

-- Add audience_type column to profiles (replacing old english_level approach)
ALTER TABLE public.profiles 
ADD COLUMN audience_type public.audience_type DEFAULT NULL;

-- Add interests array to profiles
ALTER TABLE public.profiles 
ADD COLUMN interests TEXT[] DEFAULT '{}';

-- Create UserWords table - the personalized word list for each user
CREATE TABLE public.user_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  status public.word_status NOT NULL DEFAULT 'new',
  view_count INTEGER NOT NULL DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- Enable RLS on user_words
ALTER TABLE public.user_words ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_words
CREATE POLICY "Users can view their own words"
ON public.user_words
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
ON public.user_words
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
ON public.user_words
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
ON public.user_words
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_user_words_updated_at
BEFORE UPDATE ON public.user_words
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add level column to vocabulary_words if not exists (for filtering by audience)
ALTER TABLE public.vocabulary_words 
ADD COLUMN IF NOT EXISTS audience_levels TEXT[] DEFAULT '{kids,students,business}';