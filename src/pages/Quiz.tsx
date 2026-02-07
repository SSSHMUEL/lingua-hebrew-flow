import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw, Sparkles, History as HistoryIcon } from 'lucide-react';

interface VocabularyWord {
  id: string;
  user_word_id?: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  word_pair?: string;
  status?: string;
}

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const isHebrew = language === 'he';

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = isHebrew ? 'שאלון רב-ברירה | TALK FIX' : 'Multiple Choice Quiz | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', isHebrew
        ? 'תרגלו שאלון רב-ברירה באנגלית-עברית עם משוב מידי וסימון מילים שנלמדו'
        : 'Practice multiple-choice English-Hebrew quiz with instant feedback and marking learned words'
      );
    }
  }, [isHebrew]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    (async () => {
      setLoading(true);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

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
            word_pair
          )
        `)
        .eq('user_id', user.id)
        .or(`status.in.(new,queued),and(status.eq.learned,or(last_practiced_at.lt.${sevenDaysAgo},last_practiced_at.is.null))`)
        .order('priority', { foreignTable: 'vocabulary_words', ascending: false })
        .limit(20);

      if (error) {
        toast({
          title: isHebrew ? 'שגיאה' : 'Error',
          description: isHebrew ? 'טעינת השאלון נכשלה' : 'Failed to load quiz',
          variant: 'destructive'
        });
      } else {
        const mappedWords = (userWordsData || []).map(item => ({
          ...(item.vocabulary_words as any),
          user_word_id: item.id,
          status: item.status
        })) as VocabularyWord[];
        setWords(mappedWords);
      }
      setLoading(false);
    })();
  }, [user, navigate, isHebrew]);

  const current = words[questionIndex];

  const options = useMemo(() => {
    if (!current || words.length < 4) return [] as string[];
    const others = words.filter((w) => w.id !== current.id);
    const picks = new Set<string>();
    while (picks.size < 3 && picks.size < others.length) {
      picks.add(others[getRandomInt(others.length)].hebrew_translation);
    }
    const arr = [current.hebrew_translation, ...Array.from(picks)];
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [current, words]);

  const onSelect = async (opt: string) => {
    if (!current || !user) return;
    setSelected(opt);
    const isCorrect = opt === current.hebrew_translation;
    setCorrect(isCorrect);
    if (isCorrect) {
      const { error } = await supabase.from('user_words').update({
        status: 'learned',
        last_practiced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
        .eq('id', current.user_word_id);
      if (!error) {
        toast({
          title: isHebrew ? 'כל הכבוד!' : 'Great job!',
          description: isHebrew ? 'ענית נכון והמילה סומנה כנלמדת' : 'You answered correctly and the word was marked as learned'
        });
      }
    } else {
      toast({
        title: isHebrew ? 'לא מדויק' : 'Not quite',
        description: isHebrew ? 'נסה שוב או עבור לשאלה הבאה' : 'Try again or move to the next question',
        variant: 'destructive'
      });
    }
  };

  const next = () => {
    setSelected(null);
    setCorrect(null);
    setQuestionIndex((i) => (i < words.length - 1 ? i + 1 : i));
  };

  const restart = () => {
    setSelected(null);
    setCorrect(null);
    setQuestionIndex(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <p className="text-muted-foreground">{isHebrew ? 'טוען שאלון...' : 'Loading quiz...'}</p>
      </div>
    );
  }

  if (!current || options.length < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-primary mx-auto" />
          <p className="text-lg">
            {isHebrew
              ? 'אין מספיק מילים כדי ליצור שאלון (נדרשות לפחות 4)'
              : 'Not enough words to create a quiz (at least 4 required)'}
          </p>
          <Button onClick={() => navigate('/learn')} className="glow-primary">
            {isHebrew ? 'חזרה ללמידה' : 'Back to Learning'}
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

      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Sparkles className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
            QUIZ MODE
          </Badge>
          <h1 className="text-3xl font-bold">{isHebrew ? 'שאלון רב-ברירה' : 'Multiple Choice Quiz'}</h1>
          <p className="text-muted-foreground mt-2">{isHebrew ? 'בחרו את התרגום הנכון' : 'Choose the correct translation'}</p>
        </div>

        <Card className="glass-card border-white/10 mb-6">
          <CardHeader className="text-center">
            <div className="flex justify-center gap-2 mb-4">
              <Badge className="bg-accent/20 text-accent border-accent/30">
                {current.category}
              </Badge>
              {current.status === 'learned' && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex items-center gap-1">
                  <HistoryIcon className="h-3 w-3" />
                  {isHebrew ? 'חזרה' : 'REVIEW'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold">{current.english_word}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((opt) => {
                const isSelected = selected === opt;
                const isRight = correct && opt === current.hebrew_translation;
                const isWrong = isSelected && correct === false;
                return (
                  <Button
                    key={opt}
                    variant="outline"
                    className={`glass-button border-white/20 py-6 text-lg transition-all ${isRight
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : isWrong
                        ? 'bg-destructive/20 border-destructive/50 text-destructive'
                        : 'hover:bg-white/10'
                      }`}
                    onClick={() => onSelect(opt)}
                    disabled={selected !== null}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>

            <div className={`flex items-center justify-between mt-8 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <span className="text-sm text-muted-foreground">{questionIndex + 1} / {words.length}</span>
              <div className={`flex gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                <Button variant="outline" onClick={restart} className="glass-button border-white/20">
                  <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isHebrew ? 'אתחל' : 'Restart'}
                </Button>
                <Button
                  onClick={next}
                  disabled={questionIndex === words.length - 1}
                  className="bg-gradient-to-r from-primary to-primary/80 glow-primary"
                >
                  {isHebrew ? 'הבא' : 'Next'}
                </Button>
              </div>
            </div>

            {selected && (
              <div className="mt-6 glass-card rounded-xl p-4 border-white/10">
                {correct ? (
                  <div className={`flex items-center gap-2 text-green-400 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <CheckCircle2 className="h-5 w-5" />
                    {isHebrew ? 'תשובה נכונה!' : 'Correct answer!'}
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <XCircle className="h-5 w-5" />
                    {isHebrew ? `תשובה שגויה. הנכון: ${current.hebrew_translation}` : `Wrong answer. Correct: ${current.hebrew_translation}`}
                  </div>
                )}
                <p className={`text-muted-foreground mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>{current.example_sentence}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
