import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Monitor, Smartphone, BookOpen, Target, Zap, Brain, Sparkles } from 'lucide-react';

const About = () => {
  useEffect(() => {
    document.title = 'אודות השיטה | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'למד על השיטה החדשנית של TALK FIX ללמידת אנגלית דרך תרגול אקטיבי באתרי אינטרנט וכתוביות');
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right side (weaker than homepage) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.35)' }}
        />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Sparkles className="h-3 w-3 mr-1" />
            OUR METHODOLOGY
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            השיטה שלנו
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            גלה איך TALK FIX משנה את הדרך בה אתה לומד אנגלית - מלמידה פסיבית לתרגול אקטיבי ברשת
          </p>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">איך זה עובד?</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="glass-card border-white/10">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">שלב 1: למד באתר</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  התחל בלמידת מילים חדשות באתר שלנו. כל מילה מלווה בתרגום, הגייה ומשפט לדוגמה.
                  בחר מקטגוריות שונות כמו עסקים, טכנולוגיה, חיי יומיום ועוד.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">שלב 2: תרגל ברשת</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  התוסף שלנו מחליף אוטומטית את המילים שכבר למדת בכל אתר שאתה מבקר.
                  המילים מוצגות באנגלית במקום בעברית, מה שיוצר תרגול טבעי וקבוע.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Key Features */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">מה עושה את השיטה כל כך יעילה?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">תרגול בהקשר אמיתי</h3>
                <p className="text-muted-foreground text-sm">
                  במקום לתרגל במבחנים מלאכותיים, אתה רואה את המילים בהקשרים אמיתיים
                  בכל אתר שאתה מבקר - חדשות, בלוגים, רשתות חברתיות ועוד.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">למידה פסיבית</h3>
                <p className="text-muted-foreground text-sm">
                  אתה לא צריך להקדיש זמן נוסף ללמידה. כל גלישה ברשת הופכת להזדמנות תרגול
                  טבעית, מה שמחזק את הזיכרון ללא מאמץ נוסף.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-3">תוצאות מהירות</h3>
                <p className="text-muted-foreground text-sm">
                  החשיפה הקבועה למילים החדשות מאפשרת זכירה מהירה יותר
                  ומעבר טבעי מאוצר המילים הפסיבי לאקטיבי.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Where it works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">איפה זה עובד?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="h-8 w-8 text-primary ml-3" />
                  <h3 className="text-xl font-semibold">בכל אתרי האינטרנט</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                    אתרי חדשות וכתבות
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                    רשתות חברתיות
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                    בלוגים ומאמרים
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                    אתרי קניות ושירותים
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Monitor className="h-8 w-8 text-accent ml-3" />
                  <h3 className="text-xl font-semibold">בכתוביות וידאו</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full ml-3"></div>
                    יוטיוב ופלטפורמות וידאו
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full ml-3"></div>
                    נטפליקס ושירותי סטרימינג
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full ml-3"></div>
                    סרטונים חינוכיים
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full ml-3"></div>
                    תוכניות טלוויזיה
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming soon */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">בקרוב...</h2>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <Smartphone className="h-4 w-4 ml-2" />
              אפליקציית מובייל
            </Badge>
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <Monitor className="h-4 w-4 ml-2" />
              תוכנת דסקטופ
            </Badge>
            <Badge className="glass-card border-white/20 text-base py-2 px-4">
              <BookOpen className="h-4 w-4 ml-2" />
              עוד קטגוריות מילים
            </Badge>
          </div>
          
          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-4 text-foreground">התחל היום</h3>
              <p className="text-muted-foreground mb-6">
                הצטרף לאלפי הלומדים שכבר משפרים את האנגלית שלהם באמצעות השיטה החדשנית שלנו
              </p>
              <div className="flex justify-center gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-lg py-2 px-6">
                  למידה יעילה ומהנה
                </Badge>
                <Badge className="bg-accent/20 text-accent border-accent/30 text-lg py-2 px-6">
                  ללא מאמץ יומי נוסף
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
