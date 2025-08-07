-- Clear existing data and update structure for the new format
DELETE FROM vocabulary_words;
DELETE FROM learned_words;

-- Add a new column for the word pair format if it doesn't exist
ALTER TABLE vocabulary_words ADD COLUMN IF NOT EXISTS word_pair text;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vocabulary_words_word_pair ON vocabulary_words(word_pair);

-- Insert vocabulary words in the new format: Hebrew - English
INSERT INTO vocabulary_words (word_pair, english_word, hebrew_translation, category, example_sentence) VALUES
-- Basic examples from user
('אז - so', 'so', 'אז', 'מילות קישור', 'So, let''s start learning - אז בואו נתחיל ללמוד'),
('לא - not', 'not', 'לא', 'מילות שלילה', 'This is not correct - זה לא נכון'),
('להשקיע - invest', 'invest', 'להשקיע', 'פעלים כלכליים', 'I want to invest money - אני רוצה להשקיע כסף'),
('למה - why', 'why', 'למה', 'מילות שאלה', 'Why are you late? - למה אתה מאחר?'),
('נאסד"ק - nasdaq', 'nasdaq', 'נאסד"ק', 'כלכלה', 'The Nasdaq is rising - הנאסד"ק עולה'),

-- Common words for learning
('בית - home', 'home', 'בית', 'שמות עצם', 'I am going home - אני הולך הביתה'),
('ספר - book', 'book', 'ספר', 'שמות עצם', 'I read a book - אני קורא ספר'),
('מחשב - computer', 'computer', 'מחשב', 'שמות עצם', 'I use a computer - אני משתמש במחשב'),
('כיסא - chair', 'chair', 'כיסא', 'שמות עצם', 'Please sit on the chair - אנא שב על הכיסא'),
('שולחן - table', 'table', 'שולחן', 'שמות עצם', 'The book is on the table - הספר על השולחן'),
('מכונית - car', 'car', 'מכונית', 'שמות עצם', 'I drive a car - אני נוהג במכונית'),
('עיר - city', 'city', 'עיר', 'שמות עצם', 'Tel Aviv is a big city - תל אביב היא עיר גדולה'),
('ילד - child', 'child', 'ילד', 'שמות עצם', 'The child is playing - הילד משחק'),
('כסף - money', 'money', 'כסף', 'שמות עצם', 'I need money - אני צריך כסף'),
('אוכל - food', 'food', 'אוכל', 'שמות עצם', 'The food is delicious - האוכל טעים'),

-- Verbs
('ללכת - to go', 'to go', 'ללכת', 'פעלים', 'I want to go home - אני רוצה ללכת הביתה'),
('לבוא - to come', 'to come', 'לבוא', 'פעלים', 'Please come here - בוא כאן בבקשה'),
('לאכול - to eat', 'to eat', 'לאכול', 'פעלים', 'I want to eat - אני רוצה לאכול'),
('לשתות - to drink', 'to drink', 'לשתות', 'פעלים', 'I need to drink water - אני צריך לשתות מים'),
('לישון - to sleep', 'to sleep', 'לישון', 'פעלים', 'I go to sleep early - אני הולך לישון מוקדם'),
('לקרוא - to read', 'to read', 'לקרוא', 'פעלים', 'I like to read books - אני אוהב לקרוא ספרים'),
('לכתוב - to write', 'to write', 'לכתוב', 'פעלים', 'I write in Hebrew - אני כותב בעברית'),
('לדבר - to speak', 'to speak', 'לדבר', 'פעלים', 'I speak English - אני מדבר אנגלית'),
('לשחק - to play', 'to play', 'לשחק', 'פעלים', 'Children like to play - ילדים אוהבים לשחק'),
('ללמוד - to learn', 'to learn', 'ללמוד', 'פעלים', 'I learn Hebrew - אני לומד עברית'),

-- Adjectives
('גדול - big', 'big', 'גדול', 'תארים', 'This is a big house - זה בית גדול'),
('קטן - small', 'small', 'קטן', 'תארים', 'I have a small car - יש לי מכונית קטנה'),
('חדש - new', 'new', 'חדש', 'תארים', 'I bought a new book - קניתי ספר חדש'),
('ישן - old', 'old', 'ישן', 'תארים', 'This is an old building - זה בניין ישן'),
('טוב - good', 'good', 'טוב', 'תארים', 'This is good food - זה אוכל טוב'),
('רע - bad', 'bad', 'רע', 'תארים', 'The weather is bad - מזג האוויר רע'),
('יפה - beautiful', 'beautiful', 'יפה', 'תארים', 'She is beautiful - היא יפה'),
('מכוער - ugly', 'ugly', 'מכוער', 'תארים', 'That building is ugly - הבניין ההוא מכוער'),
('חם - hot', 'hot', 'חם', 'תארים', 'The coffee is hot - הקפה חם'),
('קר - cold', 'cold', 'קר', 'תארים', 'The water is cold - המים קרים');

-- Update the learned_words table structure to match the new format
-- The word_pair column should store the format: Hebrew - English