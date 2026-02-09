import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Heart, Trash2, BookOpen, Sparkles, Type } from 'lucide-react';

interface LearnedItem {
  id: string;
  vocabulary_word_id: string;
  word_pair: string;
  learned_at: string;
  english_word?: string;
  hebrew_translation?: string;
  category?: string;
  example_sentence?: string;
  isLetter?: boolean;
}

export const Learned: React.FC = () => {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';
  const navigate = useNavigate();
  const [learnedItems, setLearnedItems] = useState<LearnedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<LearnedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadLearnedItems();
  }, [user, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(learnedItems);
    } else {
      const filtered = learnedItems.filter(item =>
        (item.english_word?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.hebrew_translation?.includes(searchTerm)) ||
        (item.category?.includes(searchTerm)) ||
        (item.word_pair?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, learnedItems]);

  const loadLearnedItems = async () => {
    setLoading(true);

    try {
      // Get learned words from user_words
      const { data: userWords, error: userWordsError } = await supabase
        .from('user_words')
        .select(`
            id,
            updated_at,
            word_id,
            vocabulary_words!user_words_word_id_fkey (
                id, english_word, hebrew_translation, category, example_sentence
            )
        `)
        .eq('user_id', user!.id)
        .eq('status', 'learned')
        .order('updated_at', { ascending: false });

      if (userWordsError) throw userWordsError;

      // Also get learned letters from learned_words (legacy support for letters if they aren't in user_words)
      // Note: If letters are not in vocabulary_words, we stick to learned_words for them.
      const { data: learnedLetters, error: learnedLettersError } = await (supabase as any)
        .from('learned_words')
        .select('id, vocabulary_word_id, word_pair, learned_at')
        .eq('user_id', user!.id);

      // We need to fetch Letter details for the learned letters
      let letterItems: LearnedItem[] = [];
      if (learnedLetters && learnedLetters.length > 0) {
        const letterIds = learnedLetters.map(l => l.vocabulary_word_id);
        const { data: lettersData } = await supabase
          .from('letters')
          .select('id, english_letter, hebrew_letter, phonetic_description')
          .in('id', letterIds);

        const lettersMap = new Map(lettersData?.map(l => [l.id, l]) || []);

        letterItems = learnedLetters.map(item => {
          const letter = lettersMap.get(item.vocabulary_word_id);
          if (letter) {
            return {
              id: item.id,
              vocabulary_word_id: item.vocabulary_word_id,
              word_pair: item.word_pair,
              learned_at: item.learned_at,
              english_word: letter.english_letter,
              hebrew_translation: letter.hebrew_letter,
              category: isHebrew ? 'אותיות' : 'Letters',
              example_sentence: letter.phonetic_description || '',
              isLetter: true,
              // Store source table for unmark
              source: 'learned_words'
            } as LearnedItem & { source?: string };
          }
          return null;
        }).filter(item => item !== null) as LearnedItem[];
      }

      const wordItems: LearnedItem[] = userWords?.map(item => {
        const vocab = item.vocabulary_words;
        if (!vocab) return null;
        // vocabulary_words type might need casting if array or single object depending on relationship.
        // In one-to-many, it returns array? user_words -> vocabulary_words (word_id -> id) is many-to-one.
        // So it returns an object.
        const v = vocab as any;
        return {
          id: item.id, // user_words id
          vocabulary_word_id: item.word_id,
          word_pair: `${v.english_word} - ${v.hebrew_translation}`,
          learned_at: item.updated_at, // Use updated_at as learned time
          english_word: v.english_word,
          hebrew_translation: v.hebrew_translation,
          category: v.category,
          example_sentence: v.example_sentence,
          isLetter: false,
          source: 'user_words'
        };
      }).filter(item => item !== null) as LearnedItem[] || [];

      // Combine and Sort
      const allItems = [...wordItems, ...letterItems].sort((a, b) =>
        new Date(b.learned_at).getTime() - new Date(a.learned_at).getTime()
      );

      setLearnedItems(allItems);
    } catch (error) {
      console.error('Error loading learned items:', error);
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "לא ניתן לטעון את המילים הנלמדות" : "Could not load learned words",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unmarkAsLearned = async (itemId: string, displayWord: string, source?: string) => {
    try {
      let error;

      if (source === 'user_words') {
        // Update status back to 'new' (or 'queued'?) - let's set to 'new' so it goes back to pool
        const { error: updateError } = await supabase
          .from('user_words')
          .update({ status: 'new' })
          .eq('id', itemId);
        error = updateError;
      } else {
        // Legacy: delete from learned_words
        const { error: deleteError } = await (supabase as any)
          .from('learned_words')
          .delete()
          .eq('id', itemId);
        error = deleteError;
      }

      if (error) throw error;

      setLearnedItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: isHebrew ? "הוסר" : "Removed",
        description: isHebrew ? `"${displayWord}" הוסר מהרשימה` : `"${displayWord}" removed from list`
      });
    } catch (error) {
      console.error("Error removing item: ", error);
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "לא ניתן להסיר" : "Could not remove",
        variant: "destructive"
      });
    }
  };

  const groupedByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category || (isHebrew ? 'אחר' : 'Other');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, LearnedItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">{isHebrew ? 'טוען את המילים הנלמדות...' : 'Loading learned words...'}</p>
        </div>
      </div>
    );
  }

  if (learnedItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              <Sparkles className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {isHebrew ? 'מאגר הידע שלך' : 'Your Knowledge Base'}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{isHebrew ? 'המילים שלמדת' : 'Your Learned Words'}</h1>
          </div>

          <div className="text-center max-w-md mx-auto">
            <div className="glass-card rounded-3xl p-8">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isHebrew ? 'עוד לא למדת מילים' : 'No words learned yet'}</h2>
              <p className="text-muted-foreground mb-6">
                {isHebrew ? 'התחל ללמוד מילים חדשות ותראה אותן כאן' : 'Start learning new words and see them here'}
              </p>
              <Button onClick={() => navigate('/learn')} size="lg" className="bg-primary hover:bg-primary/90 rounded-full">
                {isHebrew ? 'התחל ללמוד' : 'Start Learning'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-hero)' }}>
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

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              <Sparkles className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {isHebrew ? 'מאגר הידע שלך' : 'Personal Knowledge Base'}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{isHebrew ? 'המילים שלמדת' : 'Your Learned Words'}</h1>
            <div className={`flex items-center justify-center gap-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <Badge className="bg-primary/20 text-primary border-primary/30 text-base px-4 py-2">
                {learnedItems.length} {isHebrew ? 'פריטים במאגר' : 'items mastered'}
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="border-white/20">
                  {filteredItems.length} {isHebrew ? 'תוצאות' : 'results'}
                </Badge>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
              <Input
                type="text"
                placeholder={isHebrew ? 'חפש מילה, תרגום או קטגוריה...' : 'Search word, translation or category...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-12' : 'pl-12'} glass-input rounded-full border-white/10 bg-white/5 placeholder:text-muted-foreground/50`}
              />
            </div>
          </div>

          {/* Words by Category */}
          <div className="space-y-10">
            {Object.entries(groupedByCategory).map(([category, items], categoryIndex) => (
              <div key={category}>
                <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                  <Badge variant="outline" className="text-sm border-white/20 bg-white/5">
                    {categoryIndex + 1}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {category === (isHebrew ? 'אותיות' : 'Letters') && <Type className="h-4 w-4 text-primary" />}
                    <h2 className="text-xl font-semibold text-foreground">
                      {category}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Card key={item.id} className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 group">
                      <CardHeader className="pb-2">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                          <Badge className="bg-primary/20 text-primary text-xs">
                            {new Date(item.learned_at).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                          </Badge>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {item.isLetter ? (isHebrew ? 'אות' : 'Letter') : (isHebrew ? 'נלמד' : 'Mastered')}
                          </span>
                        </div>
                        <CardTitle className={`text-2xl font-bold text-foreground mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {item.english_word}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className={`text-xl font-semibold text-primary ${isRTL ? 'text-right' : 'text-left'}`}>
                          {item.hebrew_translation}
                        </p>

                        {item.example_sentence && (
                          <div className="glass-card rounded-xl p-3 bg-white/5">
                            <p className={`text-sm text-muted-foreground italic ${isRTL ? 'text-right' : 'text-left'}`}>
                              "{item.example_sentence}"
                            </p>
                          </div>
                        )}

                        <Button
                          onClick={() => unmarkAsLearned(item.id, item.english_word || '', (item as any).source)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        >
                          <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {isHebrew ? 'הסר מהמאגר' : 'Remove from list'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">{isHebrew ? 'לא נמצאו תוצאות' : 'No results found'}</h3>
              <p className="text-muted-foreground">
                {isHebrew ? 'נסה לחפש במילים אחרות או בקטגוריות שונות' : 'Try searching with different keywords'}
              </p>
            </div>
          )}

          {/* Continue Learning CTA */}
          <div className="text-center mt-12">
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">
                {isHebrew ? 'טיפ: תרגול עושה מושלם. סקור את המילים שלמדת באופן קבוע!' : 'TIP: Practice makes perfect. Review your learned words regularly!'}
              </p>
              <Button onClick={() => navigate('/learn')} size="lg" className="bg-primary hover:bg-primary/90 rounded-full">
                <BookOpen className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isHebrew ? 'המשך ללמוד' : 'Continue Learning'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learned;
