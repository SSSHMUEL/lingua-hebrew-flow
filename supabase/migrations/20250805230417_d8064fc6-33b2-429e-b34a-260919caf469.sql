-- Create vocabulary_words table with all the provided words
CREATE TABLE public.vocabulary_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  english_word TEXT NOT NULL,
  hebrew_translation TEXT NOT NULL,
  category TEXT NOT NULL,
  example_sentence TEXT,
  pronunciation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learned_words table to track user progress
CREATE TABLE public.learned_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vocabulary_word_id UUID NOT NULL REFERENCES public.vocabulary_words(id) ON DELETE CASCADE,
  learned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vocabulary_word_id)
);

-- Enable RLS
ALTER TABLE public.vocabulary_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learned_words ENABLE ROW LEVEL SECURITY;

-- Policies for vocabulary_words (public read access)
CREATE POLICY "Anyone can view vocabulary words" 
ON public.vocabulary_words 
FOR SELECT 
USING (true);

-- Policies for learned_words (user-specific access)
CREATE POLICY "Users can view their own learned words" 
ON public.learned_words 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learned words" 
ON public.learned_words 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learned words" 
ON public.learned_words 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_vocabulary_words_updated_at
BEFORE UPDATE ON public.vocabulary_words
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all the vocabulary words with categories
INSERT INTO public.vocabulary_words (english_word, hebrew_translation, category, example_sentence) VALUES
-- Home & Family
('house', 'בית', 'בית ומשפחה', 'I live in a big house.'),
('family', 'משפחה', 'בית ומשפחה', 'My family is very important to me.'),
('mother', 'אמא', 'בית ומשפחה', 'My mother is a teacher.'),
('father', 'אבא', 'בית ומשפחה', 'My father works in an office.'),
('brother', 'אח', 'בית ומשפחה', 'I have one brother.'),
('sister', 'אחות', 'בית ומשפחה', 'My sister is older than me.'),
('son', 'בן', 'בית ומשפחה', 'Their son is very smart.'),
('daughter', 'בת', 'בית ומשפחה', 'Their daughter loves to read.'),
('child', 'ילד/ה', 'בית ומשפחה', 'The child is playing in the garden.'),
('door', 'דלת', 'בית ומשפחה', 'Please close the door.'),
('window', 'חלון', 'בית ומשפחה', 'Open the window for fresh air.'),
('table', 'שולחן', 'בית ומשפחה', 'Put the book on the table.'),
('chair', 'כיסא', 'בית ומשפחה', 'Sit on the chair.'),
('bed', 'מיטה', 'בית ומשפחה', 'I sleep in my bed.'),
('lamp', 'מנורה', 'בית ומשפחה', 'Turn on the lamp.'),

-- Basic Communication
('hello', 'שלום', 'תקשורת בסיסית', 'Hello, how are you?'),
('goodbye', 'להתראות', 'תקשורת בסיסית', 'Goodbye, see you tomorrow.'),
('please', 'בבקשה', 'תקשורת בסיסית', 'Can you help me, please?'),
('thank you', 'תודה', 'תקשורת בסיסית', 'Thank you for your help.'),
('yes', 'כן', 'תקשורת בסיסית', 'Yes, I agree.'),
('no', 'לא', 'תקשורת בסיסית', 'No, I disagree.'),
('language', 'שפה', 'תקשורת בסיסית', 'English is a global language.'),

-- People & Identity
('man', 'גבר', 'אנשים וזהות', 'The man is walking.'),
('woman', 'אישה', 'אנשים וזהות', 'The woman is reading.'),
('boy', 'ילד', 'אנשים וזהות', 'The boy is playing football.'),
('girl', 'ילדה', 'אנשים וזהות', 'The girl is drawing.'),
('friend', 'חבר', 'אנשים וזהות', 'He is my best friend.'),
('name', 'שם', 'אנשים וזהות', 'What is your name?'),
('age', 'גיל', 'אנשים וזהות', 'What is your age?'),

-- Time & Calendar
('time', 'זמן', 'זמן ולוח שנה', 'What time is it?'),
('day', 'יום', 'זמן ולוח שנה', 'Today is a beautiful day.'),
('night', 'לילה', 'זמן ולוח שנה', 'Good night, sleep well.'),
('morning', 'בוקר', 'זמן ולוח שנה', 'Good morning!'),
('evening', 'ערב', 'זמן ולוח שנה', 'Good evening!'),
('week', 'שבוע', 'זמן ולוח שנה', 'I work five days a week.'),
('month', 'חודש', 'זמן ולוח שנה', 'December is the last month.'),
('year', 'שנה', 'זמן ולוח שנה', 'This year is 2024.'),
('today', 'היום', 'זמן ולוח שנה', 'Today is Monday.'),
('tomorrow', 'מחר', 'זמן ולוח שנה', 'Tomorrow is Tuesday.'),
('yesterday', 'אתמול', 'זמן ולוח שנה', 'Yesterday was Sunday.'),
('clock', 'שעון', 'זמן ולוח שנה', 'Look at the clock.'),

-- Technology
('computer', 'מחשב', 'טכנולוגיה', 'I use my computer for work.'),
('phone', 'טלפון', 'טכנולוגיה', 'My phone is ringing.'),
('technology', 'טכנולוגיה', 'טכנולוגיה', 'Technology changes our lives.'),
('internet', 'אינטרנט', 'טכנולוגיה', 'I browse the internet daily.'),
('website', 'אתר אינטרנט', 'טכנולוגיה', 'This website is very useful.'),
('application', 'יישום', 'טכנולוגיה', 'I downloaded a new application.'),
('camera', 'מצלמה', 'טכנולוגיה', 'I take photos with my camera.'),

-- Learning & Education
('learn', 'ללמוד', 'למידה וחינוך', 'I want to learn English.'),
('book', 'ספר', 'למידה וחינוך', 'I am reading a good book.'),
('school', 'בית ספר', 'למידה וחינוך', 'Children go to school.'),
('teacher', 'מורה', 'למידה וחינוך', 'My teacher is very kind.'),
('student', 'תלמיד', 'למידה וחינוך', 'Every student should study hard.'),
('lesson', 'שיעור', 'למידה וחינוך', 'Today we have an English lesson.'),

-- Actions & Verbs
('eat', 'לאכול', 'פעולות', 'I eat breakfast every morning.'),
('drink', 'לשתות', 'פעולות', 'I drink water daily.'),
('sleep', 'לישון', 'פעולות', 'I sleep eight hours.'),
('read', 'לקרוא', 'פעולות', 'I read books in my free time.'),
('write', 'לכתוב', 'פעולות', 'I write in my diary.'),
('speak', 'לדבר', 'פעולות', 'I speak English and Hebrew.'),
('listen', 'להקשיב', 'פעולות', 'Listen to the music.'),
('see', 'לראות', 'פעולות', 'I can see the mountains.'),
('walk', 'ללכת', 'פעולות', 'I walk to work.'),
('run', 'לרוץ', 'פעולות', 'I run in the park.'),
('come', 'לבוא', 'פעולות', 'Come here, please.'),
('go', 'ללכת', 'פעולות', 'I go to the store.'),

-- Adjectives & Descriptions
('big', 'גדול', 'תיאורים', 'The elephant is big.'),
('small', 'קטן', 'תיאורים', 'The mouse is small.'),
('new', 'חדש', 'תיאורים', 'I bought a new car.'),
('old', 'ישן', 'תיאורים', 'This building is very old.'),
('good', 'טוב', 'תיאורים', 'This is a good idea.'),
('bad', 'רע', 'תיאורים', 'This weather is bad.'),
('beautiful', 'יפה', 'תיאורים', 'The sunset is beautiful.'),
('happy', 'שמח', 'תיאורים', 'I am happy today.'),
('sad', 'עצוב', 'תיאורים', 'She looks sad.'),

-- Nature & Weather
('water', 'מים', 'טבע ומזג אוויר', 'Water is essential for life.'),
('tree', 'עץ', 'טבע ומזג אוויר', 'The tree is very tall.'),
('sun', 'שמש', 'טבע ומזג אוויר', 'The sun is shining.'),
('moon', 'ירח', 'טבע ומזג אוויר', 'The moon is full tonight.'),
('star', 'כוכב', 'טבע ומזג אוויר', 'I can see many stars.');