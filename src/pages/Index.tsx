import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  BookOpen, Target, Trophy, Clock, ArrowRight, ArrowLeft,
  Globe, Sparkles, Star, Zap, Brain, CheckCircle2,
  Settings, User, Crown
} from 'lucide-react';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { Logo } from '@/components/Logo';
import { LandingPage } from '@/pages/LandingPage';
import { KidsDashboard } from '@/components/KidsDashboard';

const Index = () => {
  const { user } = useAuth();
  const { isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const isHebrew = language === 'he';
  const { wordsLearnedToday, dailyLimit, isPremium, remainingWords } = useDailyLimit(user?.id);

  const [userStats, setUserStats] = useState({
    learnedWords: 0,
    totalWords: 0
  });
  const [audienceType, setAudienceType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
      loadAudienceType();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const { count: learnedCount } = await supabase
        .from('user_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('status', 'learned');

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

  const loadAudienceType = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('audience_type')
        .eq('user_id', user!.id)
        .single();
      setAudienceType(profile?.audience_type || null);
    } catch (error) {
      console.error('Error loading audience type:', error);
    }
  };

  if (!user) {
    return <LandingPage />;
  }

  if (audienceType === 'kids') {
    return <KidsDashboard user={user} />;
  }

  const todayProgress = isPremium ? 100 : Math.min(100, (wordsLearnedToday / dailyLimit) * 100);

  return (
    <div className="min-h-screen relative pb-12 overflow-x-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Enhanced Background Atmosphere with Stronger Orange + Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(50,150,255,0.12),transparent_70%)]" />
        <div className="absolute top-[10%] -left-[5%] w-[50%] h-[700px] rounded-full blur-[160px] opacity-[0.25] animate-pulse-slow" style={{ background: 'hsl(25 100% 58%)' }} />
        <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[500px] rounded-full blur-[200px] opacity-[0.12]" style={{ background: 'hsl(190 100% 50%)' }} />

        {/* Floating particles */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        <div className="absolute top-[60%] left-[20%] w-2 h-2 rounded-full bg-accent/40 animate-float" style={{ animationDelay: '4s', animationDuration: '12s' }} />
        <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }} />
        <div className="absolute top-[70%] right-[25%] w-2.5 h-2.5 rounded-full bg-accent/25 animate-float" style={{ animationDelay: '3s', animationDuration: '11s' }} />
      </div>

      <div className="container mx-auto px-6 pt-10 relative z-10 max-w-[1300px]">
        {/* Elegant/Refined Welcome Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-fade-in">
          <div className="space-y-4">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase italic">
                {isHebrew ? 'מרכז שליטה אישי' : 'STUDENT HUB'}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              {isHebrew ? `שלום, ${user.user_metadata?.display_name || 'שמואל'}!` : `HELLO, ${user.user_metadata?.display_name || 'SAM'}!`}
            </h1>
            <p className="text-lg text-muted-foreground/80 font-medium max-w-xl italic">
              {isHebrew
                ? 'מוכנים להמשיך את המסע שלכם היום?'
                : 'Ready to continue your journey today?'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'} px-5 border-white/10 ${isRTL ? 'border-l' : 'border-r'}`}>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{isHebrew ? 'סטטוס חשבון' : 'ACCOUNT STATUS'}</span>
              <div className="flex items-center gap-2">
                <Crown className={`h-3.5 w-3.5 ${isPremium ? 'text-accent' : 'text-muted-foreground/40'}`} />
                <span className={`text-lg font-black italic ${isPremium ? 'text-accent' : 'text-white/80'}`}>{isPremium ? (isHebrew ? 'פרימיום' : 'PREMIUM') : (isHebrew ? 'חינם' : 'FREE')}</span>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="glass-card border-white/10 hover:bg-white/10 rounded-2xl w-12 h-12 p-0 shadow-xl flex items-center justify-center transition-all group">
                <Settings className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </Button>
            </Link>
          </div>
        </header>

        {/* The Refined Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Main Action Card with Animated Border */}
          <div className="lg:col-span-7 group">
            <div className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-br from-primary/30 via-accent/30 to-primary/30 bg-[length:200%_200%] animate-shimmer">
              <Card className="glass-card border-0 h-full overflow-hidden relative min-h-[400px] rounded-[2.5rem] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

                {/* Animated corner accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/20 to-transparent rounded-tr-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="h-full p-10 flex flex-col justify-between relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-primary font-black text-xs italic tracking-widest uppercase">
                      <Sparkles className="h-4 w-4" />
                      {isHebrew ? 'המלצה חכמה' : 'SMART RECOMMENDATION'}
                    </div>

                    <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">
                      {isHebrew ? 'בואו נמשיך מאיפה שעצרנו' : 'READY TO PICK UP THE PACE?'}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-lg">
                      {isHebrew
                        ? 'השיעור האחרון שלך מחכה. נותרו לך עוד כמה צעדים קטנים למעבר לרמת השליטה הבאה.'
                        : 'Your last session is waiting. Just a few more words to unlock your next proficiency level.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-8">
                    <Link to="/learn" className="flex-1 min-w-[200px]">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-[1.5rem] shadow-xl transition-all hover:translate-y-[-3px] uppercase text-xl">
                        {isHebrew ? 'המשך ללמוד' : 'CONTINUE'}
                        {isRTL ? <ArrowLeft className="mr-3 h-6 w-6" /> : <ArrowRight className="ml-3 h-6 w-6" />}
                      </Button>
                    </Link>
                    <Link to="/practice">
                      <Button variant="outline" className="h-full glass-card border-white/10 hover:bg-white/10 font-black px-8 rounded-[1.5rem] text-lg uppercase transition-all">
                        {isHebrew ? 'תרגול' : 'PRACTICE'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Side Info Grid */}
          <div className="lg:col-span-5 grid grid-rows-2 gap-6">
            <Card className="glass-card border-white/5 bg-gradient-to-br from-accent/5 to-transparent relative overflow-hidden group rounded-[2.5rem] shadow-xl hover:shadow-accent/20 transition-all duration-500">
              {/* Animated progress ring background */}
              <div className="absolute top-4 right-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-accent/30" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-accent transition-all duration-1000"
                    strokeDasharray={`${todayProgress * 2.827} 282.7`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <CardContent className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black tracking-widest text-accent/80 uppercase italic">{isHebrew ? 'התקדמות יומית' : 'DAILY PERFORMANCE'}</p>
                  <Trophy className="h-5 w-5 text-accent opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                </div>
                <div className="text-5xl font-black italic text-white mb-4 tracking-tighter group-hover:scale-105 transition-transform origin-right">
                  {wordsLearnedToday}<span className="text-xl text-muted-foreground/30 ml-3">/ {isPremium ? '∞' : dailyLimit}</span>
                </div>
                <div className="space-y-4">
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-accent via-accent/80 to-accent opacity-80 rounded-full transition-all duration-1000 ease-out" style={{ width: `${todayProgress}%` }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5 relative overflow-hidden group rounded-[2.5rem] shadow-xl hover:shadow-primary/20 transition-all duration-500">
              {/* Pulsing book icon background */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <BookOpen className="w-full h-full text-primary animate-pulse" />
              </div>

              <CardContent className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-black tracking-widest text-primary/80 uppercase italic">{isHebrew ? 'אוצר מילים' : 'VOCABULARY STATUS'}</p>
                  <BookOpen className="h-5 w-5 text-primary opacity-40 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                </div>
                <div className="text-5xl font-black italic text-white mb-4 tracking-tighter group-hover:scale-105 transition-transform origin-right">
                  {userStats.learnedWords}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-primary/20 text-primary font-black py-1 px-3 italic rounded-lg hover:bg-primary/10 transition-colors">{isHebrew ? 'רמה 24' : 'LVL 24'}</Badge>
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{isHebrew ? 'דרגת מאסטר' : 'MASTER RANK'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Refined Quick Actions with Gradient Borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/ai-subtitles" className="group">
            <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-accent/20 via-transparent to-accent/20 group-hover:from-accent/40 group-hover:to-accent/40 transition-all duration-500">
              <Card className="glass-card border-0 transition-all duration-300 rounded-[2rem] shadow-lg group-hover:translate-y-[-5px] bg-card/95">
                <div className="p-8 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-lg group-hover:shadow-accent/20">
                    <Sparkles className="h-7 w-7 text-accent/70 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight">{isHebrew ? 'כתוביות AI' : 'AI SUBTITLES'}</h3>
                    <p className="text-xs text-muted-foreground/60 font-medium">{isHebrew ? 'למד מסרטוני אנגלית' : 'Learn from English videos'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Link>

          <Link to="/learned" className="group">
            <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-primary/20 group-hover:from-primary/40 group-hover:to-primary/40 transition-all duration-500">
              <Card className="glass-card border-0 transition-all duration-300 rounded-[2rem] shadow-lg group-hover:translate-y-[-5px] bg-card/95">
                <div className="p-8 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-lg group-hover:shadow-primary/20">
                    <BookOpen className="h-7 w-7 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight">{isHebrew ? 'ספרייה' : 'LIBRARY'}</h3>
                    <p className="text-xs text-muted-foreground/60 font-medium">{isHebrew ? 'סקור את המילים שלך' : 'Review your words'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Link>

          <Link to="/downloads" className="group">
            <div className="relative p-[1px] rounded-[2rem] bg-gradient-to-br from-white/10 via-transparent to-white/10 group-hover:from-white/20 group-hover:to-white/20 transition-all duration-500">
              <Card className="glass-card border-0 transition-all duration-300 rounded-[2rem] shadow-lg group-hover:translate-y-[-5px] bg-card/95">
                <div className="p-8 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center group-hover:scale-110 transition-transform group-hover:shadow-lg group-hover:shadow-white/10">
                    <Globe className="h-7 w-7 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight">{isHebrew ? 'תוסף דפדפן' : 'EXTENSION'}</h3>
                    <p className="text-xs text-muted-foreground/60 font-medium">{isHebrew ? 'גלוש ולמד' : 'Browse & Learn'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Link>
        </div>

        {/* Footer - Matching Landing Page Style */}
        <footer className="mt-16 pt-8 pb-6 border-t border-white/5">
          <div className={`flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''} justify-between items-center gap-6 mb-6`}>
            {/* Logo */}
            <div className="flex items-center">
              <Logo aria-label={isHebrew ? "TalkFix - לוגו" : "TalkFix Logo"} />
            </div>

            {/* Policy Links */}
            <nav className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-6 flex-wrap justify-center`}>
              <Link to="/privacy" className="text-sm text-muted-foreground/60 hover:text-primary transition-colors">
                {isHebrew ? 'מדיניות פרטיות' : 'Privacy Policy'}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground/60 hover:text-primary transition-colors">
                {isHebrew ? 'תנאי שימוש' : 'Terms of Service'}
              </Link>
              <Link to="/refund" className="text-sm text-muted-foreground/60 hover:text-primary transition-colors">
                {isHebrew ? 'מדיניות החזרים' : 'Refund Policy'}
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground/60 hover:text-primary transition-colors">
                {isHebrew ? 'אודות' : 'About'}
              </Link>
            </nav>
          </div>

          {/* Copyright */}
          <div className={`text-center md:${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-xs text-muted-foreground/40">
              {isHebrew
                ? `© ${new Date().getFullYear()} TalkFix. כל הזכויות שמורות.`
                : `© ${new Date().getFullYear()} TalkFix. All rights reserved.`}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};


export default Index;
