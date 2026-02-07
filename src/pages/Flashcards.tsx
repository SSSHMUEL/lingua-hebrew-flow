import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle, FlipHorizontal2, Sparkles, History as HistoryIcon } from 'lucide-react';

interface VocabularyWord {
  id: string;
  user_word_id?: string;
  english_word: string;
  hebrew_translation: string;
  category: string;
  example_sentence: string;
  pronunciation?: string;
  word_pair?: string;
  status?: string;
}

const Flashcards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const isHebrew = language === 'he';

  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const current = words[index];

  useEffect(() => {
    document.title = isHebrew ? 'כרטיסיות אוצר מילים | TALK FIX' : 'Vocabulary Flashcards | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', isHebrew
        ? 'תרגלו כרטיסיות באנגלית-עברית: למידה מהירה עם הגייה, דוגמאות והתקדמות אישית'
        : 'Practice English-Hebrew flashcards: fast learning with pronunciation, examples and personal progress'
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
            pronunciation,
            word_pair
          )
        `)
        .eq('user_id', user.id)
        .or(`status.in.(new,queued),and(status.eq.learned,or(last_practiced_at.lt.${sevenDaysAgo},last_practiced_at.is.null))`)
        .order('priority', { foreignTable: 'vocabulary_words', ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching words:', error);
        toast({
          title: isHebrew ? 'שגיאה' : 'Error',
          description: isHebrew ? 'טעינת הכרטיסיות נכשלה' : 'Failed to load flashcards',
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
    const { error } = await supabase.from('user_words').update({
      status: 'learned',
      last_practiced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
      .eq('id', current.user_word_id);
    if (error) {
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: isHebrew ? 'לא ניתן לסמן כנלמד' : 'Could not mark as learned',
        variant: 'destructive'
      });
    } else {
      toast({
        title: isHebrew ? 'נשמר' : 'Saved',
        description: isHebrew ? 'המילה נוספה למילים הנלמדות' : 'The word was added to learned words'
      });
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
        <p className="text-muted-foreground">{isHebrew ? 'טוען כרטיסיות...' : 'Loading flashcards...'}</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-primary mx-auto" />
          <p className="text-lg">{isHebrew ? 'אין כרטיסיות להצגה כעת' : 'No flashcards to display at this time'}</p>
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
            FLASHCARDS
          </Badge>
          <h1 className="text-3xl font-bold">{isHebrew ? 'כרטיסיות אוצר מילים' : 'Vocabulary Flashcards'}</h1>

          <div className="flex justify-center gap-2 mt-4">
            <Badge className="glass-card border-white/20">{current.category}</Badge>
            {current.status === 'learned' && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 flex items-center gap-1">
                <HistoryIcon className="h-3 w-3" />
                {isHebrew ? 'חזרה' : 'REVIEW'}
              </Badge>
            )}
          </div>
        </div>

        <Card className="glass-card border-white/10 mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl md:text-6xl font-bold select-none transition-all duration-300">
              {cardTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className={`flex justify-center gap-3 flex-wrap ${isRTL ? 'flex-row' : 'flex-row'}`}>
              <Button
                variant="outline"
                onClick={() => setShowBack((v) => !v)}
                className="glass-button border-white/20"
              >
                <FlipHorizontal2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'היפוך' : 'Flip'}
              </Button>
              <Button
                variant="outline"
                onClick={speak}
                className="glass-button border-white/20"
              >
                <Volume2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'השמעה' : 'Speak'}
              </Button>
              <Button
                onClick={markLearned}
                className="bg-gradient-to-r from-accent to-accent/80 glow-accent"
              >
                <CheckCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'סמן כנלמד' : 'Mark as Learned'}
              </Button>
            </div>

            <div className="glass-card rounded-xl p-4 border-white/10">
              <p className="text-muted-foreground">{current.example_sentence}</p>
            </div>

            <div className={`flex justify-between items-center ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <Button
                variant="outline"
                onClick={prev}
                disabled={index === 0}
                className="glass-button border-white/20"
              >
                <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'קודם' : 'Prev'}
              </Button>
              <span className="text-sm text-muted-foreground">{index + 1} / {words.length}</span>
              <Button
                variant="outline"
                onClick={next}
                disabled={index === words.length - 1}
                className="glass-button border-white/20"
              >
                {isHebrew ? 'הבא' : 'Next'}
                <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default Flashcards;
