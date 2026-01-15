-- Create letters table for alphabet learning (Letters Only level)
CREATE TABLE public.letters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  english_letter VARCHAR(5) NOT NULL,
  hebrew_letter VARCHAR(5) NOT NULL,
  pronunciation VARCHAR(100),
  example_word VARCHAR(100),
  phonetic_description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create policy for reading letters (public access for all authenticated users)
CREATE POLICY "Authenticated users can view letters" 
ON public.letters 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add level column to vocabulary_words table
ALTER TABLE public.vocabulary_words 
ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'basic';

-- Create index for faster level-based queries
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_level ON public.vocabulary_words(level);

-- Insert English-Hebrew letter mappings with pronunciations
INSERT INTO public.letters (english_letter, hebrew_letter, pronunciation, example_word, phonetic_description, display_order) VALUES
('A', 'א', 'Aleph', 'Apple - תפוח', 'Silent letter or "ah" sound', 1),
('B', 'ב', 'Bet', 'Ball - כדור', 'Like English B', 2),
('C', 'ק/ס', 'Kuf/Samech', 'Cat - חתול', 'K sound (ק) or S sound (ס)', 3),
('D', 'ד', 'Dalet', 'Dog - כלב', 'Like English D', 4),
('E', 'א/ע', 'Aleph/Ayin', 'Egg - ביצה', 'Short or long E sound', 5),
('F', 'פ', 'Fey', 'Fish - דג', 'Like English F', 6),
('G', 'ג', 'Gimel', 'Go - ללכת', 'Like English G in "go"', 7),
('H', 'ה', 'Hey', 'House - בית', 'Like English H', 8),
('I', 'י', 'Yod', 'Ice - קרח', 'Like English I or Y sound', 9),
('J', 'ג׳', 'Gimel with geresh', 'Jump - לקפוץ', 'Soft J sound', 10),
('K', 'ק/כ', 'Kuf/Kaf', 'Key - מפתח', 'Like English K', 11),
('L', 'ל', 'Lamed', 'Love - אהבה', 'Like English L', 12),
('M', 'מ', 'Mem', 'Moon - ירח', 'Like English M', 13),
('N', 'נ', 'Nun', 'Night - לילה', 'Like English N', 14),
('O', 'ו/א', 'Vav/Aleph', 'Orange - תפוז', 'O sound variations', 15),
('P', 'פ', 'Pey', 'Pen - עט', 'Like English P', 16),
('Q', 'ק', 'Kuf', 'Queen - מלכה', 'Like English Q/K', 17),
('R', 'ר', 'Resh', 'Red - אדום', 'Guttural R sound', 18),
('S', 'ס/ש', 'Samech/Sin', 'Sun - שמש', 'Like English S', 19),
('T', 'ת/ט', 'Tav/Tet', 'Tree - עץ', 'Like English T', 20),
('U', 'ו', 'Vav', 'Umbrella - מטריה', 'Like English U', 21),
('V', 'ו', 'Vav', 'Voice - קול', 'Like English V', 22),
('W', 'ו', 'Vav (double)', 'Water - מים', 'Like English W', 23),
('X', 'קס', 'Kuf-Samech', 'Box - קופסא', 'KS sound combination', 24),
('Y', 'י', 'Yod', 'Yes - כן', 'Like English Y', 25),
('Z', 'ז', 'Zayin', 'Zoo - גן חיות', 'Like English Z', 26);

-- Update existing vocabulary_words to have proper levels based on category
UPDATE public.vocabulary_words
SET level = CASE 
  WHEN category IN ('Basic', 'Nouns', 'Verbs', 'basic') THEN 'basic'
  WHEN category IN ('Adjectives', 'Prepositions', 'food', 'travel') THEN 'intermediate'
  WHEN category IN ('Business', 'Technology', 'business', 'technology') THEN 'advanced'
  ELSE 'basic'
END
WHERE level IS NULL OR level = 'basic';