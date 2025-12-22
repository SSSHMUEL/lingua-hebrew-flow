
-- Create languages table
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'ltr',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial languages
INSERT INTO public.languages (code, name, native_name, direction) VALUES
  ('he', 'Hebrew', 'עברית', 'rtl'),
  ('en', 'English', 'English', 'ltr');

-- Enable RLS on languages (public read)
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view languages" 
ON public.languages 
FOR SELECT 
USING (true);

-- Create words table (single words with language reference)
CREATE TABLE public.words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_text TEXT NOT NULL,
  language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
  pronunciation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(word_text, language_id)
);

ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view words" 
ON public.words 
FOR SELECT 
USING (true);

-- Create word_translations bridge table
CREATE TABLE public.word_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word_id_1 UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  word_id_2 UUID NOT NULL REFERENCES public.words(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'general',
  example_sentence_1 TEXT,
  example_sentence_2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(word_id_1, word_id_2)
);

ALTER TABLE public.word_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view word translations" 
ON public.word_translations 
FOR SELECT 
USING (true);

-- Create user_learned_words table (replaces learned_words for new system)
CREATE TABLE public.user_learned_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  translation_pair_id UUID NOT NULL REFERENCES public.word_translations(id) ON DELETE CASCADE,
  strength_score INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  learned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, translation_pair_id)
);

ALTER TABLE public.user_learned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learned words" 
ON public.user_learned_words 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learned words" 
ON public.user_learned_words 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learned words" 
ON public.user_learned_words 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learned words" 
ON public.user_learned_words 
FOR DELETE 
USING (auth.uid() = user_id);

-- Migrate existing vocabulary_words to new schema
-- First, insert Hebrew words
INSERT INTO public.words (word_text, language_id, pronunciation)
SELECT DISTINCT 
  hebrew_translation, 
  (SELECT id FROM public.languages WHERE code = 'he'),
  NULL
FROM public.vocabulary_words
ON CONFLICT (word_text, language_id) DO NOTHING;

-- Insert English words
INSERT INTO public.words (word_text, language_id, pronunciation)
SELECT DISTINCT 
  english_word, 
  (SELECT id FROM public.languages WHERE code = 'en'),
  pronunciation
FROM public.vocabulary_words
ON CONFLICT (word_text, language_id) DO NOTHING;

-- Create translations linking Hebrew to English
INSERT INTO public.word_translations (word_id_1, word_id_2, category, example_sentence_1, example_sentence_2)
SELECT 
  hw.id as word_id_1,
  ew.id as word_id_2,
  vw.category,
  NULL,
  vw.example_sentence
FROM public.vocabulary_words vw
JOIN public.words hw ON hw.word_text = vw.hebrew_translation 
  AND hw.language_id = (SELECT id FROM public.languages WHERE code = 'he')
JOIN public.words ew ON ew.word_text = vw.english_word 
  AND ew.language_id = (SELECT id FROM public.languages WHERE code = 'en')
ON CONFLICT (word_id_1, word_id_2) DO NOTHING;

-- Migrate existing learned_words to new system
INSERT INTO public.user_learned_words (user_id, translation_pair_id, learned_at, created_at)
SELECT DISTINCT
  lw.user_id,
  wt.id,
  lw.learned_at,
  lw.created_at
FROM public.learned_words lw
JOIN public.vocabulary_words vw ON vw.id = lw.vocabulary_word_id
JOIN public.words hw ON hw.word_text = vw.hebrew_translation 
  AND hw.language_id = (SELECT id FROM public.languages WHERE code = 'he')
JOIN public.words ew ON ew.word_text = vw.english_word 
  AND ew.language_id = (SELECT id FROM public.languages WHERE code = 'en')
JOIN public.word_translations wt ON wt.word_id_1 = hw.id AND wt.word_id_2 = ew.id
ON CONFLICT (user_id, translation_pair_id) DO NOTHING;
