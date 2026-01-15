import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { useSpeechRecognition, fuzzyMatch } from '@/hooks/use-speech-recognition';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLearningLevel } from '@/hooks/use-learning-level';
import { useLetters, Letter, getLetterWordPair } from '@/hooks/use-letters';
import { BookOpen, Volume2, CheckCircle, ArrowLeft, ArrowRight, Crown, Lock, Mic, Sparkles, Type } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VocabularyWord {
  id: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair: string;
  level?: string;
}

export const Learn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  // Learning level hook
  const { level: learningLevel, loading: levelLoading } = useLearningLevel(user?.id);
  const { letters } = useLetters();
  const isLettersMode = learningLevel === 'letters';

  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [categoryWords, setCategoryWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [learnedLetterPairs, setLearnedLetterPairs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Speech Practice Mode states
  const [speechPracticeMode, setSpeechPracticeMode] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState(false);
  const [showNextAfterSuccess, setShowNextAfterSuccess] = useState(false);

  const { canLearnMore, isPremium, remainingWords, refresh: refreshDailyLimit, dailyLimit, loading: limitLoading } = useDailyLimit(user?.id);

  // Navigation functions (defined before useCallback that uses them)
  const nextWord = useCallback(() => {
    if (currentIndex < categoryWords.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentWord(categoryWords[newIndex]);
    }
  }, [currentIndex, categoryWords]);

  const nextItem = useCallback(() => {
    if (isLettersMode) {
      if (currentIndex < letters.length - 1) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        setCurrentLetter(letters[newIndex]);
      }
    } else {
      nextWord();
    }
  }, [isLettersMode, currentIndex, letters, nextWord]);

  const previousItem = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      if (isLettersMode) {
        setCurrentLetter(letters[newIndex]);
      } else {
        setCurrentWord(categoryWords[newIndex]);
      }
    }
  }, [currentIndex, isLettersMode, letters, categoryWords]);

  // Speech recognition hook
  const handleSpeechResult = useCallback((transcript: string) => {
    const targetWord = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
    if (!targetWord || !speechPracticeMode) return;

    const isMatch = fuzzyMatch(transcript, targetWord);

    if (isMatch) {
      setSpeechSuccess(true);
      setShowNextAfterSuccess(true);

      toast({
        title: isHebrew ? "מצוין! 🎉" : "Correct! 🎉",
        description: isHebrew
          ? `אמרת "${transcript}" - הגייה מושלמת!`
          : `You said "${transcript}" - Perfect pronunciation!`,
      });

      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        if (speechPracticeMode) {
          nextItem();
          setSpeechSuccess(false);
          setShowNextAfterSuccess(false);
        }
      }, 1500);
    }
  }, [currentWord, currentLetter, speechPracticeMode, isHebrew, isLettersMode, nextItem]);

  const handleSpeechError = useCallback((error: string) => {
    toast({
      title: isHebrew ? "שגיאת דיבור" : "Speech Error",
      description: error,
      variant: "destructive",
    });
  }, [isHebrew]);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Reset speech states when word/letter changes
  useEffect(() => {
    setSpeechSuccess(false);
    setShowNextAfterSuccess(false);
    resetTranscript();
  }, [currentWord, currentLetter, resetTranscript]);

  // Load letters data
  const loadLettersData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: learnedData } = await supabase
        .from('learned_words')
        .select('word_pair')
        .eq('user_id', user.id);

      const learnedPairs = new Set(learnedData?.map(item => item.word_pair) || []);
      setLearnedLetterPairs(learnedPairs);

      if (letters.length > 0) {
        const isHebrewToEnglish = language === 'he';
        const firstUnlearnedIndex = letters.findIndex(letter => {
          const wordPair = getLetterWordPair(letter, isHebrewToEnglish);
          return !learnedPairs.has(wordPair);
        });

        const startIndex = firstUnlearnedIndex >= 0 ? firstUnlearnedIndex : 0;
        setCurrentIndex(startIndex);
        setCurrentLetter(letters[startIndex]);
        setCurrentCategory(isHebrew ? 'אותיות' : 'Letters');
      }
    } catch (error) {
      console.error('Error loading letters data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, letters, language, isHebrew]);

  // Load vocabulary data
  const loadLearningData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: learnedData } = await supabase
        .from('learned_words')
        .select('vocabulary_word_id')
        .eq('user_id', user.id);

      const learnedSet = new Set(learnedData?.map(item => item.vocabulary_word_id) || []);
      setLearnedWords(learnedSet);

      const levelMap: { [key: string]: string[] } = {
        'basic': ['basic', 'beginner', 'elementary'],
        'intermediate': ['intermediate'],
        'advanced': ['advanced', 'upper-intermediate']
      };

      const levelValues = levelMap[learningLevel] || ['basic'];

      const { data: wordsData } = await supabase
        .from('vocabulary_words')
        .select('*')
        .in('level', levelValues)
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (wordsData && wordsData.length > 0) {
        const categories = [...new Set(wordsData.map(word => word.category))];
        let targetCategory = '';
        let targetWords: VocabularyWord[] = [];

        for (const category of categories) {
          const categoryWordsData = wordsData.filter(word => word.category === category);
          const unlearnedInCategory = categoryWordsData.filter(word => !learnedSet.has(word.id));

          if (unlearnedInCategory.length > 0) {
            targetCategory = category;
            targetWords = categoryWordsData;
            break;
          }
        }

        if (targetWords.length === 0) {
          targetCategory = categories[0];
          targetWords = wordsData.filter(word => word.category === targetCategory);
        }

        setCurrentCategory(targetCategory);
        setCategoryWords(targetWords);

        const firstUnlearnedIndex = targetWords.findIndex(word => !learnedSet.has(word.id));
        const startIndex = firstUnlearnedIndex >= 0 ? firstUnlearnedIndex : 0;

        setCurrentIndex(startIndex);
        setCurrentWord(targetWords[startIndex]);
      } else {
        setCurrentWord(null);
        setCategoryWords([]);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "לא ניתן לטעון את נתוני הלמידה" : "Could not load learning data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, learningLevel, isHebrew]);

  // Load data based on learning level
  useEffect(() => {
    if (!user || levelLoading) return;

    if (isLettersMode) {
      loadLettersData();
    } else {
      loadLearningData();
    }
  }, [user, levelLoading, isLettersMode, loadLettersData, loadLearningData]);

  // Unified mark as learned for both letters and words
  const markAsLearned = async () => {
    if (!user) return;

    if (!isPremium && !canLearnMore) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      if (isLettersMode && currentLetter) {
        const isHebrewToEnglish = language === 'he';
        const wordPair = getLetterWordPair(currentLetter, isHebrewToEnglish);
        
        const { error } = await supabase
          .from('learned_words')
          .insert({
            user_id: user.id,
            vocabulary_word_id: currentLetter.id,
            word_pair: wordPair
          });

        if (error && error.code !== '23505') throw error;

        setLearnedLetterPairs(prev => new Set([...prev, wordPair]));
        toast({
          title: isHebrew ? "מעולה!" : "Excellent!",
          description: isHebrew
            ? `למדת את האות "${currentLetter.english_letter}"`
            : `You've learned the letter "${currentLetter.english_letter}"`
        });
      } else if (currentWord) {
        const { error } = await supabase
          .from('learned_words')
          .insert({
            user_id: user.id,
            vocabulary_word_id: currentWord.id,
            word_pair: currentWord.word_pair
          });

        if (error && error.code !== '23505') throw error;

        setLearnedWords(prev => new Set([...prev, currentWord.id]));
        toast({
          title: isHebrew ? "מעולה!" : "Excellent!",
          description: isHebrew
            ? `למדת את המילה "${currentWord.english_word}"`
            : `You've learned the word "${currentWord.english_word}"`
        });
      }

      await refreshDailyLimit();
      nextItem();
    } catch (error) {
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "לא ניתן לסמן כנלמד" : "Could not mark as learned",
        variant: "destructive"
      });
    }
  };

  const speakItem = () => {
    if ('speechSynthesis' in window) {
      const text = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
      if (text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
  };

  const totalItems = isLettersMode ? letters.length : categoryWords.length;
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0;

  if (loading || limitLoading || levelLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">{isHebrew ? 'טוען את שיעור הלמידה...' : 'Loading learning lesson...'}</p>
        </div>
      </div>
    );
  }

  // Check if there's content to learn
  const hasContent = isLettersMode ? currentLetter !== null : currentWord !== null;

  if (!hasContent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{isHebrew ? 'כל הכבוד!' : 'Well done!'}</h2>
          <p className="text-muted-foreground mb-4">
            {isLettersMode 
              ? (isHebrew ? 'למדת את כל האותיות' : 'You have learned all the letters')
              : (isHebrew ? 'למדת את כל המילים' : 'You have learned all the words')}
          </p>
          <Button onClick={() => navigate('/learned')} className="glow-primary">
            {isHebrew ? 'צפה במה שלמדת' : 'View what you learned'}
          </Button>
        </div>
      </div>
    );
  }

  // Hebrew translations for phonetic descriptions
  const phoneticDescriptionsHebrew: Record<string, string> = {
    'Silent letter or "ah" sound': 'אות שקטה או צליל "אָ"',
    'Like English B': 'כמו B באנגלית',
    'K sound (ק) or S sound (ס)': 'צליל ק או צליל ס',
    'Like English D': 'כמו D באנגלית',
    'Short or long E sound': 'צליל E קצר או ארוך',
    'Like English F': 'כמו F באנגלית',
    'Like English G in "go"': 'כמו G ב-"go"',
    'Like English H': 'כמו H באנגלית',
    'Like English I or Y sound': 'כמו I או Y באנגלית',
    'Soft J sound': 'צליל J רך',
    'Like English K': 'כמו K באנגלית',
    'Like English L': 'כמו L באנגלית',
    'Like English M': 'כמו M באנגלית',
    'Like English N': 'כמו N באנגלית',
    'O sound variations': 'וריאציות של צליל O',
    'Like English P': 'כמו P באנגלית',
    'Like English Q/K': 'כמו Q/K באנגלית',
    'Guttural R sound': 'צליל R גרוני',
    'Like English S': 'כמו S באנגלית',
    'Like English T': 'כמו T באנגלית',
    'Like English U': 'כמו U באנגלית',
    'Like English V': 'כמו V באנגלית',
    'Like English W': 'כמו W באנגלית',
    'KS sound combination': 'שילוב צלילים KS',
    'Like English Y': 'כמו Y באנגלית',
    'Like English Z': 'כמו Z באנגלית'
  };

  // Get display content based on mode
  const displayTitle = isLettersMode ? currentLetter?.english_letter : currentWord?.english_word;
  const displayTranslation = isLettersMode ? currentLetter?.hebrew_letter : currentWord?.hebrew_translation;
  
  // Get phonetic description with Hebrew translation if in Hebrew mode
  const getPhoneticDescription = () => {
    if (!isLettersMode) return currentWord?.example_sentence;
    const englishDesc = currentLetter?.phonetic_description || '';
    if (isHebrew && phoneticDescriptionsHebrew[englishDesc]) {
      return phoneticDescriptionsHebrew[englishDesc];
    }
    return englishDesc;
  };
  
  const displayDescription = getPhoneticDescription();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.3)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(190 85% 55% / 0.25)' }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center glow-primary">
                {isLettersMode ? <Type className="h-6 w-6 text-primary-foreground" /> : <BookOpen className="h-6 w-6 text-primary-foreground" />}
              </div>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-xl font-bold">
                  {isLettersMode 
                    ? (isHebrew ? 'לימוד אותיות' : 'Letter Learning')
                    : (isHebrew ? 'שיעור פעיל' : 'Active Lesson')}
                </h1>
                <p className="text-sm text-muted-foreground">{currentCategory}</p>
              </div>
            </div>
            <Badge className="glass-card border-primary/30 text-primary px-4 py-2">
              <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {currentIndex + 1} / {totalItems} {isLettersMode ? (isHebrew ? 'אותיות' : 'letters') : (isHebrew ? 'מילים' : 'words')}
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-primary font-semibold">{Math.round(progress)}%</span>
              <span className="text-sm text-muted-foreground">
                {isLettersMode
                  ? (isHebrew ? `אות ${currentIndex + 1} מתוך ${totalItems}` : `Letter ${currentIndex + 1} of ${totalItems}`)
                  : (isHebrew ? `מילה ${currentIndex + 1} מתוך ${totalItems}` : `Word ${currentIndex + 1} of ${totalItems}`)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Daily Limit Banner */}
          {!isPremium && (
            <div className="mb-6 glass-card rounded-[2rem] p-4 border-primary/30">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {isHebrew
                      ? `מנוי חינמי: נותרו לך ${remainingWords} היום מתוך ${dailyLimit}`
                      : `Free Plan: You have ${remainingWords} left today out of ${dailyLimit}`}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground glow-primary shrink-0"
                >
                  <Crown className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {isHebrew ? 'שדרג לפרימיום' : 'Upgrade to Premium'}
                </Button>
              </div>
            </div>
          )}

          {/* Speech Practice Mode Toggle */}
          {isSupported && (
            <div className="mb-6 glass-card rounded-[2rem] p-4 border-accent/30">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-accent" />
                  <div>
                    <Label htmlFor="speech-mode" className="text-sm font-bold cursor-pointer text-foreground block">
                      {isHebrew ? 'מצב תרגול דיבור' : 'Speech Practice Mode'}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isHebrew ? 'אמור את המילה באנגלית כדי להתקדם' : 'Say the word in English to proceed'}
                    </p>
                  </div>
                </div>

                <Switch
                  id="speech-mode"
                  dir={isRTL ? "rtl" : "ltr"}
                  checked={speechPracticeMode}
                  onCheckedChange={(checked) => {
                    setSpeechPracticeMode(checked);
                    if (!checked) {
                      stopListening();
                      setSpeechSuccess(false);
                      setShowNextAfterSuccess(false);
                    }
                  }}
                  className="data-[state=checked]:bg-accent shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Main Learning Card */}
          <Card className="glass-card border-white/10 mb-6 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <Badge className="mx-auto mb-4 bg-primary/20 text-primary border-primary/30">
                {isLettersMode ? (isHebrew ? 'אות חדשה' : 'NEW LETTER') : (isHebrew ? 'מילה חדשה' : 'NEW DISCOVERY')}
              </Badge>
              <CardTitle className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                {displayTitle}
              </CardTitle>
              <Button
                onClick={speakItem}
                variant="outline"
                size="lg"
                className="mx-auto glass-button border-white/20 hover:bg-white/10"
                aria-label={isHebrew ? "השמעה" : "Speak"}
              >
                <Volume2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'האזן עכשיו' : 'LISTEN NOW'}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Description/Example */}
                <div className={`glass-card rounded-[2rem] p-6 border-white/10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    {isLettersMode ? (isHebrew ? 'תיאור' : 'Description') : (isHebrew ? 'דוגמה לשימוש' : 'Usage Example')}
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {displayDescription}
                  </p>
                </div>

                {/* Translation */}
                <div className={`glass-card rounded-[2rem] p-6 border-white/10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                    {isHebrew ? 'תרגום לעברית' : 'Hebrew Translation'}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {displayTranslation}
                  </p>
                  {isLettersMode && currentLetter?.pronunciation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {currentLetter.pronunciation}
                    </p>
                  )}
                </div>
              </div>

              {/* Speech Practice */}
              {speechPracticeMode && (
                <div className="glass-card rounded-[2rem] p-6 border-accent/30 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {isHebrew ? 'לחץ על הכפתור ואמור:' : 'Click the button and say:'}
                  </p>
                  <p className="text-2xl font-bold text-accent mb-4">{displayTitle}</p>
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent/90'} text-white`}
                  >
                    <Mic className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isListening ? (isHebrew ? 'עצור' : 'Stop') : (isHebrew ? 'התחל לדבר' : 'Start Speaking')}
                  </Button>
                  {speechSuccess && (
                    <p className="text-green-500 mt-4 font-bold">
                      {isHebrew ? '✓ מצוין!' : '✓ Excellent!'}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={previousItem}
              variant="ghost"
              disabled={currentIndex === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isHebrew ? 'הקודם' : 'Previous'}
            </Button>

            {(!speechPracticeMode || showNextAfterSuccess) && (
              <Button
                onClick={markAsLearned}
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground glow-primary px-8 py-6 text-lg"
              >
                <CheckCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'למדתי!' : 'I Learned It!'}
              </Button>
            )}

            <Button
              onClick={nextItem}
              variant="ghost"
              disabled={currentIndex >= totalItems - 1}
              className="text-muted-foreground hover:text-foreground"
            >
              {isHebrew ? 'דלג' : 'Skip'}
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              {isHebrew ? 'הגעת לגבול היומי!' : 'Daily Limit Reached!'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {isHebrew
                ? `למדת ${dailyLimit} היום! כדי להמשיך ללא הגבלה, שדרג לפרימיום.`
                : `You've learned ${dailyLimit} today! To continue without limits, upgrade to Premium.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel className="glass-button">{isHebrew ? 'אחר כך' : 'Later'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-primary to-primary/80 glow-primary"
            >
              <Crown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isHebrew ? 'שדרג עכשיו' : 'Upgrade Now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Learn;
