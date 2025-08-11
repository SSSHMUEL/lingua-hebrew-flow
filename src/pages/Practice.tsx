import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlipHorizontal2, HelpCircle } from 'lucide-react';

const Practice: React.FC = () => {
  useEffect(() => {
    document.title = 'תרגול | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'בחרו תרגול: כרטיסיות או שאלון רב-ברירה');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">מרכז התרגול</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlipHorizontal2 className="h-5 w-5" /> כרטיסיות אוצר מילים
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">תרגלו זיכרון מהיר באנגלית-עברית.</p>
              <Link to="/flashcards"><Button>לכרטיסיות</Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" /> שאלון רב-ברירה
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">בדקו את עצמכם עם שאלות רב-ברירה.</p>
              <Link to="/quiz"><Button variant="outline">לשאלון</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Practice;
