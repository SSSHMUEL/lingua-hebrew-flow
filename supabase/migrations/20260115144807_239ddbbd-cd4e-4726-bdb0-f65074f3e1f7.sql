-- Remove the foreign key constraint from learned_words.vocabulary_word_id 
-- so letters can be stored without referencing vocabulary_words table
ALTER TABLE public.learned_words 
DROP CONSTRAINT IF EXISTS learned_words_vocabulary_word_id_fkey;

-- Add a comment explaining the change
COMMENT ON COLUMN public.learned_words.vocabulary_word_id IS 'ID of the vocabulary word or letter. No longer has FK constraint to allow letters from the letters table.';