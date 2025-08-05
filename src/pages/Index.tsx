import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Users, Globe, Zap, Target, Award, ArrowLeft, Heart, TrendingUp } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState({
    learnedWords: 0,
    totalWords: 0
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Get user's learned words count
      const { count: learnedCount } = await supabase
        .from('learned_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

      // Get total words count
      const { count: totalCount } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });

      setUserStats({
        learnedWords: learnedCount || 0,
        totalWords: totalCount || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: 'למידה חכמה',
      description: 'שיטת למידה מתקדמת המתמקדת בהבנה ולא ברק בשינון'
    },
    {
      icon: Target,
      title: 'נושאים ממוקדים',
      description: 'למידה בנושאים קטנים ומתמחים לקליטה מיטבית'
    },
    {
      icon: Users,
      title: 'התאמה אישית',
      description: 'מעקב אחר התקדמותכם והתאמת הלמידה לקצב שלכם'
    },
    {
      icon: Globe,
      title: 'אוצר מילים עשיר',
      description: 'מאות מילים מחולקות לקטגוריות שימושיות'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              ברוכים הבאים ללינגואה
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              למדו אנגלית בצורה חכמה, מהנה ויעילה
            </p>
            
            {user ? (
              <div className="bg-card rounded-lg p-6 shadow-lg mb-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">שלום, {user.email}!</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">מילים נלמדו:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Heart className="h-4 w-4 ml-1" />
                      {userStats.learnedWords}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">סה"כ מילים:</span>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <BookOpen className="h-4 w-4 ml-1" />
                      {userStats.totalWords}
                    </Badge>
                  </div>
                  {userStats.totalWords > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">התקדמות:</span>
                      <Badge variant="default" className="text-lg px-3 py-1">
                        <TrendingUp className="h-4 w-4 ml-1" />
                        {Math.round((userStats.learnedWords / userStats.totalWords) * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  <Link to="/learn" className="flex-1">
                    <Button size="lg" className="w-full">
                      המשך ללמוד
                      <ArrowLeft className="h-5 w-5 mr-2" />
                    </Button>
                  </Link>
                  <Link to="/learned">
                    <Button variant="outline" size="lg">
                      <Heart className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="px-8 py-3 text-lg">
                    הירשמו עכשיו
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                    התחברות
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">למה לינגואה?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">הירשמו לאתר</h3>
                <p className="text-muted-foreground">
                  צרו חשבון חינמי ותתחילו את המסע שלכם בלמידת אנגלית
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">למדו בקצב שלכם</h3>
                <p className="text-muted-foreground">
                  עברו על מילים חדשות, שמעו הגייה ולמדו מדוגמאות
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">עקבו אחר ההתקדמות</h3>
                <p className="text-muted-foreground">
                  ראו כמה מילים למדתם ובאיזה נושאים התמחתם
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-lg p-8 shadow-lg text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">הישגי הפלטפורמה</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">מילים באוצר המילים</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10+</div>
              <p className="text-muted-foreground">קטגוריות נושאיות</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">חינמי לתמיד</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!user && (
          <div className="text-center bg-primary/10 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">מוכנים להתחיל?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              הצטרפו אלינו עוד היום ותתחילו ללמוד אנגלית בצורה חכמה ויעילה
            </p>
            <Link to="/auth">
              <Button size="lg" className="px-8 py-3 text-lg">
                <BookOpen className="h-5 w-5 ml-2" />
                התחילו ללמוד עכשיו
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
