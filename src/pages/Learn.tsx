import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearningLevel } from '@/hooks/use-learning-level';
import { useSpeechRecognition, fuzzyMatch } from '@/hooks/use-speech-recognition';
import {
  BookOpen,
  Volume2,
  CheckCircle,
  Zap,
  Trophy,
  Brain,
  Timer,
  Eye,
  EyeOff,
  ArrowRight,
  Shuffle,
  Flag,
  RotateCcw,
  Mic,
  MicOff,
  Headphones,
  Check,
  X,
  Type
} from 'lucide-react';

// --- Types ---

interface VocabularyWord {
  id: string;
  user_word_id?: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair: string;
  level?: string;
  priority?: number;
}

type ChallengeType =
  | 'multiple-choice'
  | 'flash-reaction'
  | 'context-completion'
  | 'word-assembly'
  | 'true-false'
  | 'listening-match'
  | 'speech-challenge';

type ViewMode = 'study' | 'challenge' | 'feedback' | 'summary';
type FeedbackStatus = 'success' | 'error' | null;

// --- Helper Functions ---

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Styles for Animations ---
const AnimationStyles = () => (
  <style>{`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
    
    @keyframes flash-green {
      0% { background-color: rgba(34, 197, 94, 0); }
      50% { background-color: rgba(34, 197, 94, 0.2); }
      100% { background-color: rgba(34, 197, 94, 0); }
    }
    .animate-flash-green { animation: flash-green 0.6s ease-out; }
    
    @keyframes flash-red {
      0% { background-color: rgba(239, 68, 68, 0); }
      50% { background-color: rgba(239, 68, 68, 0.2); }
      100% { background-color: rgba(239, 68, 68, 0); }
    }
    .animate-flash-red { animation: flash-red 0.6s ease-out; }

    @keyframes progress-fill {
      from { width: 0%; }
      to { width: 100%; }
    }
    .animate-progress-fill { animation: progress-fill 5s linear forwards; }
  `}</style>
);

export const Learn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he'; // Practically always true for this user

  const { level: learningLevel } = useLearningLevel(user?.id);
  const { refresh: refreshDailyLimit } = useDailyLimit(user?.id);

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [lessonQueue, setLessonQueue] = useState<VocabularyWord[]>([]);
  const [targetLessonSize, setTargetLessonSize] = useState(7);
  const [distractors, setDistractors] = useState<VocabularyWord[]>([]);
  const [completedWords, setCompletedWords] = useState<VocabularyWord[]>([]);

  // Settings
  const [speechModeEnabled, setSpeechModeEnabled] = useState(true);

  // Current Word State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [challengeType, setChallengeType] = useState<ChallengeType>('multiple-choice');
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);

  // Challenge Specific State
  const [options, setOptions] = useState<string[]>([]);
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);
  const [targetLetters, setTargetLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ char: string, id: number }[]>([]);
  const [showFlashText, setShowFlashText] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [comboPoints, setComboPoints] = useState(0);
  const [contextInput, setContextInput] = useState<string | null>(null);
  const [trueFalseStatement, setTrueFalseStatement] = useState<{ text: string, isTrue: boolean } | null>(null);

  // Speech Recognition
  const { isListening, startListening, stopListening, transcript, resetTranscript, isSupported } = useSpeechRecognition();

  const currentWord = lessonQueue[currentWordIndex];

  // --- Initialization ---

  const triggerRefill = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('english_level, interests')
        .eq('user_id', user.id)
        .single();
      const userLevel = profile?.english_level || 'beginner';
      const userCategory = (profile as any)?.interests?.[0] || 'general';
      const { error: refillError } = await (supabase as any).rpc('maintain_minimum_words', {
        p_user_id: user.id, p_level: userLevel, p_category: userCategory, p_min_count: 20
      });
      if (refillError) throw refillError;
    } catch (err) {
      console.error("Refill process failed:", err);
    }
  }, [user]);

  const loadLessonData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      await triggerRefill();

      // 3. Fetch Next Lesson Batch (Exactly 7 words)
      // Sorting: Status queued first, then Status new ordered by priority DESC (10 to 1)
      const { data: userWordsData, error } = await supabase.from('user_words')
        .select(`
          id,
          status,
          vocabulary_words!user_words_word_id_fkey!inner (
            id,
            english_word,
            hebrew_translation,
            category,
            example_sentence,
            pronunciation,
            word_pair,
            level,
            priority
          )
        `)
        .eq('user_id', user.id)
        .in('status', ['new', 'queued'])
        .order('status', { ascending: false }) // 'queued' (q) > 'new' (n)
        .order('priority', { foreignTable: 'vocabulary_words', ascending: false })
        .limit(7);

      if (error) throw error;

      const lessonBatch = (userWordsData || []).map(item => ({
        ...(item.vocabulary_words as any),
        user_word_id: item.id
      })) as VocabularyWord[];

      // 4. Fetch Distractors
      const { data: distractorData } = await supabase
        .from('vocabulary_words')
        .select('*')
        .limit(30);

      const distractorPool = (distractorData || []) as VocabularyWord[];

      setLessonQueue(lessonBatch);
      setTargetLessonSize(lessonBatch.length);
      setDistractors(distractorPool);
      setCompletedWords([]);
      setCurrentWordIndex(0);
      setViewMode(lessonBatch.length > 0 ? 'study' : 'summary');

    } catch (err) {
      console.error("Error loading lesson:", err);
      toast({
        title: isHebrew ? "שגיאה בטעינה" : "Error loading",
        description: isHebrew ? "לא הצלחנו לטעון את המילים לשיעור." : "Could not load words for lesson.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, isHebrew]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Handle Speech Result
  useEffect(() => {
    if (challengeType === 'speech-challenge' && viewMode === 'challenge' && transcript && currentWord && !feedbackStatus) {
      // Check if transcript matches current word
      const isMatch = fuzzyMatch(transcript, currentWord.english_word);
      if (isMatch) {
        handleAnswer(currentWord.english_word);
        stopListening();
      }
      // Optionally show partial partial match feedback or wait for more
    }
  }, [transcript, challengeType, viewMode, currentWord, feedbackStatus]);

  // --- Logic ---

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startChallenge = () => {
    if (!currentWord) return;

    // Available Challenge Types
    // Weighted selection? Or completely random.
    let types: ChallengeType[] = [
      'multiple-choice',
      'flash-reaction',
      'context-completion',
      'word-assembly',
      'true-false',
      'listening-match'
    ];

    if (speechModeEnabled && isSupported) {
      types.push('speech-challenge');
      types.push('speech-challenge'); // Give it higher weight if enabled
    }

    // Safeguard: Filter out context-completion if no example sentence
    if (!currentWord.example_sentence) {
      types = types.filter(t => t !== 'context-completion');
    }

    const randomType = types[Math.floor(Math.random() * types.length)];
    setChallengeType(randomType);
    setTimerActive(false);

    // Prepare Options based on type
    const otherWords = [...distractors, ...lessonQueue].filter(w => w.id !== currentWord.id);
    // Distinct fallback
    const uniqueOtherWords = Array.from(new Set(otherWords.map(w => JSON.stringify(w)))).map(s => JSON.parse(s));

    if (randomType === 'multiple-choice') {
      // 1 Correct Hebrew, 3 Distractors
      const correct = currentWord.hebrew_translation;
      const randomDistractors = shuffleArray(uniqueOtherWords).slice(0, 3).map((w: VocabularyWord) => w.hebrew_translation);
      setOptions(shuffleArray([correct, ...randomDistractors]));

    } else if (randomType === 'flash-reaction') {
      // Show Hebrew, Hide, choose English
      const correct = currentWord.english_word;
      const randomDistractor = shuffleArray(uniqueOtherWords)[0]?.english_word || '...';
      setOptions(shuffleArray([correct, randomDistractor]));
      setShowFlashText(true);
      setTimerActive(true);

    } else if (randomType === 'context-completion') {
      // English sentence with blank
      const correct = currentWord.english_word;
      const randomDistractors = shuffleArray(uniqueOtherWords).slice(0, 2).map((w: VocabularyWord) => w.english_word);
      setOptions(shuffleArray([correct, ...randomDistractors]));
      setContextInput(null);

    } else if (randomType === 'word-assembly') {
      // Scrambled letters
      // Scrambled letters
      const word = (currentWord.english_word || '').toUpperCase();
      const letters = word.split('').map((char, i) => ({ char, id: i }));
      setTargetLetters(word.split(''));
      setAvailableLetters(shuffleArray(letters));
      setAssembledLetters([]);

    } else if (randomType === 'true-false') {
      // Statement: Word = Translation. True or False.
      const isTrue = Math.random() > 0.5;
      const translation = isTrue
        ? currentWord.hebrew_translation
        : shuffleArray(uniqueOtherWords)[0]?.hebrew_translation || '...';

      setTrueFalseStatement({
        text: `${currentWord.english_word} = ${translation}`,
        isTrue
      });
      setOptions(['נכון', 'לא נכון']); // True / False in Hebrew

    } else if (randomType === 'listening-match') {
      // Play Audio, choose Hebrew
      const correct = currentWord.hebrew_translation;
      const randomDistractors = shuffleArray(uniqueOtherWords).slice(0, 3).map((w: VocabularyWord) => w.hebrew_translation);
      setOptions(shuffleArray([correct, ...randomDistractors]));
      speakWord(currentWord.english_word); // Auto play

    } else if (randomType === 'speech-challenge') {
      // Just start listening
      resetTranscript();
      startListening();
    }

    setViewMode('challenge');
    setFeedbackStatus(null);
  };

  const handleAnswer = (answer: string | boolean) => {
    if (!currentWord || feedbackStatus) return; // Prevent double clicks

    let isCorrect = false;

    if (challengeType === 'multiple-choice') {
      isCorrect = answer === currentWord.hebrew_translation;
    } else if (challengeType === 'flash-reaction') {
      isCorrect = answer === currentWord.english_word;
    } else if (challengeType === 'context-completion') {
      isCorrect = answer === currentWord.english_word;
      setContextInput(answer as string);
    } else if (challengeType === 'true-false') {
      // Answer is 'נכון' (True) or 'לא נכון' (False)
      const userBool = answer === 'נכון';
      isCorrect = userBool === trueFalseStatement?.isTrue;
    } else if (challengeType === 'listening-match') {
      isCorrect = answer === currentWord.hebrew_translation;
    } else if (challengeType === 'speech-challenge') {
      // Answer is the spoken text, validated before calling this
      isCorrect = (answer as string).toLowerCase().includes(currentWord.english_word.toLowerCase());
    }

    setFeedbackStatus(isCorrect ? 'success' : 'error');

    if (isCorrect) {
      if (timerActive) setComboPoints(prev => prev + 10);
      setTimeout(handleSuccess, 1200);
    } else {
      setComboPoints(0);
      setTimeout(handleFailure, 1500);
    }
  };

  const handleLetterClick = (charObj: { char: string, id: number }) => {
    if (feedbackStatus) return;

    // Move from available to assembled
    const newAvailable = availableLetters.filter(l => l.id !== charObj.id);
    const newAssembled = [...assembledLetters, charObj.char]; // Store just chars for simple check or obj
    setAvailableLetters(newAvailable);
    setAssembledLetters(newAssembled);

    // Check if full word assembled
    if (newAssembled.length === currentWord.english_word.length) {
      const assembledWord = newAssembled.join('');
      if (assembledWord === currentWord.english_word.toUpperCase()) {
        setFeedbackStatus('success');
        setTimeout(handleSuccess, 1200);
      } else {
        setFeedbackStatus('error');
        setTimeout(() => {
          // Reset
          const word = currentWord.english_word.toUpperCase();
          const letters = word.split('').map((char, i) => ({ char, id: i }));
          setAvailableLetters(shuffleArray(letters));
          setAssembledLetters([]);
          setFeedbackStatus(null);
        }, 1000);
      }
    }
  };

  const handleSuccess = () => {
    const isAlreadyCompleted = completedWords.some(w => w.id === currentWord.id);
    if (!isAlreadyCompleted) {
      setCompletedWords(prev => [...prev, currentWord]);
    }

    const newCompletedCount = completedWords.length + (isAlreadyCompleted ? 0 : 1);

    if (newCompletedCount >= targetLessonSize) {
      finishLesson();
    } else {
      setCurrentWordIndex(prev => prev + 1);
      setViewMode('study');
    }
  };

  const handleFailure = () => {
    const wordToRetry = currentWord;
    setLessonQueue(prev => [...prev, wordToRetry]);
    setCurrentWordIndex(prev => prev + 1);
    setViewMode('study');
    toast({
      title: isHebrew ? "לא נורא!" : "Keep trying!",
      description: isHebrew ? "המילה הועברה לסוף השיעור לתרגול נוסף." : "Word moved to end of lesson for re-test.",
    });
  };

  const finishLesson = async () => {
    setViewMode('summary');
    try {
      const uniqueIds = Array.from(new Set(completedWords.map(w => w.user_word_id)));
      uniqueIds.push(currentWord.user_word_id);
      const finalUniqueIds = Array.from(new Set(uniqueIds));

      await supabase
        .from('user_words')
        .update({ status: 'learned', updated_at: new Date().toISOString() } as any)
        .in('id', finalUniqueIds);

      // Trigger refill at end of lesson to ensure we have words for next time
      await triggerRefill();

      refreshDailyLimit();
    } catch (e) {
      console.error("Error updating status:", e);
    }
  };

  // --- Render Components ---

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Brain className="h-12 w-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (viewMode === 'summary') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in zoom-in-50 duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4 animate-bounce">
          <Trophy className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          {isHebrew ? 'השיעור הושלם!' : 'Lesson Complete!'}
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          {isHebrew ? `למדת ${targetLessonSize} מילים חדשות. כל הכבוד!` : `You mastered ${targetLessonSize} new words.`}
        </p>
        <div className="flex gap-4 mt-8">
          <Button onClick={() => navigate('/')} variant="outline" className="glass-button">
            {isHebrew ? 'חזרה לבית' : 'Home'}
          </Button>
          <Button onClick={() => window.location.reload()} className="bg-primary glow-primary">
            <RotateCcw className="mr-2 h-4 w-4" />
            {isHebrew ? 'שיעור חדש' : 'Next Lesson'}
          </Button>
        </div>
      </div>
    );
  }

  const progress = targetLessonSize > 0 ? (completedWords.length / targetLessonSize) * 100 : 0;

  return (
    <div className={`flex-1 flex flex-col w-full h-[calc(100vh-4.5rem)] relative overflow-hidden ${feedbackStatus === 'success' ? 'animate-flash-green' : feedbackStatus === 'error' ? 'animate-flash-red' : ''}`}>
      <AnimationStyles />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 blur-[100px]" />
      </div>

      <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col z-10">

        {/* Header / Progress */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isHebrew ? 'התקדמות' : 'PROGRESS'}</span>
              <span className="text-lg font-black">{completedWords.length} / {targetLessonSize}</span>
            </div>

            {/* Speech Toggle */}
            {isSupported && (
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-[10px] text-muted-foreground font-bold">{isHebrew ? 'מצב דיבור' : 'Speaking Mode'}</span>
                <Switch
                  checked={speechModeEnabled}
                  onCheckedChange={setSpeechModeEnabled}
                  className="scale-75 data-[state=checked]:bg-accent"
                />
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2 bg-white/5" />
        </div>

        {/* --- STUDY CARD --- */}
        {viewMode === 'study' && currentWord && (
          <Card className="flex-1 glass-card border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right-8 duration-500 min-h-0">
            <CardHeader className="text-center pt-6 pb-2">
              <Badge className="mx-auto mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
                {currentWord.category || 'Word'}
              </Badge>
              <CardTitle className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                {currentWord.english_word}
              </CardTitle>
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakWord(currentWord.english_word)}
                  className="text-primary hover:text-white hover:bg-primary/20 rounded-full h-10 px-6 gap-2 transition-all"
                >
                  <Volume2 className="h-5 w-5" />
                  <span className="text-sm font-bold">{currentWord.pronunciation || (isHebrew ? 'השמע' : 'Listen')}</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center p-6 space-y-4 overflow-y-auto">
              <div className="w-full p-4 glass-card bg-white/5 border-white/5 rounded-2xl text-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">{isHebrew ? 'תרגום' : 'TRANSLATION'}</span>
                <p className="text-3xl font-bold text-gray-100">{currentWord.hebrew_translation}</p>
              </div>

              <div className="w-full p-4 glass-card bg-white/5 border-white/5 rounded-2xl text-center flex-1 flex flex-col justify-center">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">{isHebrew ? 'דוגמה' : 'CONTEXT'}</span>
                <p className="text-lg text-gray-300 italic leading-relaxed">"{currentWord.example_sentence}"</p>
              </div>

              <Button
                onClick={startChallenge}
                className="w-full h-14 mt-auto rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 font-black text-lg uppercase tracking-wide"
              >
                {isHebrew ? 'אני מוכן!' : 'I KNOW THIS!'} <Brain className="mr-2 h-6 w-6" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* --- CHALLENGE CARD --- */}
        {viewMode === 'challenge' && currentWord && (
          <div className={`flex-1 flex flex-col relative ${feedbackStatus === 'error' ? 'animate-shake' : ''}`}>
            {challengeType === 'flash-reaction' && !feedbackStatus && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden rounded-full mb-2">
                <div className="h-full bg-accent animate-progress-fill" style={{ animationDuration: '5s' }} />
              </div>
            )}

            <Card className="flex-1 glass-card border-white/10 flex flex-col animate-in zoom-in-95 duration-300 min-h-0">
              <CardHeader className="text-center pb-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-1 rounded bg-black/20">
                      {challengeType === 'multiple-choice' && (isHebrew ? 'מבחן אמריקאי' : 'MULTIPLE CHOICE')}
                      {challengeType === 'flash-reaction' && (isHebrew ? 'תגובה מהירה' : 'FLASH REACTION')}
                      {challengeType === 'context-completion' && (isHebrew ? 'השלמת משפט' : 'COMPLETE THE SENTENCE')}
                      {challengeType === 'word-assembly' && (isHebrew ? 'הרכבת מילה' : 'SPELLING')}
                      {challengeType === 'true-false' && (isHebrew ? 'אמת או שקר' : 'TRUE OR FALSE')}
                      {challengeType === 'listening-match' && (isHebrew ? 'הבנת הנשמע' : 'LISTENING')}
                      {challengeType === 'speech-challenge' && (isHebrew ? 'דיבור' : 'SPEAKING')}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => startChallenge()}
                      disabled={!!feedbackStatus}
                      className="h-6 px-2 flex items-center gap-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors border border-white/10"
                    >
                      <Shuffle className="h-3 w-3" />
                      <span className="text-[9px] font-bold whitespace-nowrap">{isHebrew ? 'החלף משחק' : 'Shuffle Game'}</span>
                    </Button>
                  </div>
                  {comboPoints > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 animate-pulse">
                      <Zap className="h-3 w-3 mr-1" /> {comboPoints}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-center gap-6 p-6 pt-0 overflow-y-auto">
                {/* Question Area */}
                <div className="text-center space-y-4 mb-2">

                  {(challengeType === 'multiple-choice' || challengeType === 'word-assembly') && (
                    <h2 className="text-4xl font-black text-white">{challengeType === 'word-assembly' ? (isHebrew ? 'איית את המילה' : 'Spell the word') : currentWord.english_word}</h2>
                  )}

                  {challengeType === 'flash-reaction' && (
                    <FlashReactionView
                      hebrewWord={currentWord.hebrew_translation}
                      onHide={() => setShowFlashText(false)}
                      isHebrew={isHebrew}
                    />
                  )}

                  {challengeType === 'context-completion' && (
                    <div className="space-y-6">
                      {(() => {
                        if (!currentWord.example_sentence) return null;

                        // Try to separate English and Hebrew parts
                        // Usually formatted as "English - Hebrew" or vice versa
                        const segments = currentWord.example_sentence.split(/\s*-\s*/);

                        // Find the segment that contains the English word (the one we'll add a blank to)
                        const englishIdx = segments.findIndex(s =>
                          s.toLowerCase().includes(currentWord.english_word.toLowerCase())
                        );

                        const engPart = englishIdx !== -1 ? segments[englishIdx] : segments[0];
                        const hebPart = segments.filter((_, i) => i !== englishIdx).join(' ');

                        // Escape regex characters for robustness
                        const escapedWord = currentWord.english_word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const parts = engPart.split(new RegExp(`(${escapedWord})`, 'gi'));

                        return (
                          <>
                            <div className="text-xl md:text-2xl font-medium leading-relaxed text-gray-200" dir="ltr">
                              {parts.map((part, i) => {
                                if (part.toLowerCase() === currentWord.english_word.toLowerCase()) {
                                  return (
                                    <span key={i} className={`inline-block min-w-[80px] border-b-2 px-2 text-center transition-all ${contextInput
                                      ? (feedbackStatus === 'success' ? 'border-green-500 text-green-400 font-bold' : 'border-red-500 text-red-400')
                                      : 'border-white/30 text-transparent'
                                      }`}>
                                      {contextInput || '_______'}
                                    </span>
                                  );
                                }
                                return <span key={i}>{part}</span>;
                              })}
                            </div>

                            {hebPart && (
                              <div className="text-lg text-muted-foreground font-bold opacity-80 mt-2" dir="rtl">
                                {hebPart}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {challengeType === 'true-false' && trueFalseStatement && (
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-3xl font-bold text-white font-mono">{trueFalseStatement.text}</p>
                    </div>
                  )}

                  {challengeType === 'listening-match' && (
                    <div className="flex justify-center py-4">
                      <Button onClick={() => speakWord(currentWord.english_word)} className="h-20 w-20 rounded-full bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 animate-pulse-slow">
                        <Volume2 className="h-10 w-10" />
                      </Button>
                    </div>
                  )}

                  {challengeType === 'speech-challenge' && (
                    <div className="flex flex-col items-center py-4 gap-4">
                      <h2 className="text-3xl font-black text-white">{currentWord.english_word}</h2>
                      <button
                        onClick={() => !isListening && startListening()}
                        disabled={isListening || !!feedbackStatus}
                        className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer ${isListening ? 'bg-red-500/20 text-red-500 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-primary'}`}
                      >
                        {isListening ? <Mic className="h-10 w-10" /> : <MicOff className="h-10 w-10" />}
                      </button>
                      <p className="text-sm text-balance text-muted-foreground min-h-[1.5rem]">{transcript || (isHebrew ? 'אמור את המילה...' : 'Say the word...')}</p>

                      {!isListening && !feedbackStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startListening()}
                          className="mt-2 glass-button text-xs gap-2"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {isHebrew ? 'הקלט שוב' : 'Record Again'}
                        </Button>
                      )}
                    </div>
                  )}

                </div>

                {/* ANSWER AREA */}

                {/* Word Assembly UI */}
                {challengeType === 'word-assembly' && (
                  <div className="space-y-6">
                    {/* Assembled Slots */}
                    <div className="flex justify-center gap-2 min-h-[3rem]" dir="ltr">
                      {assembledLetters.map((char, i) => (
                        <div key={i} className="w-10 h-12 bg-white/10 border border-white/20 rounded flex items-center justify-center text-xl font-bold animate-in zoom-in">
                          {char}
                        </div>
                      ))}
                      {/* Empty Slots */}
                      {Array.from({ length: Math.max(0, currentWord.english_word.length - assembledLetters.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-10 h-12 bg-black/20 border border-white/5 rounded" />
                      ))}
                    </div>
                    {/* Available Letters */}
                    <div className="flex flex-wrap justify-center gap-2" dir="ltr">
                      {availableLetters.map((l) => (
                        <Button key={l.id} onClick={() => handleLetterClick(l)} variant="outline" className="w-10 h-12 text-lg font-bold p-0 border-white/20 hover:bg-white/10">
                          {l.char}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Options Grid */}
                {(challengeType === 'multiple-choice' || challengeType === 'flash-reaction' || challengeType === 'context-completion' || challengeType === 'true-false' || challengeType === 'listening-match') && (
                  <div className={`grid gap-3 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
                    {options.map((opt, i) => {
                      const isSelected = (challengeType === 'context-completion' && contextInput === opt) || feedbackStatus;
                      const isTheCorrectAnswer =
                        (challengeType === 'multiple-choice' && opt === currentWord.hebrew_translation) ||
                        (challengeType === 'context-completion' && opt === currentWord.english_word) ||
                        (challengeType === 'flash-reaction' && opt === currentWord.english_word) ||
                        (challengeType === 'true-false' && ((opt === 'נכון' && trueFalseStatement?.isTrue) || (opt === 'לא נכון' && !trueFalseStatement?.isTrue))) ||
                        (challengeType === 'listening-match' && opt === currentWord.hebrew_translation);

                      let btnClass = "min-h-[4rem] h-auto p-2 text-lg font-bold rounded-xl glass-button hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all whitespace-normal leading-tight";

                      if (feedbackStatus) {
                        if (isTheCorrectAnswer) {
                          btnClass = "min-h-[4rem] h-auto p-2 text-lg font-bold rounded-xl bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]";
                        } else if (challengeType === 'context-completion' && contextInput === opt && !isTheCorrectAnswer) {
                          btnClass = "min-h-[4rem] h-auto p-2 text-lg font-bold rounded-xl bg-red-500/20 border-red-500/50 text-red-400 opacity-50";
                        } else {
                          btnClass += " opacity-30 pointer-events-none";
                        }
                      }

                      return (
                        <Button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          disabled={!!feedbackStatus}
                          className={btnClass}
                          variant="ghost"
                        >
                          {opt}
                        </Button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div >
  );
};

// --- Sub Components ---

const FlashReactionView: React.FC<{ hebrewWord: string; onHide: () => void; isHebrew: boolean }> = ({ hebrewWord, onHide, isHebrew }) => {
  const [visible, setVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setVisible(false);
          onHide();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onHide]);

  return (
    <div className="h-40 flex items-center justify-center relative">
      {visible ? (
        <div className="animate-in zoom-in duration-300 text-center">
          <Eye className="w-8 h-8 mx-auto text-primary mb-2 animate-pulse" />
          <h2 className="text-5xl font-black text-white">{hebrewWord}</h2>
          <p className="text-xs text-muted-foreground mt-2 font-mono uppercase">{isHebrew ? `מסתיר בעוד ${timeLeft}` : `HIDING IN ${timeLeft}s`}</p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-50 duration-300">
          <EyeOff className="w-12 h-12 text-white/20 mx-auto" />
          <p className="text-muted-foreground mt-4 font-black">{isHebrew ? 'איזו מילה זו באנגלית?' : 'WHICH ENGLISH WORD?'}</p>
        </div>
      )}
    </div>
  );
}

export default Learn;
