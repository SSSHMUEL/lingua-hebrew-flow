import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlipHorizontal2, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Practice: React.FC = () => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    document.title = isRTL ? 'תרגול | TALK FIX' : 'Practice | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', isRTL ? 'בחרו תרגול: כרטיסיות או שאלון רב-ברירה' : 'Choose practice: flashcards or multiple choice quiz');
  }, [isRTL]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isRTL ? 'מרכז התרגול' : 'Practice Center'}
        </h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlipHorizontal2 className="h-5 w-5" /> 
                {isRTL ? 'כרטיסיות אוצר מילים' : 'Vocabulary Flashcards'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'תרגלו זיכרון מהיר באנגלית-עברית.' : 'Practice quick memory in English-Hebrew.'}
              </p>
              <Link to="/flashcards">
                <Button>{isRTL ? 'לכרטיסיות' : 'To Flashcards'}</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" /> 
                {isRTL ? 'שאלון רב-ברירה' : 'Multiple Choice Quiz'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'בדקו את עצמכם עם שאלות רב-ברירה.' : 'Test yourself with multiple choice questions.'}
              </p>
              <Link to="/quiz">
                <Button variant="outline">{isRTL ? 'לשאלון' : 'To Quiz'}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Practice;
