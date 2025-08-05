import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Heart, Trash2, RotateCcw, BookOpen } from 'lucide-react';

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
    // Filter words based on search term
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
        title: "שגיאה",
        description: "לא ניתן לטעון את המילים הנלמדות",
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
        title: "הוסר",
        description: `המילה "${englishWord}" הוסרה מהרשימה`
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להסיר את המילה",
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">טוען את המילים הנלמדות...</p>
        </div>
      </div>
    );
  }

  if (learnedWords.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center text-primary mb-8">מילים נלמדות</h1>
          
          <div className="text-center max-w-md mx-auto">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">עוד לא למדת מילים</h2>
            <p className="text-muted-foreground mb-6">
              התחל ללמוד מילים חדשות ותראה אותן כאן
            </p>
            <Button onClick={() => navigate('/learn')} size="lg">
              התחל ללמוד
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-4">מילים נלמדות</h1>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {learnedWords.length} מילים נלמדו
              </Badge>
              {searchTerm && (
                <Badge variant="outline">
                  {filteredWords.length} תוצאות
                </Badge>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="חפש מילים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 text-right"
              />
            </div>
          </div>

          {/* Words by Category */}
          <div className="space-y-8">
            {Object.entries(groupedByCategory).map(([category, words]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold mb-4 text-right">
                  {category} ({words.length})
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {words.map((word) => (
                    <Card key={word.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-center">
                          {word.vocabulary_words.english_word}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="text-center space-y-3">
                        <p className="text-xl font-semibold text-primary">
                          {word.vocabulary_words.hebrew_translation}
                        </p>
                        
                        <p className="text-sm text-muted-foreground italic">
                          "{word.vocabulary_words.example_sentence}"
                        </p>
                        
                        <div className="text-xs text-muted-foreground">
                          נלמד ב: {new Date(word.learned_at).toLocaleDateString('he-IL')}
                        </div>

                        <div className="flex justify-center gap-2 pt-2">
                          <Button 
                            onClick={() => unmarkAsLearned(word.id, word.vocabulary_words.english_word)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            הסר
                          </Button>
                        </div>
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
              <h3 className="text-lg font-semibold mb-2">לא נמצאו תוצאות</h3>
              <p className="text-muted-foreground">
                נסה לחפש במילים אחרות או בקטגוריות שונות
              </p>
            </div>
          )}

          {/* Continue Learning */}
          <div className="text-center mt-12">
            <Button onClick={() => navigate('/learn')} size="lg">
              <BookOpen className="h-5 w-5 ml-2" />
              המשך ללמוד
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learned;