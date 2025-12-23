import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle, FlipHorizontal2, Sparkles } from 'lucide-react';

interface VocabularyWord {
  id: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair?: string;
}

const Flashcards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const current = words[index];
  const isRTL = true;

  useEffect(() => {
    document.title = isRTL ? 'כרטיסיות אוצר מילים | TALK FIX' : 'Vocabulary Flashcards | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', isRTL ? 'תרגלו כרטיסיות באנגלית-עברית: למידה מהירה עם הגייה, דוגמאות והתקדמות אישית' : 'Practice English-Hebrew flashcards: fast learning with pronunciation, examples and personal progress');
  }, [isRTL]);

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
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) {
        toast({ title: 'שגיאה', description: 'טעינת הכרטיסיות נכשלה', variant: 'destructive' });
      } else {
        setWords(data || []);
      }
      setLoading(false);
    })();
  }, [user, navigate]);

  const speak = () => {
    if (current && 'speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(current.english_word);
      utt.lang = 'en-US';
      utt.rate = 0.9;
      speechSynthesis.speak(utt);
    }
  };

  const markLearned = async () => {
    if (!current || !user) return;
    const { error } = await supabase.from('learned_words').insert({
      user_id: user.id,
      vocabulary_word_id: current.id,
      word_pair: current.word_pair || `${current.hebrew_translation} - ${current.english_word}`,
    });
    if (error) {
      toast({ title: 'שגיאה', description: 'לא ניתן לסמן כנלמד', variant: 'destructive' });
    } else {
      toast({ title: 'נשמר', description: 'המילה נוספה למילים הנלמדות' });
    }
  };

  const next = () => {
    setShowBack(false);
    setIndex((i) => (i < words.length - 1 ? i + 1 : i));
  };
  const prev = () => {
    setShowBack(false);
    setIndex((i) => (i > 0 ? i - 1 : i));
  };

  const cardTitle = useMemo(() => (showBack ? current?.hebrew_translation : current?.english_word), [showBack, current]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <p className="text-muted-foreground">טוען כרטיסיות...</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <p className="text-lg">אין כרטיסיות להצגה כעת</p>
          <Button onClick={() => navigate('/learn')} className="glow-primary">חזרה ללמידה</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right side (weaker than homepage) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.35)' }}
        />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            FLASHCARDS
          </Badge>
          <h1 className="text-3xl font-bold">כרטיסיות אוצר מילים</h1>
          <Badge className="mt-2 glass-card border-white/20">{current.category}</Badge>
        </div>

        <Card className="glass-card border-white/10 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl md:text-6xl font-bold select-none transition-all duration-300">
              {cardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => setShowBack((v) => !v)}
                className="glass-button border-white/20"
              >
                <FlipHorizontal2 className="h-5 w-5 ml-2" />
                היפוך
              </Button>
              <Button 
                variant="outline" 
                onClick={speak}
                className="glass-button border-white/20"
              >
                <Volume2 className="h-5 w-5 ml-2" />
                השמעה
              </Button>
              <Button 
                onClick={markLearned}
                className="bg-gradient-to-r from-accent to-accent/80 glow-accent"
              >
                <CheckCircle className="h-5 w-5 ml-2" />
                סמן כנלמד
              </Button>
            </div>

            <div className="glass-card rounded-xl p-4 border-white/10">
              <p className="text-muted-foreground">{current.example_sentence}</p>
            </div>

            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={prev} 
                disabled={index === 0}
                className="glass-button border-white/20"
              >
                <ArrowLeft className="h-5 w-5 ml-2" /> קודם
              </Button>
              <span className="text-sm text-muted-foreground">{index + 1} / {words.length}</span>
              <Button 
                variant="outline" 
                onClick={next} 
                disabled={index === words.length - 1}
                className="glass-button border-white/20"
              >
                הבא <ArrowRight className="h-5 w-5 mr-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Flashcards;
