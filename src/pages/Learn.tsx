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
import { BookOpen, Volume2, CheckCircle, ArrowLeft, ArrowRight, Crown, Lock, Mic, MicOff, CheckCircle2 } from 'lucide-react';
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">טוען את שיעור הלמידה...</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">כל הכבוד!</h2>
          <p className="text-muted-foreground mb-4">למדת את כל המילים</p>
          <Button onClick={() => navigate('/learned')}>
            צפה במילים שלמדת
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">שיעור: {currentCategory}</h1>
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-secondary to-secondary/80">
              {currentCategory}
            </Badge>
          </div>

          {/* Daily Limit Banner for Free Users */}
          {!isPremium && (
            <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/10">
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
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                >
                  <Crown className="h-4 w-4 ml-1" />
                  שדרג לפרימיום
                </Button>
              </div>
            </div>
          )}

          {/* Speech Practice Mode Toggle */}
          {isSupported && (
            <div className="mb-6 p-4 rounded-xl border border-accent/30 bg-accent/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mic className="h-5 w-5 text-accent-foreground" />
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

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} מתוך {categoryWords.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {learnedInCategory} מילים נלמדו
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Main Learning Card */}
          <Card className="mb-6 shadow-2xl border-0 bg-gradient-to-br from-card via-card to-secondary/20">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                {currentWord.english_word}
              </CardTitle>
              <Button 
                onClick={speakWord}
                variant="outline" 
                size="lg"
                className="mx-auto border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Volume2 className="h-5 w-5 ml-2" />
                הקריאה
              </Button>
            </CardHeader>
            
            <CardContent className="text-center space-y-6">
              <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl p-6 border border-secondary/40">
                <h3 className="text-2xl font-semibold text-secondary-foreground mb-2">
                  תרגום לעברית
                </h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {currentWord.hebrew_translation}
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-6 border border-accent/30">
                <h3 className="text-lg font-semibold text-accent-foreground mb-3">
                  דוגמה במשפט עם תרגום
                </h3>
                <div className="space-y-3">
                  <p className="text-lg font-medium text-foreground">
                    "{currentWord.example_sentence.split(' - ')[0]}"
                  </p>
                  <p className="text-lg italic text-muted-foreground border-t border-accent/20 pt-3">
                    "{currentWord.example_sentence.split(' - ')[1] || currentWord.example_sentence}"
                  </p>
                </div>
              </div>

              {/* Speech Practice Section */}
              {speechPracticeMode && (
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30">
                  <div className="flex flex-col items-center gap-4">
                    {speechSuccess ? (
                      <div className="flex flex-col items-center gap-2 animate-pulse">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="text-lg font-semibold text-green-600">מצוין! עובר למילה הבאה...</p>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={isListening ? stopListening : startListening}
                          size="lg"
                          variant={isListening ? "destructive" : "default"}
                          className={isListening ? "animate-pulse" : "bg-gradient-to-r from-primary to-accent"}
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

              <div className="flex justify-center gap-4 pt-4">
                <Button 
                  onClick={previousWord}
                  variant="outline"
                  disabled={currentIndex === 0}
                  size="lg"
                >
                  <ArrowLeft className="h-5 w-5 ml-2" />
                  קודם
                </Button>

                <Button 
                  onClick={markAsLearned}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={learnedWords.has(currentWord.id)}
                >
                  <CheckCircle className="h-5 w-5 ml-2" />
                  {learnedWords.has(currentWord.id) ? 'נלמד' : 'למדתי!'}
                </Button>

                {/* Hide Next button in speech mode unless success */}
                {(!speechPracticeMode || showNextAfterSuccess) && (
                  <Button 
                    onClick={nextWord}
                    variant="outline"
                    disabled={currentIndex === categoryWords.length - 1}
                    size="lg"
                  >
                    הבא
                    <ArrowRight className="h-5 w-5 mr-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Progress */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              התקדמות בקטגוריה: {learnedInCategory} / {categoryWords.length} מילים
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              הגעת למגבלה היומית!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
              במנוי החינמי ניתן ללמוד עד {dailyLimit} מילים ביום.
              <br />
              <span className="font-semibold text-primary">שדרג לפרימיום</span> כדי ללמוד מילים ללא הגבלה!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="sm:w-1/2">
              אולי מחר
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate('/pricing')}
              className="sm:w-1/2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
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
