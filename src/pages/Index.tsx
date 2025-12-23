import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Target, Trophy, Clock, ArrowRight, ArrowLeft, Globe, Sparkles, Star, Zap, Brain, CheckCircle2 } from 'lucide-react';
import logoImage from '@/assets/logo.png';

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

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-hero)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`text-${isRTL ? 'right' : 'left'}`}>
              <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-primary/20">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {isRTL ? 'פלטפורמת הלימוד המתקדמת בישראל' : 'The Most Advanced Learning Platform'}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                {isRTL ? 'למד אנגלית' : 'Learn English'}
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                  {isRTL ? 'ברמה מקצועית' : 'Professionally'}
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
                {t('home.description')}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link to={user ? "/learn" : "/auth"}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-lg glow-primary">
                    {isRTL ? 'התחל עכשיו' : 'Start Now'}
                    <ArrowIcon className="h-5 w-5 mx-2" />
                  </Button>
                </Link>
                <Link to="/downloads">
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                    {isRTL ? 'הורד תוסף' : 'Download Extension'}
                  </Button>
                </Link>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isRTL ? 'מונע AI' : 'AI-Powered'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isRTL ? 'משוב בזמן אמת' : 'Real-time Feedback'}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {isRTL ? 'התאמה אישית' : 'Personalized'}
                </div>
              </div>
            </div>

            {/* Right - Hero Card/Image */}
            <div className="relative">
              <div className="glass-card rounded-3xl p-6 shadow-2xl animate-float">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 overflow-hidden relative">
                  <img src={logoImage} alt="TalkFix" className="w-32 h-32 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{isRTL ? 'דיוק הלמידה' : 'Learning Accuracy'}</div>
                    <div className="text-2xl font-bold text-primary">98.5%</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Zap className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">24</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'שיעורים' : 'Lessons'}</div>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <div className="text-xl font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">{isRTL ? 'מילים' : 'Words'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/15 text-primary border-primary/20">
            {isRTL ? 'המתודולוגיה שלנו' : 'Our Methodology'}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('home.howItWorks')}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t('home.step1Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step1Desc')}</p>
              <div className="mt-4 text-primary text-sm font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                {isRTL ? 'למד עוד' : 'Learn More'} <ArrowIcon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t('home.step2Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step2Desc')}</p>
              <div className="mt-4 text-accent text-sm font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                {isRTL ? 'למד עוד' : 'Learn More'} <ArrowIcon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 hover:border-primary/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t('home.step3Title')}</h3>
              <p className="text-muted-foreground text-sm">{t('home.step3Desc')}</p>
              <div className="mt-4 text-primary text-sm font-medium flex items-center justify-center gap-1 group-hover:gap-2 transition-all">
                {isRTL ? 'למד עוד' : 'Learn More'} <ArrowIcon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="glass-card border-primary/20 max-w-4xl mx-auto overflow-hidden">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
            
            <CardContent className="p-8 md:p-12 relative z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {isRTL ? 'התחל ללמוד בחינם' : 'Start Learning for Free'}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isRTL 
                      ? 'האלגוריתם שלנו מתאים את קצב הלמידה לצרכים שלך, תוך התמקדות במילים שאתה באמת משתמש בהן'
                      : 'Our AI algorithm adapts to your learning speed, focusing on the words you actually use in your daily workflow'}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{isRTL ? 'בחירת מילים מותאמת אישית' : 'Personalized Word Selection'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{isRTL ? 'תיקון AI בזמן אמת' : 'Real-time AI Correction'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{isRTL ? 'מעקב התקדמות מגומיפיד' : 'Gamified Progress Tracking'}</span>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Link to={user ? "/learn" : "/auth"}>
                      <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-lg glow-primary">
                        {isRTL ? 'התחל ללמוד בחינם' : 'Start Learning Free'}
                        <ArrowIcon className="h-5 w-5 mx-2" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Stats/Preview */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <img src={logoImage} alt="TalkFix" className="w-10 h-10 rounded-xl" />
                      <div>
                        <div className="font-semibold text-foreground">TalkFix.ai</div>
                        <div className="text-xs text-muted-foreground">{isRTL ? 'למידה מותאמת אישית' : 'Personalized Learning'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{isRTL ? 'התקדמות' : 'Progress'}</span>
                        <span className="text-primary font-medium">{userStats.learnedWords} / {userStats.totalWords}</span>
                      </div>
                      <Progress value={userProgress} className="h-2" />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="glass-card rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">{userStats.learnedWords}</div>
                          <div className="text-xs text-muted-foreground">{isRTL ? 'מילים נלמדו' : 'Words Learned'}</div>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-foreground">24</div>
                          <div className="text-xs text-muted-foreground">{isRTL ? 'שיעורים הושלמו' : 'Lessons Done'}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-primary">15K</div>
                          <div className="text-xs text-muted-foreground">{isRTL ? 'משתמשים פעילים' : 'Active Users'}</div>
                        </div>
                        <div className="glass-card rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-accent">124</div>
                          <div className="text-xs text-muted-foreground">{isRTL ? 'מילים זמינות' : 'Words Available'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="TalkFix" className="w-8 h-8 rounded-lg" />
              <span className="font-semibold text-foreground">TalkFix.ai</span>
            </div>
            
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
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                {isRTL ? 'אודות' : 'About'}
              </Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TalkFix. {isRTL ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
