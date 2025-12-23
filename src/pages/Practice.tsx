import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlipHorizontal2, HelpCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Practice: React.FC = () => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    document.title = isRTL ? 'תרגול | TALK FIX' : 'Practice | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', isRTL ? 'בחרו תרגול: כרטיסיות או שאלון רב-ברירה' : 'Choose practice: flashcards or multiple choice quiz');
  }, [isRTL]);

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right side (weaker than homepage) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.35)' }}
        />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
            <Sparkles className="h-3 w-3 mr-1" />
            {isRTL ? 'תרגול יומי' : 'Daily Practice'}
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {isRTL ? 'מרכז התרגול' : 'Practice Center'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isRTL ? 'בחר את שיטת התרגול המועדפת עליך וחזק את הידע שלך' : 'Choose your preferred practice method and strengthen your knowledge'}
          </p>
        </div>

        {/* Practice Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FlipHorizontal2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl text-foreground">
                {isRTL ? 'כרטיסיות אוצר מילים' : 'Vocabulary Flashcards'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'תרגלו זיכרון מהיר באנגלית-עברית עם כרטיסיות אינטראקטיביות.' : 'Practice quick memory in English-Hebrew with interactive flashcards.'}
              </p>
              <Link to="/flashcards">
                <Button className="w-full bg-primary hover:bg-primary/90 rounded-full">
                  {isRTL ? 'התחל תרגול' : 'Start Practice'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-accent/30 transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HelpCircle className="h-7 w-7 text-accent-foreground" />
              </div>
              <CardTitle className="text-xl text-foreground">
                {isRTL ? 'שאלון רב-ברירה' : 'Multiple Choice Quiz'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {isRTL ? 'בדקו את עצמכם עם שאלות רב-ברירה ובחנו את הידע שלכם.' : 'Test yourself with multiple choice questions and assess your knowledge.'}
              </p>
              <Link to="/quiz">
                <Button variant="outline" className="w-full rounded-full border-white/20 bg-white/5 hover:bg-white/10">
                  {isRTL ? 'התחל מבחן' : 'Start Quiz'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Practice;
