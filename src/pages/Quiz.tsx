import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { HelpCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface VocabularyWord {
  id: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  word_pair?: string;
}

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

const Quiz: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'שאלון רב-ברירה | TOLKFIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'תרגלו שאלון רב-ברירה באנגלית-עברית עם משוב מידי וסימון מילים שנלמדו');
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabulary_words')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        toast({ title: 'שגיאה', description: 'טעינת השאלון נכשלה', variant: 'destructive' });
      } else {
        setWords(data || []);
      }
      setLoading(false);
    })();
  }, [user, navigate]);

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
      const { error } = await supabase.from('learned_words').insert({
        user_id: user.id,
        vocabulary_word_id: current.id,
        word_pair: current.word_pair || `${current.hebrew_translation} - ${current.english_word}`,
      });
      if (!error) {
        toast({ title: 'כל הכבוד!', description: 'ענית נכון והמילה סומנה כנלמדת' });
      }
    } else {
      toast({ title: 'לא מדויק', description: 'נסה שוב או עבור לשאלה הבאה', variant: 'destructive' });
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">טוען שאלון...</p>
      </div>
    );
  }

  if (!current || options.length < 4) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-primary mx-auto" />
          <p className="text-lg">אין מספיק מילים כדי ליצור שאלון (נדרשות לפחות 4)</p>
          <Button onClick={() => navigate('/learn')}>חזרה ללמידה</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">שאלון רב-ברירה</h1>
          <Badge variant="secondary" className="mt-2">בחרו את התרגום הנכון</Badge>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader>
            <CardTitle className="text-3xl text-center">{current.english_word}</CardTitle>
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
                    variant={isRight ? 'default' : 'outline'}
                    className={isRight ? '' : ''}
                    onClick={() => onSelect(opt)}
                    disabled={selected !== null}
                  >
                    {opt}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-muted-foreground">{questionIndex + 1} / {words.length}</span>
              <div className="flex gap-3">
                <Button variant="outline" onClick={restart}>
                  <RefreshCw className="h-4 w-4 ml-2" /> אתחל
                </Button>
                <Button variant="outline" onClick={next} disabled={questionIndex === words.length - 1}>
                  הבא
                </Button>
              </div>
            </div>

            {selected && (
              <div className="mt-6 p-4 rounded-lg border bg-card">
                {correct ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" /> תשובה נכונה!
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" /> תשובה שגויה. הנכון: {current.hebrew_translation}
                  </div>
                )}
                <p className="text-muted-foreground mt-2">{current.example_sentence}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
