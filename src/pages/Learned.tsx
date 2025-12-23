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
import { Search, Heart, Trash2, BookOpen, Sparkles } from 'lucide-react';

interface LearnedWord {
  id: string;
  vocabulary_word_id: string;
  learned_at: string;
  vocabulary_words: {
    english_word: string;
    hebrew_translation: string;
    category: string;
    example_sentence: string;
  };
}

export const Learned: React.FC = () => {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<LearnedWord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadLearnedWords();
  }, [user, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredWords(learnedWords);
    } else {
      const filtered = learnedWords.filter(word => 
        word.vocabulary_words.english_word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.vocabulary_words.hebrew_translation.includes(searchTerm) ||
        word.vocabulary_words.category.includes(searchTerm)
      );
      setFilteredWords(filtered);
    }
  }, [searchTerm, learnedWords]);

  const loadLearnedWords = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('learned_words')
        .select(`
          id,
          vocabulary_word_id,
          learned_at,
          vocabulary_words (
            english_word,
            hebrew_translation,
            category,
            example_sentence
          )
        `)
        .eq('user_id', user!.id)
        .order('learned_at', { ascending: false });

      if (error) throw error;

      setLearnedWords(data || []);
    } catch (error) {
      console.error('Error loading learned words:', error);
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: isRTL ? "לא ניתן לטעון את המילים הנלמדות" : "Could not load learned words",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const unmarkAsLearned = async (wordId: string, englishWord: string) => {
    try {
      const { error } = await supabase
        .from('learned_words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;

      setLearnedWords(prev => prev.filter(word => word.id !== wordId));
      
      toast({
        title: isRTL ? "הוסר" : "Removed",
        description: isRTL ? `המילה "${englishWord}" הוסרה מהרשימה` : `"${englishWord}" removed from list`
      });
    } catch (error) {
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: isRTL ? "לא ניתן להסיר את המילה" : "Could not remove word",
        variant: "destructive"
      });
    }
  };

  const groupedByCategory = filteredWords.reduce((acc, word) => {
    const category = word.vocabulary_words.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(word);
    return acc;
  }, {} as Record<string, LearnedWord[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">{isRTL ? 'טוען את המילים הנלמדות...' : 'Loading learned words...'}</p>
        </div>
      </div>
    );
  }

  if (learnedWords.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {isRTL ? 'מאגר הידע שלך' : 'Your Knowledge Base'}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{isRTL ? 'המילים שלמדת' : 'Your Learned Words'}</h1>
          </div>
          
          <div className="text-center max-w-md mx-auto">
            <div className="glass-card rounded-3xl p-8">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-4 text-foreground">{isRTL ? 'עוד לא למדת מילים' : 'No words learned yet'}</h2>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'התחל ללמוד מילים חדשות ותראה אותן כאן' : 'Start learning new words and see them here'}
              </p>
              <Button onClick={() => navigate('/learn')} size="lg" className="bg-primary hover:bg-primary/90 rounded-full">
                {isRTL ? 'התחל ללמוד' : 'Start Learning'}
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
              <Sparkles className="h-3 w-3 mr-1" />
              {isRTL ? 'מאגר הידע שלך' : 'Personal Knowledge Base'}
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-4">{isRTL ? 'המילים שלמדת' : 'Your Learned Words'}</h1>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-base px-4 py-2">
                {learnedWords.length} {isRTL ? 'מילים במאגר' : 'words mastered'}
              </Badge>
              {searchTerm && (
                <Badge variant="outline" className="border-white/20">
                  {filteredWords.length} {isRTL ? 'תוצאות' : 'results'}
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
                placeholder={isRTL ? 'חפש מילה, תרגום או קטגוריה...' : 'Search word, translation or category...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-12' : 'pl-12'} glass-input rounded-full border-white/10 bg-white/5 placeholder:text-muted-foreground/50`}
              />
            </div>
          </div>

          {/* Words by Category */}
          <div className="space-y-10">
            {Object.entries(groupedByCategory).map(([category, words], categoryIndex) => (
              <div key={category}>
                <div className="flex items-center gap-4 mb-6">
                  <Badge variant="outline" className="text-sm border-white/20 bg-white/5">
                    {categoryIndex + 1}
                  </Badge>
                  <h2 className="text-xl font-semibold text-foreground">
                    {category}
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {words.map((word) => (
                    <Card key={word.id} className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 group">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/20 text-primary text-xs">
                            {new Date(word.learned_at).toLocaleDateString(isRTL ? 'he-IL' : 'en-US')}
                          </Badge>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {isRTL ? 'נלמד' : 'Mastered'}
                          </span>
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground mt-2">
                          {word.vocabulary_words.english_word}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-xl font-semibold text-primary">
                          {word.vocabulary_words.hebrew_translation}
                        </p>
                        
                        <div className="glass-card rounded-xl p-3 bg-white/5">
                          <p className="text-sm text-muted-foreground italic">
                            "{word.vocabulary_words.example_sentence}"
                          </p>
                        </div>

                        <Button 
                          onClick={() => unmarkAsLearned(word.id, word.vocabulary_words.english_word)}
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-full"
                        >
                          <Trash2 className="h-4 w-4 mx-1" />
                          {isRTL ? 'הסר מהמאגר' : 'Remove from list'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">{isRTL ? 'לא נמצאו תוצאות' : 'No results found'}</h3>
              <p className="text-muted-foreground">
                {isRTL ? 'נסה לחפש במילים אחרות או בקטגוריות שונות' : 'Try searching with different keywords'}
              </p>
            </div>
          )}

          {/* Continue Learning CTA */}
          <div className="text-center mt-12">
            <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'טיפ: תרגול עושה מושלם. סקור את המילים שלמדת באופן קבוע!' : 'TIP: Practice makes perfect. Review your learned words regularly!'}
              </p>
              <Button onClick={() => navigate('/learn')} size="lg" className="bg-primary hover:bg-primary/90 rounded-full">
                <BookOpen className="h-5 w-5 mx-2" />
                {isRTL ? 'המשך ללמוד' : 'Continue Learning'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learned;
