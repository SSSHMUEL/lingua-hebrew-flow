import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Download, Zap, Smartphone, Monitor, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Downloads = () => {
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  return (
    <div className="min-h-screen relative pb-12 overflow-x-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Enhanced Background Atmosphere with Stronger Orange + Cyan + Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(50,150,255,0.12),transparent_70%)]" />
        <div className="absolute top-[10%] -left-[5%] w-[50%] h-[700px] rounded-full blur-[160px] opacity-[0.25] animate-pulse-slow" style={{ background: 'hsl(25 100% 58%)' }} />
        <div className="absolute top-[40%] -right-[10%] w-[45%] h-[600px] rounded-full blur-[200px] opacity-[0.15]" style={{ background: 'hsl(190 100% 50%)' }} />
        <div className="absolute bottom-[0%] left-[20%] w-[35%] h-[500px] rounded-full blur-[180px] opacity-[0.1]" style={{ background: 'hsl(200 100% 58%)' }} />

        {/* Floating particles - Matching Index.tsx */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-accent/30 animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[15%] w-3 h-3 rounded-full bg-primary/20 animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        <div className="absolute top-[60%] left-[20%] w-2 h-2 rounded-full bg-accent/40 animate-float" style={{ animationDelay: '4s', animationDuration: '12s' }} />
        <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }} />
        <div className="absolute top-[70%] right-[25%] w-2.5 h-2.5 rounded-full bg-accent/25 animate-float" style={{ animationDelay: '3s', animationDuration: '11s' }} />
      </div>

      <div className="container mx-auto px-6 pt-10 relative z-10 max-w-[1300px]">
        {/* Elegant/Refined Header - Matching Index.tsx style */}
        <header className="mb-16 animate-fade-in text-center">
          <div className="inline-flex flex-col items-center">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase italic mb-6">
              {isHebrew ? 'מרכז הורדות' : 'DOWNLOAD CENTER'}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">
              {isHebrew ? 'הורדות' : 'DOWNLOADS'}
            </h1>
            <p className="text-xl text-muted-foreground/80 font-medium max-w-2xl italic leading-relaxed">
              {isHebrew
                ? 'בחר את הפלטפורמה המועדפת עליך והתחל ללמוד היום עם הכלים המתקדמים שלנו.'
                : 'Choose your preferred platform and start learning today with our advanced tools.'}
            </p>
          </div>
        </header>

        {/* The Refined Bento Grid for Downloads */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 px-2 sm:px-0">

          {/* Main Download Card - Chrome Extension */}
          <div className="lg:col-span-12 xl:col-span-5 group">
            <div className="relative p-[2px] rounded-[3rem] bg-gradient-to-br from-primary/40 via-accent/40 to-primary/40 bg-[length:200%_200%] animate-shimmer shadow-2xl">
              <Card className="glass-card border-0 h-full overflow-hidden relative min-h-[500px] rounded-[3rem] flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

                {/* Decorative background icon */}
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12">
                  <Globe className="w-64 h-64 text-white" />
                </div>

                <CardContent className="h-full p-10 flex flex-col justify-between relative z-10">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 text-accent font-black text-xs italic tracking-widest uppercase">
                      <Sparkles className="h-4 w-4" />
                      {isHebrew ? 'המוצר המומלץ' : 'FEATURED PRODUCT'}
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-tight">
                        {isHebrew ? 'תוסף כרום' : 'CHROME EXTENSION'}
                      </h2>
                      <p className="text-lg text-muted-foreground font-medium italic">
                        {isHebrew ? 'הדרך החכמה ביותר לשדרג את האנגלית שלך בזמן הגלישה.' : 'The smartest way to upgrade your English while browsing.'}
                      </p>
                    </div>

                    <ul className="space-y-4">
                      <li className="flex items-center text-white/90 font-bold italic">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(50,150,255,0.6)] mr-3 ml-3" />
                        {isHebrew ? 'תרגום מיידי בלחיצה' : 'Instant click translation'}
                      </li>
                      <li className="flex items-center text-white/90 font-bold italic">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(50,150,255,0.6)] mr-3 ml-3" />
                        {isHebrew ? 'למידה פסיבית חכמה' : 'Smart passive learning'}
                      </li>
                      <li className="flex items-center text-white/90 font-bold italic">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_12px_rgba(50,150,255,0.6)] mr-3 ml-3" />
                        {isHebrew ? 'סנכרון ענן מלא' : 'Full cloud synchronization'}
                      </li>
                    </ul>
                  </div>

                  <div className="mt-12">
                    <a href="https://chromewebstore.google.com/detail/talkfix-%D7%AA%D7%99%D7%A7%D7%95%D7%9F-%D7%9C%D7%93%D7%91%D7%A8/kjgimljalgihgpaokepohgenkhmlobaf?authuser=0&hl=iw" target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black py-8 rounded-[2rem] shadow-xl transition-all hover:translate-y-[-5px] uppercase text-2xl group-hover:glow-primary">
                        <Download className={`${isRTL ? 'ml-4' : 'mr-4'} h-7 w-7`} />
                        {isHebrew ? 'הורדה עכשיו' : 'DOWNLOAD NOW'}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Secondary Bento Items */}
          <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">

            <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group rounded-[2.5rem] shadow-xl hover:shadow-primary/20 transition-all duration-500 min-h-[300px] flex flex-col justify-center p-8">
              <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe className="w-full h-full text-white" />
              </div>
              <div className="relative z-10 text-center md:text-right">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:ml-0 md:mr-0">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">
                  {isHebrew ? 'גלישה חכמה' : 'SMART BROWSING'}
                </h3>
                <p className="text-muted-foreground font-medium italic leading-relaxed">
                  {isHebrew
                    ? 'החלפת מילים אוטומטית בכל אתר שאתה מבקר בו כדי להקיף את עצמך באנגלית.'
                    : 'Automatic word replacement on every site you visit to surround yourself with English.'}
                </p>
              </div>
            </Card>

            <Card className="glass-card border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group rounded-[2.5rem] shadow-xl hover:shadow-accent/20 transition-all duration-500 min-h-[300px] flex flex-col justify-center p-8">
              <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-full h-full text-white" />
              </div>
              <div className="relative z-10 text-center md:text-right">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 mx-auto md:ml-0 md:mr-0">
                  <Zap className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">
                  {isHebrew ? 'כתוביות AI' : 'AI SUBTITLES'}
                </h3>
                <p className="text-muted-foreground font-medium italic leading-relaxed">
                  {isHebrew
                    ? 'תרגום והצגת המילים שלמדת בתוך סרטוני יוטיוב ונטפליקס בזמן אמת.'
                    : 'Translating and highlighting learned words within YouTube and Netflix videos in real-time.'}
                </p>
              </div>
            </Card>

            <Card className="glass-card border-white/5 bg-white/5 relative overflow-hidden group rounded-[2.5rem] md:col-span-2 shadow-xl hover:shadow-white/10 transition-all duration-500 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Shield className="h-10 w-10 text-white/70" />
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
                  {isHebrew ? 'בטוח, פרטי ומהיר' : 'SECURE, PRIVATE & FAST'}
                </h3>
                <p className="text-muted-foreground font-medium italic text-lg leading-relaxed">
                  {isHebrew
                    ? 'אנחנו ב-TalkFix מחויבים לפרטיות שלכם. התוסף שלנו קל משקל, אינו אוסף מידע אישי ופועל במהירות שיא.'
                    : 'We at TalkFix are committed to your privacy. Our extension is lightweight, doesn\'t collect personal data, and runs at top speed.'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Coming Soon Section with Premium Bento Cards */}
        <div className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter text-center mb-12">
            {isHebrew ? 'בקרוב בפלטפורמות נוספות' : 'COMING SOON ON MORE PLATFORMS'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/10 group">
              <Card className="glass-card border-0 bg-card/40 p-10 flex flex-col items-center text-center group hover:bg-card/60 transition-colors">
                <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight mb-4">{isHebrew ? 'אנדרואיד' : 'ANDROID'}</h3>
                <p className="text-muted-foreground font-medium italic mb-8 max-w-xs">{isHebrew ? 'חוויית למידה מלאה בכף היד שלך, כולל מצב אופליין.' : 'Full learning experience in the palm of your hand, including offline mode.'}</p>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <div className="flex items-center gap-3 text-sm font-bold text-white/50 italic px-4 py-2 bg-white/5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {isHebrew ? 'למידה פסיבית' : 'Passive Learning'}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-white/50 italic px-4 py-2 bg-white/5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {isHebrew ? 'התראות חכמות' : 'Smart Alerts'}
                  </div>
                </div>
              </Card>
            </div>

            <div className="relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/10 group">
              <Card className="glass-card border-0 bg-card/40 p-10 flex flex-col items-center text-center group hover:bg-card/60 transition-colors">
                <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Monitor className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight mb-4">{isHebrew ? 'ווינדוס' : 'WINDOWS'}</h3>
                <p className="text-muted-foreground font-medium italic mb-8 max-w-xs">{isHebrew ? 'אפליקציה שולחנית עוצמתית למינוף אוצר המילים שלך.' : 'Powerful desktop app to leverage your vocabulary performance.'}</p>
                <div className="flex flex-col gap-3 w-full max-w-[200px]">
                  <div className="flex items-center gap-3 text-sm font-bold text-white/50 italic px-4 py-2 bg-white/5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {isHebrew ? 'ממשק מתקדם' : 'Advanced Pro UI'}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-white/50 italic px-4 py-2 bg-white/5 rounded-xl">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {isHebrew ? 'ביצועי שיא' : 'Peak Performance'}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Expanding Vocabulary Section */}
        <div className="text-center">
          <div className="glass-card border-white/5 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 p-12 max-w-3xl mx-auto rounded-[3rem] shadow-2xl">
            <div className="flex justify-center gap-4 mb-10 flex-wrap">
              <Badge className="bg-primary/20 text-primary border-primary/20 px-6 py-2 rounded-xl italic font-black text-xs tracking-widest">{isHebrew ? '📚 אוצר מילים' : '📚 VOCABULARY'}</Badge>
              <Badge className="bg-accent/20 text-accent border-accent/20 px-6 py-2 rounded-xl italic font-black text-xs tracking-widest">{isHebrew ? '🎯 קטגוריות' : '🎯 CATEGORIES'}</Badge>
            </div>
            <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tight mb-6">
              {isHebrew ? 'עולם שלם של ידע מחכה' : 'A WORLD OF KNOWLEDGE AWAITS'}
            </h3>
            <p className="text-muted-foreground text-xl leading-relaxed italic font-medium">
              {isHebrew
                ? 'אנחנו מוסיפים כל הזמן קטגוריות מילים חדשות בכל התחומים - מעולם העסקים והטכנולוגיה ועד לסלנג יומיומי ושפה רפואית.'
                : 'We are constantly adding new word categories across all fields - from business and technology to daily slang and medical language.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;