import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Shield, Zap, Globe, Smartphone, Monitor, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Downloads = () => {
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right, Cyan on left */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.3)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(190 85% 55% / 0.25)' }}
        />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {isHebrew ? 'הורדות' : 'Downloads'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isHebrew
              ? 'בחר את הפלטפורמה המועדפת עליך והתחל ללמוד היום'
              : 'Choose your preferred platform and start learning today'}
          </p>
        </div>

        {/* Chrome Extension - Main Feature */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{ background: 'var(--gradient-card)' }}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">{isHebrew ? 'הרחבת כרום' : 'Chrome Extension'}</CardTitle>
              <CardDescription className="text-base">
                {isHebrew ? 'למד תוך כדי גלישה באינטרנט' : 'Learn while browsing the web'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                  {isHebrew ? 'תרגום מיידי' : 'Instant Translation'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                  {isHebrew ? 'למידה בזמן גלישה' : 'Learning while browsing'}
                </li>
                <li className="flex items-center">
                  <div className={`w-2 h-2 bg-primary rounded-full ${isRTL ? 'ml-3' : 'mr-3'}`}></div>
                  {isHebrew ? 'סנכרון זמין' : 'Available Sync'}
                </li>
              </ul>
              <a href="https://drive.google.com/drive/folders/1KkX9jZlRrbMqRF119UsSYuTAqRbOJZG7?usp=sharing" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Download className={`${isRTL ? 'ml-2' : 'mr-2'} h-4 w-4`} />
                  {isHebrew ? 'הורדה עכשיו' : 'Download Now'}
                  <ExternalLink className={`${isRTL ? 'mr-2' : 'ml-2'} h-4 w-4`} />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* How the Extension Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            {isHebrew ? 'איך התוסף עובד?' : 'How the Extension Works?'}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {isHebrew ? '🌐 באתרי אינטרנט' : '🌐 On Websites'}
                </h3>
                <p className="text-muted-foreground">
                  {isHebrew
                    ? 'התוסף מחליף אוטומטית את המילים שלמדת באתר באנגלית בכל אתר שאתה מבקר. כך אתה מתרגל את המילים החדשות בהקשרים אמיתיים ומגוונים.'
                    : 'The extension automatically replaces the words you\'ve learned on any site you visit with English. This way you practice new words in real and diverse contexts.'}
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">
                  {isHebrew ? '📺 בכתוביות וידאו' : '📺 In Video Subtitles'}
                </h3>
                <p className="text-muted-foreground">
                  {isHebrew
                    ? 'גם בצפייה בסרטונים וסרטים, התוסף יחליף את המילים שלמדת בכתוביות, מה שהופך כל צפייה להזדמנות תרגול נוספת.'
                    : 'Even when watching videos and movies, the extension will replace the words you\'ve learned in the subtitles, making every view an additional practice opportunity.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon Applications */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            {isHebrew ? 'בקרוב...' : 'Coming Soon...'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{isHebrew ? 'אפליקציית אנדרואיד' : 'Android App'}</CardTitle>
                <CardDescription>{isHebrew ? 'למידה נוחה בנייד' : 'Convenient learning on mobile'}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {isHebrew ? 'למידה אופליין' : 'Offline Learning'}</li>
                  <li>• {isHebrew ? 'התראות חכמות' : 'Smart Notifications'}</li>
                  <li>• {isHebrew ? 'סנכרון עם הרשת' : 'Web Syncing'}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{ background: 'var(--gradient-glass)' }}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{isHebrew ? 'תוכנת ווינדוס' : 'Windows Software'}</CardTitle>
                <CardDescription>{isHebrew ? 'חוויית למידה מלאה' : 'Full learning experience'}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {isHebrew ? 'ממשק מתקדם' : 'Advanced Interface'}</li>
                  <li>• {isHebrew ? 'עבודה מהירה' : 'Fast Performance'}</li>
                  <li>• {isHebrew ? 'תכונות מתקדמות' : 'Advanced Features'}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features highlight */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-6">
              <Zap className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{isHebrew ? 'למידה מהירה' : 'Fast Learning'}</h3>
              <p className="text-sm text-muted-foreground">
                {isHebrew ? 'תוצאות מהירות ויעילות מירבית' : 'Fast results and maximum efficiency'}
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{isHebrew ? 'בטוח' : 'Secure'}</h3>
              <p className="text-sm text-muted-foreground">
                {isHebrew ? 'הגנה מלאה על פרטיות המידע שלך' : 'Full protection of your data privacy'}
              </p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">{isHebrew ? 'נגיש בכל מקום' : 'Accessible Everywhere'}</h3>
              <p className="text-sm text-muted-foreground">
                {isHebrew ? 'תרגול מתמיד בכל גלישה באינטרנט' : 'Constant practice with every web browse'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features and Categories */}
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {isHebrew ? '📚 אוצר מילים מתרחב' : '📚 Expanding Vocabulary'}
            </Badge>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              {isHebrew ? '🎯 קטגוריות מתמחות' : '🎯 Specialized Categories'}
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {isHebrew ? '📱 תמיכה בכל הפלטפורמות' : '📱 Support across all platforms'}
            </Badge>
          </div>

          <div className="backdrop-blur-sm border-white/20 rounded-xl p-6" style={{ background: 'var(--gradient-glass)' }}>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              {isHebrew ? 'בקרוב: עוד הרבה קטגוריות מילים' : 'Coming Soon: Many more word categories'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isHebrew
                ? 'אנחנו מוסיפים כל הזמן קטגוריות מילים חדשות - עסקים, טכנולוגיה, רפואה ועוד'
                : 'We are constantly adding new word categories - Business, Technology, Medicine, and more'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;