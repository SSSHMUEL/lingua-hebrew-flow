import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Target, Trophy, Clock, ArrowRight, Globe, Sparkles, Star, Heart, TrendingUp } from 'lucide-react';
const Index = () => {
  const {
    user
  } = useAuth();
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
      const {
        count: learnedCount
      } = await supabase.from('learned_words').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user!.id);

      // Get total words count
      const {
        count: totalCount
      } = await supabase.from('vocabulary_words').select('*', {
        count: 'exact',
        head: true
      });
      setUserStats({
        learnedWords: learnedCount || 0,
        totalWords: totalCount || 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };
  const userProgress = userStats.totalWords > 0 ? Math.round(userStats.learnedWords / userStats.totalWords * 100) : 0;
  return <div className="min-h-screen" style={{
    background: 'var(--gradient-hero)'
  }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 backdrop-blur-sm text-sm md:text-base">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            פלטפורמת הלימוד המתקדמת בישראל
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 px-2">
            למד אנגלית
            <br />
            <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              ברמה מקצועית
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            הצטרף לאלפי מקצוענים שכבר שדרגו את הקריירה שלהם עם השיטה שלנו. למוד מילים באתר והן יופיעו באנגלית בכל אתר אחר ובסרטונים - לתרגול מתמיד ויעיל
          </p>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-6 md:mb-8">איך זה עובד?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. למד באתר</h3>
                <p className="text-muted-foreground text-sm">למד מילים חדשות עם השיטה האינטראקטיבית שלנו</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. התקן תוסף</h3>
                <p className="text-muted-foreground text-sm">התוסף יחליף מילים שלמדת בכל אתר באינטרנט</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. תרגל תמיד</h3>
                <p className="text-muted-foreground text-sm">תראה את המילים באנגלית בכל גלישה ובכתוביות</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Dashboard or Login */}
        {user ? <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{
          background: 'var(--gradient-card)'
        }}>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm mb-2">
                  <Trophy className="h-3 w-3" />
                  Level Up⭐
                </div>
                <CardTitle className="text-2xl text-foreground">שיעור זהב</CardTitle>
                <CardDescription className="text-lg">Advanced Business English</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-medium">התקדמות כללית</span>
                      <span className="text-sm font-medium">{userProgress}%</span>
                    </div>
                    <Progress value={userProgress} className="h-4" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="text-center p-4 rounded-xl bg-card/30">
                      <div className="text-3xl font-bold text-foreground">{userStats.learnedWords}</div>
                      <div className="text-sm text-muted-foreground">מילים נלמדו</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-card/30">
                      <div className="text-3xl font-bold text-foreground">24</div>
                      <div className="text-sm text-muted-foreground">שיעורים הושלמו</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-accent" />
                      Points 15+📈
                    </div>
                    <Link to="/downloads">
                      
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> : <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{
          background: 'var(--gradient-card)'
        }}>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm mb-2">
                  <Trophy className="h-3 w-3" />
                  Level Up⭐
                </div>
                <CardTitle className="text-2xl text-foreground">התחל המסע שלך</CardTitle>
                <CardDescription className="text-lg">הירשם והתחל ללמוד היום</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 rounded-xl bg-card/30">
                    <div className="text-3xl font-bold text-foreground">150+</div>
                    <div className="text-sm text-muted-foreground">מילים זמינות</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/30">
                    <div className="text-3xl font-bold text-foreground">15+</div>
                    <div className="text-sm text-muted-foreground">קטגוריות</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/auth" className="flex-1">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                      התחל עכשיו
                    </Button>
                  </Link>
                  <Link to="/downloads">
                    <Button variant="outline" size="lg" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                      תוסף כרום
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* Recommended Next Lesson and Daily Exercises */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 px-4">
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  השיעור הבא המומלץ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">המשך בדיוק מהמקום שהפסקת בשיעורים</p>
                <Link to="/learn">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    התחל שיעור
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  תרגילים יומיים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/flashcards" className="block">
                    <Button variant="outline" className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10">
                      כרטיסיות אוצר מילים
                    </Button>
                  </Link>
                  <Link to="/quiz" className="block">
                    <Button variant="outline" className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10">
                      שאלון רב-ברירה
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">שיפור מוכח</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-accent mb-2">4.9⭐</div>
              <div className="text-sm text-muted-foreground">דירוג ממוצע</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">+15K</div>
              <div className="text-sm text-muted-foreground">תלמידים פעילים</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-4 max-w-md mx-auto">
          <Link to="/learn" className="w-full">
            <Button size="lg" className="w-full px-6 md:px-8 py-3 text-base md:text-lg bg-primary hover:bg-primary/90">
              התחל את המסע שלך
            </Button>
          </Link>
          <Link to="/downloads" className="w-full">
            <Button size="lg" variant="outline" className="w-full px-6 md:px-8 py-3 text-base md:text-lg border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              הורד את התוסף 🌐
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          9 מסמך בטכנולוגיות לתהמים מקצועיים
        </div>
      </div>
    </div>;
};
export default Index;