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
import { BookOpen, Volume2, CheckCircle, ArrowLeft, ArrowRight, Crown, Lock, Mic, MicOff, CheckCircle2, Sparkles } from 'lucide-react';
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
}

export const Learn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState<VocabularyWord | null>(null);
  const [categoryWords, setCategoryWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  
  // Speech Practice Mode states
  const [speechPracticeMode, setSpeechPracticeMode] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState(false);
  const [showNextAfterSuccess, setShowNextAfterSuccess] = useState(false);

  const { canLearnMore, isPremium, remainingWords, refresh: refreshDailyLimit, dailyLimit, loading: limitLoading } = useDailyLimit(user?.id);

  // Speech recognition hook
  const handleSpeechResult = useCallback((transcript: string) => {
    if (!currentWord || !speechPracticeMode) return;
    
    const isMatch = fuzzyMatch(transcript, currentWord.english_word);
    
    if (isMatch) {
      setSpeechSuccess(true);
      setShowNextAfterSuccess(true);
      
      toast({
        title: "Correct! 🎉",
        description: `You said "${transcript}" - Perfect pronunciation!`,
      });
      
      // Auto-advance after 1.5 seconds
      setTimeout(() => {
        if (speechPracticeMode) {
          nextWord();
          setSpeechSuccess(false);
          setShowNextAfterSuccess(false);
        }
      }, 1500);
    }
  }, [currentWord, speechPracticeMode]);

  const handleSpeechError = useCallback((error: string) => {
    toast({
      title: "Speech Error",
      description: error,
      variant: "destructive",
    });
  }, []);

  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  // Reset speech states when word changes
  useEffect(() => {
    setSpeechSuccess(false);
    setShowNextAfterSuccess(false);
    resetTranscript();
  }, [currentWord, resetTranscript]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadLearningData();
  }, [user, navigate]);

  const loadLearningData = async () => {
    setLoading(true);
    
    try {
      // Get user's learned words
      const { data: learnedData } = await supabase
        .from('learned_words')
        .select('vocabulary_word_id')
        .eq('user_id', user!.id);

      const learnedSet = new Set(learnedData?.map(item => item.vocabulary_word_id) || []);
      setLearnedWords(learnedSet);

      // Get all vocabulary words grouped by category
      const { data: wordsData } = await supabase
        .from('vocabulary_words')
        .select('*')
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (wordsData) {
        // Group words by category
        const categories = [...new Set(wordsData.map(word => word.category))];
        
        // Find first category with unlearned words
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
          // All words learned, start from beginning
          targetCategory = categories[0];
          targetWords = wordsData.filter(word => word.category === targetCategory);
        }

        setCurrentCategory(targetCategory);
        setCategoryWords(targetWords);
        
        // Find first unlearned word in category
        const firstUnlearnedIndex = targetWords.findIndex(word => !learnedSet.has(word.id));
        const startIndex = firstUnlearnedIndex >= 0 ? firstUnlearnedIndex : 0;
        
        setCurrentIndex(startIndex);
        setCurrentWord(targetWords[startIndex]);
      }
    } catch (error) {
      console.error('Error loading learning data:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני הלמידה",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsLearned = async () => {
    if (!currentWord || !user) return;

    // Check daily limit for free users
    if (!isPremium && !canLearnMore) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      const { error } = await supabase
        .from('learned_words')
        .insert({
          user_id: user.id,
          vocabulary_word_id: currentWord.id,
          word_pair: currentWord.word_pair
        });

      if (error) throw error;

      setLearnedWords(prev => new Set([...prev, currentWord.id]));
      
      // Refresh daily limit count
      await refreshDailyLimit();
      
      toast({
        title: "מעולה!",
        description: `למדת את המילה "${currentWord.english_word}"`
      });

      // Move to next word
      nextWord();
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "כבר למדת",
          description: "המילה הזאת כבר נמצאת ברשימת המילים הנלמדות שלך"
        });
      } else {
        toast({
          title: "שגיאה",
          description: "לא ניתן לסמן את המילה כנלמדת",
          variant: "destructive"
        });
      }
    }
  };

  const nextWord = () => {
    if (currentIndex < categoryWords.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentWord(categoryWords[newIndex]);
    } else {
      // Finished category
      toast({
        title: "כל הכבוד!",
        description: `סיימת את הקטגוריה "${currentCategory}". עובר לקטגוריה הבאה...`
      });
      setTimeout(() => {
        loadLearningData(); // Load next category
      }, 1500);
    }
  };

  const previousWord = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentWord(categoryWords[newIndex]);
    }
  };

  const speakWord = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.english_word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const progress = categoryWords.length > 0 ? ((currentIndex + 1) / categoryWords.length) * 100 : 0;
  const learnedInCategory = categoryWords.filter(word => learnedWords.has(word.id)).length;

  if (loading || limitLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">טוען את שיעור הלמידה...</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">כל הכבוד!</h2>
          <p className="text-muted-foreground mb-4">למדת את כל המילים</p>
          <Button onClick={() => navigate('/learned')} className="glow-primary">
            צפה במילים שלמדת
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right, Cyan on left */}
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
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">שיעור פעיל</h1>
                <p className="text-sm text-muted-foreground">{currentCategory}</p>
              </div>
            </div>
            <Badge className="glass-card border-primary/30 text-primary px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              {categoryWords.length} / {currentIndex + 1} מילים
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-primary font-semibold">{Math.round(progress)}%</span>
              <span className="text-sm text-muted-foreground">
                מילה {currentIndex + 1} מתוך {categoryWords.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Daily Limit Banner for Free Users */}
          {!isPremium && (
            <div className="mb-6 glass-card rounded-xl p-4 border-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    מנוי חינמי: נותרו לך {remainingWords} מילים היום מתוך {dailyLimit}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/pricing')}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground glow-primary"
                >
                  <Crown className="h-4 w-4 ml-1" />
                  שדרג לפרימיום
                </Button>
              </div>
            </div>
          )}

          {/* Speech Practice Mode Toggle */}
          {isSupported && (
            <div className="mb-6 glass-card rounded-xl p-4 border-accent/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-accent" />
                  <div>
                    <Label htmlFor="speech-mode" className="text-sm font-medium cursor-pointer">
                      מצב תרגול דיבור
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      אמור את המילה באנגלית כדי להתקדם
                    </p>
                  </div>
                </div>
                <Switch
                  id="speech-mode"
                  checked={speechPracticeMode}
                  onCheckedChange={(checked) => {
                    setSpeechPracticeMode(checked);
                    if (!checked) {
                      stopListening();
                      setSpeechSuccess(false);
                      setShowNextAfterSuccess(false);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Main Learning Card */}
          <Card className="glass-card border-white/10 mb-6 overflow-hidden">
            <CardHeader className="text-center pb-4">
              <Badge className="mx-auto mb-4 bg-primary/20 text-primary border-primary/30">
                NEW DISCOVERY
              </Badge>
              <CardTitle className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                {currentWord.english_word}
              </CardTitle>
              <Button 
                onClick={speakWord}
                variant="outline" 
                size="lg"
                className="mx-auto glass-button border-white/20 hover:bg-white/10"
              >
                <Volume2 className="h-5 w-5 ml-2" />
                LISTEN NOW
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6 pb-8">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Example sentence card */}
                <div className="glass-card rounded-xl p-6 border-white/10">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">דוגמה לשימוש</p>
                  <p className="text-lg font-medium text-foreground mb-2">
                    "{currentWord.example_sentence.split(' - ')[0]}"
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    "{currentWord.example_sentence.split(' - ')[1] || currentWord.example_sentence}"
                  </p>
                </div>

                {/* Translation card */}
                <div className="glass-card rounded-xl p-6 border-white/10">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">תרגום לעברית</p>
                  <p className="text-3xl font-bold text-foreground">
                    {currentWord.hebrew_translation}
                  </p>
                </div>
              </div>

              {/* Speech Practice Section */}
              {speechPracticeMode && (
                <div className="glass-card rounded-xl p-6 border-primary/30">
                  <div className="flex flex-col items-center gap-4">
                    {speechSuccess ? (
                      <div className="flex flex-col items-center gap-2 animate-pulse">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="text-lg font-semibold text-green-500">מצוין! עובר למילה הבאה...</p>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={isListening ? stopListening : startListening}
                          size="lg"
                          className={isListening 
                            ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                            : "bg-gradient-to-r from-primary to-primary/80 glow-primary"
                          }
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-5 w-5 ml-2" />
                              עצור הקלטה
                            </>
                          ) : (
                            <>
                              <Mic className="h-5 w-5 ml-2" />
                              התחל להקליט
                            </>
                          )}
                        </Button>
                        {transcript && (
                          <p className="text-sm text-muted-foreground">
                            שמעתי: <span className="font-medium text-foreground">"{transcript}"</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          אמור את המילה "{currentWord.english_word}" בקול רם
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button 
              onClick={previousWord}
              variant="ghost"
              disabled={currentIndex === 0}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-5 w-5 ml-2" />
              Skip
            </Button>

            {(!speechPracticeMode || showNextAfterSuccess) && (
              <Button 
                onClick={markAsLearned}
                size="lg"
                className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-8 py-6 rounded-full glow-accent hover:scale-105 transition-transform"
              >
                <Sparkles className="h-5 w-5 ml-2" />
                !MASTERED IT
              </Button>
            )}

            <Button 
              onClick={() => navigate('/learned')}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Back
              <ArrowLeft className="h-5 w-5 mr-2" />
            </Button>
          </div>

          {/* Tip banner */}
          <div className="mt-8 text-center">
            <Badge className="bg-accent/20 text-accent border-accent/30 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              TIP: PRACTICE MAKES PERFECT. REVIEW YOUR LEARNED WORDS REGULARLY
            </Badge>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              הגעת למגבלה היומית
            </AlertDialogTitle>
            <AlertDialogDescription>
              למדת {dailyLimit} מילים היום! כדי להמשיך ללמוד ללא הגבלה, שדרג לחשבון פרימיום.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">אחר כך</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate('/pricing')}
              className="bg-gradient-to-r from-primary to-primary/80 glow-primary"
            >
              <Crown className="h-4 w-4 ml-2" />
              שדרג עכשיו
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Learn;
