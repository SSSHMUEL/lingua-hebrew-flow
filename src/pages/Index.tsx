import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Target, Trophy, Clock, ArrowRight, ArrowLeft, Globe, Sparkles, Star } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
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
      const { count: learnedCount } = await supabase
        .from('learned_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);

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

  const userProgress = userStats.totalWords > 0 
    ? Math.round((userStats.learnedWords / userStats.totalWords) * 100) 
    : 0;

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 md:px-4 md:py-2 rounded-full mb-4 md:mb-6 backdrop-blur-sm text-sm md:text-base">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
            {isRTL ? 'פלטפורמת הלימוד המתקדמת בישראל' : 'The Most Advanced Learning Platform'}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-foreground mb-4 md:mb-6 px-2">
            {t('home.title')}
            <br />
            <span className="bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
              {t('home.subtitle')}
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            {t('home.description')}
          </p>
        </div>

        {/* How It Works Section */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-6 md:mb-8">
            {t('home.howItWorks')}
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('home.step1Title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.step1Desc')}</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('home.step2Title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.step2Desc')}</p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('home.step3Title')}</h3>
                <p className="text-muted-foreground text-sm">{t('home.step3Desc')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress Dashboard or Login */}
        {user ? (
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{ background: 'var(--gradient-card)' }}>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm mb-2">
                  <Trophy className="h-3 w-3" />
                  Level Up⭐
                </div>
                <CardTitle className="text-2xl text-foreground">
                  {isRTL ? 'שיעור זהב' : 'Golden Lesson'}
                </CardTitle>
                <CardDescription className="text-lg">Advanced Business English</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-3">
                      <span className="text-sm font-medium">{t('learn.progress')}</span>
                      <span className="text-sm font-medium">{userProgress}%</span>
                    </div>
                    <Progress value={userProgress} className="h-4" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="text-center p-4 rounded-xl bg-card/30">
                      <div className="text-3xl font-bold text-foreground">{userStats.learnedWords}</div>
                      <div className="text-sm text-muted-foreground">{t('home.wordsLearned')}</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-card/30">
                      <div className="text-3xl font-bold text-foreground">24</div>
                      <div className="text-sm text-muted-foreground">{t('home.lessonsCompleted')}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-accent" />
                      Points 15+📈
                    </div>
                    <Link to="/downloads" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
            <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{ background: 'var(--gradient-card)' }}>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-3 py-1 rounded-full text-sm mb-2">
                  <Trophy className="h-3 w-3" />
                  Level Up⭐
                </div>
                <CardTitle className="text-2xl text-foreground">{t('home.startJourney')}</CardTitle>
                <CardDescription className="text-lg">
                  {isRTL ? 'הירשם והתחל ללמוד היום' : 'Sign up and start learning today'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-4 rounded-xl bg-card/30">
                    <div className="text-3xl font-bold text-foreground">150+</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'מילים זמינות' : 'Available Words'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-card/30">
                    <div className="text-3xl font-bold text-foreground">15+</div>
                    <div className="text-sm text-muted-foreground">
                      {isRTL ? 'קטגוריות' : 'Categories'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link to="/auth" className="flex-1">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                      {t('common.start')}
                    </Button>
                  </Link>
                  <Link to="/downloads">
                    <Button variant="outline" size="lg" className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
                      {isRTL ? 'תוסף כרום' : 'Chrome Extension'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommended Next Lesson and Daily Exercises */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 px-4">
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {t('home.nextLesson')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'המשך בדיוק מהמקום שהפסקת בשיעורים' : 'Continue exactly where you left off'}
                </p>
                <Link to="/learn">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    {t('home.startLesson')}
                    <ArrowIcon className="mx-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  {t('home.dailyExercises')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/flashcards" className="block">
                    <Button variant="outline" className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10">
                      {t('practice.flashcardsTitle')}
                    </Button>
                  </Link>
                  <Link to="/quiz" className="block">
                    <Button variant="outline" className="w-full justify-start border-white/20 bg-white/5 hover:bg-white/10">
                      {t('practice.quizTitle')}
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
              <div className="text-sm text-muted-foreground">
                {isRTL ? 'שיפור מוכח' : 'Proven Improvement'}
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-accent mb-2">4.9⭐</div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? 'דירוג ממוצע' : 'Average Rating'}
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-primary mb-2">+15K</div>
              <div className="text-sm text-muted-foreground">
                {isRTL ? 'תלמידים פעילים' : 'Active Students'}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-4 max-w-md mx-auto">
          <Link to="/learn" className="w-full">
            <Button size="lg" className="w-full px-6 md:px-8 py-3 text-base md:text-lg bg-primary hover:bg-primary/90">
              {t('home.startJourney')}
            </Button>
          </Link>
          <Link to="/downloads" className="w-full">
            <Button size="lg" variant="outline" className="w-full px-6 md:px-8 py-3 text-base md:text-lg border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10">
              {isRTL ? 'הורד את התוסף 🌐' : 'Download Extension 🌐'}
            </Button>
          </Link>
        </div>

        {/* Footer with Legal Links */}
        <footer className="border-t border-white/10 pt-8 mt-12">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                {isRTL ? 'תנאי שימוש' : 'Terms of Service'}
              </Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                {isRTL ? 'מדיניות פרטיות' : 'Privacy Policy'}
              </Link>
              <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                {isRTL ? 'מדיניות החזרים' : 'Refund Policy'}
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} TalkFix. {isRTL ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
