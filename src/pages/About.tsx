import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Monitor, Smartphone, BookOpen, Target, Zap, Brain, Sparkles, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { WordSwapDemo } from '@/components/WordSwapDemo';

const About = () => {
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  useEffect(() => {
    document.title = isHebrew ? 'אודות השיטה | TALK FIX' : 'Our Methodology | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        isHebrew
          ? 'למד על השיטה החדשנית של TALK FIX ללמידת אנגלית דרך תרגול אקטיבי באתרי אינטרנט וכתוביות'
          : 'Learn about TALK FIX\'s innovative method for learning English through active practice on websites and subtitles'
      );
    }
  }, [isHebrew]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Gradients - Unified with Landing Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Top Right - Blue/Primary */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]" />

        {/* Center/Left - Maximum Intensity Orange */}
        <div className="absolute top-[5%] -left-[5%] w-[1200px] h-[1200px] rounded-full bg-orange-600/25 blur-[150px]" />

        {/* Bottom - Subtle Blue */}
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 relative z-20">
          <Badge className="mb-6 bg-primary/15 text-primary border-primary/20 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(255,165,0,0.3)]">
            <Sparkles className="h-4 w-4 mr-2" />
            {isHebrew ? 'המהפכה בלמידת שפות' : 'THE LANGUAGE REVOLUTION'}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-tight drop-shadow-2xl">
            {isHebrew ? (
              <>
                הפוך את הגלישה שלך <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-extrabold italic p-2 inline-block">לשיעור אנגלית</span>
              </>
            ) : (
              <>
                Turn Your Browsing <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 font-extrabold italic">Into an English Lesson</span>
              </>
            )}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            {isHebrew
              ? 'למה להקדיש זמן מיוחד ללימודים כשאפשר ללמוד תוך כדי החיים? TalkFix משלבת מילים באנגלית בתוכן שאתה כבר צורך - חדשות, רשתות חברתיות וסרטים.'
              : 'Why set aside study time when you can learn while you live? TalkFix integrates English words into the content you already consume - news, social media, and movies.'}
          </p>
        </div>

        {/* Visual Demo Section */}
        <div className="max-w-6xl mx-auto mb-24 relative z-20">
          <div className="glass-card p-4 md:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <Badge className="mb-4 bg-accent/20 text-accent border-accent/30 text-xs py-1 px-3">
                  {isHebrew ? 'המחשה חיה' : 'LIVE DEMO'}
                </Badge>
                <h3 className="text-3xl font-black mb-6 text-white">
                  {isHebrew ? 'איך זה נראה בפועל?' : 'How Does It Look?'}
                </h3>
                <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                  {isHebrew
                    ? 'דמיין שאתה קורא כתבה ב-Ynet או פוסט בפייסבוק. פתאום, מילים מסוימות - אלו שלמדת - מופיעות באנגלית. הן מודגשות, ואם תרחף עליהן, תשמע את ההגייה ותראה את התרגום. זהו לימוד ללא מאמץ, בהקשר האמיתי ביותר.'
                    : 'Imagine reading an article or a Facebook post. Suddenly, words you\'ve learned appear in English. They glow, and hovering reveals pronunciation and translation. It\'s effortless learning in the most real context.'}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{isHebrew ? 'הטמעה טבעית בדפדפן' : 'Natural Browser Integration'}</h4>
                      <p className="text-sm text-gray-400">{isHebrew ? 'התוסף מחליף מילים באופן חכם מבלי לשבור את רצף הקריאה.' : 'Changes words smartly without breaking your reading flow.'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg mb-1">{isHebrew ? 'עובד גם בכתוביות וידאו' : 'Works on Video Subtitles'}</h4>
                      <p className="text-sm text-gray-400">{isHebrew ? 'צופה בנטפליקס או יוטיוב? המילים יוחלפו גם שם בזמן אמת.' : 'Watching Netflix? Words flip in real-time within subtitles.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2 relative flex justify-center items-center">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-30 blur-2xl rounded-[2rem] animate-pulse"></div>
                <div className="relative w-full transform transition-all duration-500 hover:scale-[1.02]">
                  <WordSwapDemo isRTL={isRTL} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {isHebrew ? 'מה עושה את השיטה כל כך יעילה?' : 'What Makes the Method So Effective?'}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">
                  {isHebrew ? 'תרגול בהקשר אמיתי' : 'Real-context Practice'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isHebrew
                    ? 'במקום לתרגל במבחנים מלאכותיים, אתה רואה את המילים בהקשרים אמיתיים בכל אתר שאתה מבקר - חדשות, בלוגים, רשתות חברתיות ועוד.'
                    : 'Instead of practicing with artificial tests, you see the words in real contexts on every site you visit - news, blogs, social networks, and more.'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">
                  {isHebrew ? 'למידה פסיבית' : 'Passive Learning'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isHebrew
                    ? 'אתה לא צריך להקדיש זמן נוסף ללמידה. כל גלישה ברשת הופכת להזדמנות תרגול טבעית, מה שמחזק את הזיכרון ללא מאמץ נוסף.'
                    : 'You don\'t need to dedicate extra time to learning. Every web browse becomes a natural practice opportunity, strengthening memory without extra effort.'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">
                  {isHebrew ? 'תוצאות מהירות' : 'Fast Results'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {isHebrew
                    ? 'החשיפה הקבועה למילים החדשות מאפשרת זכירה מהירה יותר ומעבר טבעי מאוצר המילים הפסיבי לאקטיבי.'
                    : 'Constant exposure to new words allows for faster recall and a natural transition from passive to active vocabulary.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Where it works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {isHebrew ? 'איפה זה עובד?' : 'Where It Works?'}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className={`h-8 w-8 text-primary ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  <h3 className="text-xl font-semibold">
                    {isHebrew ? 'בכל אתרי האינטרנט' : 'On All Websites'}
                  </h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'אתרי חדשות וכתבות' : 'News sites and articles'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'רשתות חברתיות' : 'Social networks'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'בלוגים ומאמרים' : 'Blogs and articles'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'אתרי קניות ושירותים' : 'Shopping and service sites'}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Monitor className={`h-8 w-8 text-accent ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  <h3 className="text-xl font-semibold">
                    {isHebrew ? 'בכתוביות וידאו' : 'In Video Subtitles'}
                  </h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-accent rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'יוטיוב ופלטפורמות וידאו' : 'YouTube and video platforms'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-accent rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'נטפליקס ושירותי סטרימינג' : 'Netflix and streaming services'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-accent rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'סרטונים חינוכיים' : 'Educational videos'}
                  </li>
                  <li className="flex items-center">
                    <div className={`w-2 h-2 bg-accent rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                    {isHebrew ? 'תוכניות טלוויזיה' : 'TV shows'}
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming soon */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {isHebrew ? 'בקרוב...' : 'Coming Soon...'}
          </h2>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <Smartphone className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isHebrew ? 'אפליקציית מובייל' : 'Mobile App'}
            </Badge>
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <Monitor className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isHebrew ? 'תוכנת דסקטופ' : 'Desktop Software'}
            </Badge>
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <BookOpen className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isHebrew ? 'עוד קטגוריות מילים' : 'More Word Categories'}
            </Badge>
          </div>

          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {isHebrew ? 'התחל היום' : 'Start Today'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isHebrew
                  ? 'הצטרף לאלפי הלומדים שכבר משפרים את האנגלית שלהם באמצעות השיטה החדשנית שלנו'
                  : 'Join thousands of learners who are already improving their English with our innovative method'}
              </p>
              <div className="flex justify-center gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-lg py-2 px-6">
                  {isHebrew ? 'למידה יעילה ומהנה' : 'Effective & Fun Learning'}
                </Badge>
                <Badge className="bg-accent/20 text-accent border-accent/30 text-lg py-2 px-6">
                  {isHebrew ? 'ללא מאמץ יומי נוסף' : 'No Extra Daily Effort'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mb-16 mt-24 text-center">
          <Card className="glass-card border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
            <CardContent className="p-8 relative z-10">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                {isHebrew ? 'יש לכם שאלה או הצעה?' : 'Have a Question or Suggestion?'}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                {isHebrew
                  ? 'אנחנו תמיד שמחים לשמוע מהמשתמשים שלנו. אם נתקלתם בבעיה או שיש לכם רעיון לשיפור, אל תהססו לפנות אלינו.'
                  : 'We are always happy to hear from our users. If you encountered an issue or have an improvement idea, don\'t hesitate to reach out.'}
              </p>
              <div className="flex flex-col items-center gap-4">
                <a
                  href="mailto:talkfix.app@gmail.com"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg font-bold transition-all hover:scale-105 shadow-lg shadow-primary/25"
                >
                  <Mail className="h-5 w-5" />
                  {isHebrew ? 'שלחו לנו למייל' : 'Email Us'}
                </a>
                <p className="text-muted-foreground font-mono bg-white/5 px-4 py-2 rounded-lg select-all border border-white/10 text-sm hover:bg-white/10 transition-colors cursor-text">
                  talkfix.app@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer - Consistent with Landing Page */}
      <footer className="border-t border-white/10 mt-16 sm:mt-20 md:mt-24 pt-6 sm:pt-8 bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/20 text-primary border-primary/30 h-8 px-3">TF</Badge>
            <span className="font-semibold text-foreground">TalkFix</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              {isHebrew ? 'תנאי שימוש' : 'Terms of Use'}
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              {isHebrew ? 'מדיניות פרטיות' : 'Privacy Policy'}
            </a>
            <a href="/refund" className="text-muted-foreground hover:text-primary transition-colors">
              {isHebrew ? 'מדיניות החזרים' : 'Refund Policy'}
            </a>
            <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">
              {isHebrew ? 'אודות' : 'About'}
            </a>
            <a href="mailto:talkfix.app@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
              {isHebrew ? 'צור קשר' : 'Contact'}
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TalkFix. {isHebrew ? 'כל הזכויות שמורות.' : 'All rights reserved.'}
          </div>
        </div>
      </footer>
    </div >
  );
};

export default About;
