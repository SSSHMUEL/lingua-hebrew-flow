import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen, ArrowRight, ArrowLeft, Sparkles, Star,
  Trophy, Settings, Crown, Gamepad2, Palette
} from 'lucide-react';
import { useDailyLimit } from '@/hooks/use-daily-limit';
import { Logo } from '@/components/Logo';

// Import mascot images
import mascotExcited from '@/assets/mascot-excited.png';
import mascotDancing from '@/assets/mascot-dancing.png';
import mascotThumbsup from '@/assets/mascot-thumbsup.png';
import mascotBored from '@/assets/mascot-bored.png';
import mascotSleeping from '@/assets/mascot-sleeping.png';

type MascotMood = 'sleeping' | 'bored' | 'thumbsup' | 'excited' | 'dancing';

interface MascotState {
  mood: MascotMood;
  image: string;
  message: { he: string; en: string };
}

const getMascotState = (
  wordsLearnedToday: number,
  totalLearned: number,
  lastLearnedDate: string | null
): MascotState => {
  // Check if user hasn't learned in over 2 days
  if (lastLearnedDate) {
    const daysSinceLastLearn = Math.floor(
      (Date.now() - new Date(lastLearnedDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastLearn >= 3) {
      return {
        mood: 'sleeping',
        image: mascotSleeping,
        message: {
          he: 'Zzz... התגעגעתי אליך! 😴 בוא נלמד משהו חדש!',
          en: "Zzz... I missed you! 😴 Let's learn something new!"
        }
      };
    }
    if (daysSinceLastLearn >= 1 && wordsLearnedToday === 0) {
      return {
        mood: 'bored',
        image: mascotBored,
        message: {
          he: 'משעמם לי פה לבד... 😕 בוא נתחיל ללמוד!',
          en: "I'm bored here alone... 😕 Let's start learning!"
        }
      };
    }
  }

  // Based on today's progress
  if (wordsLearnedToday === 0) {
    return {
      mood: 'bored',
      image: mascotBored,
      message: {
        he: 'היי! מוכנים להרפתקה חדשה? 🌟',
        en: "Hey! Ready for a new adventure? 🌟"
      }
    };
  }

  if (wordsLearnedToday >= 1 && wordsLearnedToday <= 2) {
    return {
      mood: 'thumbsup',
      image: mascotThumbsup,
      message: {
        he: 'יופי! התחלנו טוב! 👍 בוא נמשיך!',
        en: "Nice! Good start! 👍 Let's keep going!"
      }
    };
  }

  if (wordsLearnedToday >= 3 && wordsLearnedToday <= 4) {
    return {
      mood: 'excited',
      image: mascotExcited,
      message: {
        he: 'וואו אתה כוכב! ⭐ ממשיכים!',
        en: "Wow you're a star! ⭐ Keep going!"
      }
    };
  }

  return {
    mood: 'dancing',
    image: mascotDancing,
    message: {
      he: 'אלוף!! 🎉🎶 איזה יום מדהים!',
      en: "Champion!! 🎉🎶 What an amazing day!"
    }
  };
};

interface KidsDashboardProps {
  user: any;
}

export const KidsDashboard: React.FC<KidsDashboardProps> = ({ user }) => {
  const { isRTL, language } = useLanguage();
  const isHebrew = language === 'he';
  const { wordsLearnedToday, dailyLimit, isPremium } = useDailyLimit(user?.id);

  const [userStats, setUserStats] = useState({ learnedWords: 0, totalWords: 0 });
  const [lastLearnedDate, setLastLearnedDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadUserStats();
  }, [user]);

  const loadUserStats = async () => {
    try {
      const [{ count: learnedCount }, { count: totalCount }, { data: lastWord }] = await Promise.all([
        supabase.from('user_words').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'learned'),
        supabase.from('vocabulary_words').select('*', { count: 'exact', head: true }),
        supabase.from('user_words').select('updated_at').eq('user_id', user.id).eq('status', 'learned').order('updated_at', { ascending: false }).limit(1)
      ]);
      setUserStats({ learnedWords: learnedCount || 0, totalWords: totalCount || 0 });
      setLastLearnedDate(lastWord?.[0]?.updated_at || null);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const mascot = useMemo(
    () => getMascotState(wordsLearnedToday, userStats.learnedWords, lastLearnedDate),
    [wordsLearnedToday, userStats.learnedWords, lastLearnedDate]
  );

  const todayProgress = isPremium ? 100 : Math.min(100, (wordsLearnedToday / dailyLimit) * 100);
  const displayName = user.user_metadata?.display_name || (isHebrew ? 'חבר' : 'Buddy');

  return (
    <div className="min-h-screen relative pb-12 overflow-x-hidden" style={{ background: 'linear-gradient(135deg, hsl(260 60% 15%) 0%, hsl(270 50% 20%) 50%, hsl(250 60% 18%) 100%)' }}>
      {/* Fun background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[5%] w-[50%] h-[700px] rounded-full blur-[160px] opacity-[0.2] animate-pulse-slow" style={{ background: 'hsl(280 80% 60%)' }} />
        <div className="absolute bottom-[10%] -right-[5%] w-[40%] h-[500px] rounded-full blur-[200px] opacity-[0.15]" style={{ background: 'hsl(190 100% 50%)' }} />
        {/* Stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              top: `${10 + (i * 11) % 80}%`,
              left: `${5 + (i * 17) % 90}%`,
              width: `${6 + (i % 3) * 4}px`,
              height: `${6 + (i % 3) * 4}px`,
              background: `hsl(${40 + i * 30} 100% 70%)`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${6 + i}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 pt-8 relative z-10 max-w-[1100px]">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="text-3xl">👋</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {isHebrew ? `היי ${displayName}!` : `Hey ${displayName}!`}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Crown className={`h-3.5 w-3.5 ${isPremium ? 'text-accent' : 'text-muted-foreground/40'}`} />
                <span className="text-xs text-muted-foreground">{isPremium ? (isHebrew ? 'פרימיום' : 'Premium') : (isHebrew ? 'חינם' : 'Free')}</span>
              </div>
            </div>
          </div>
          <Link to="/profile">
            <Button variant="outline" className="glass-card border-white/10 hover:bg-white/10 rounded-2xl w-10 h-10 p-0">
              <Settings className="h-4 w-4 text-white/70" />
            </Button>
          </Link>
        </header>

        {/* Main Mascot + Speech Bubble Area */}
        <div className="flex flex-col items-center mb-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {/* Comic Speech Bubble */}
          <div className="relative mb-[-20px] z-20">
            <div className="relative bg-white rounded-3xl px-6 py-4 shadow-2xl max-w-[320px] text-center">
              <p className="text-sm md:text-base font-bold text-gray-800 leading-relaxed">
                {isHebrew ? mascot.message.he : mascot.message.en}
              </p>
              {/* Bubble tail */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 rounded-sm shadow-lg" />
            </div>
          </div>

          {/* Floating Mascot with 3D effect */}
          <div className="relative">
            <div
              className="relative z-10 transition-all duration-700"
              style={{
                animation: 'mascotFloat 3s ease-in-out infinite',
                filter: 'drop-shadow(0 30px 40px rgba(100, 50, 200, 0.4))',
              }}
            >
              <img
                src={mascot.image}
                alt="TalkFix Mascot"
                className="w-48 h-48 md:w-64 md:h-64 object-contain transition-all duration-500"
                style={{
                  transform: 'perspective(800px) rotateY(-5deg)',
                }}
              />
            </div>
            {/* Ground shadow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full opacity-30"
              style={{
                background: 'radial-gradient(ellipse, hsl(260 60% 40%) 0%, transparent 70%)',
                animation: 'shadowPulse 3s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Progress + Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Today's Progress */}
          <Card className="glass-card border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{isHebrew ? 'היום' : 'TODAY'}</span>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {wordsLearnedToday}<span className="text-sm text-muted-foreground/40 ml-1">/ {isPremium ? '∞' : dailyLimit}</span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${todayProgress}%`,
                    background: 'linear-gradient(90deg, hsl(280 80% 60%), hsl(320 80% 60%), hsl(40 100% 60%))',
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total Words */}
          <Card className="glass-card border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">{isHebrew ? 'סה"כ' : 'TOTAL'}</span>
              </div>
              <div className="text-3xl font-black text-white mb-2">
                {userStats.learnedWords}
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-medium">
                {isHebrew ? 'מילים שלמדת' : 'words learned'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Big CTA Button */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link to="/learn" className="block">
            <Button
              className="w-full py-8 rounded-3xl text-xl font-black uppercase shadow-2xl transition-all hover:translate-y-[-3px] hover:shadow-primary/30"
              style={{
                background: 'linear-gradient(135deg, hsl(280 80% 55%), hsl(320 80% 55%))',
                border: 'none',
              }}
            >
              {isHebrew ? '🚀 בוא נלמד!' : "🚀 LET'S LEARN!"}
              {isRTL ? <ArrowLeft className="mr-3 h-6 w-6" /> : <ArrowRight className="ml-3 h-6 w-6" />}
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          {[
            { to: '/practice', icon: Gamepad2, label: isHebrew ? 'תרגול' : 'Practice', color: 'hsl(280 70% 60%)' },
            { to: '/learned', icon: BookOpen, label: isHebrew ? 'ספרייה' : 'Library', color: 'hsl(200 80% 55%)' },
            { to: '/ai-subtitles', icon: Sparkles, label: isHebrew ? 'AI' : 'AI', color: 'hsl(40 90% 55%)' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="group">
              <Card className="glass-card border-white/10 rounded-2xl overflow-hidden shadow-lg group-hover:translate-y-[-3px] transition-all">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
                  </div>
                  <span className="text-xs font-bold text-white/80">{label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="pt-6 pb-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <Logo aria-label="TalkFix Logo" />
            <p className="text-[10px] text-muted-foreground/30">© {new Date().getFullYear()} TalkFix</p>
          </div>
        </footer>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.3; }
          50% { transform: translateX(-50%) scaleX(0.8); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};
