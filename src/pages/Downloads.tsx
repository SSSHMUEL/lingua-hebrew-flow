import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Shield, Zap, Globe, Smartphone, Monitor, ExternalLink } from 'lucide-react';
const Downloads = () => {
  return <div className="min-h-screen" style={{
    background: 'var(--gradient-hero)'
  }}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            הורדות
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            בחר את הפלטפורמה המועדפת עליך והתחל ללמוד היום
          </p>
        </div>

        {/* Chrome Extension - Main Feature */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="backdrop-blur-sm border-white/20 shadow-2xl" style={{
          background: 'var(--gradient-card)'
        }}>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">הרחבת כרום</CardTitle>
              <CardDescription className="text-base">למד תוך כדי גלישה באינטרנט</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                  תרגום מיידי
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                  למידה בחמן גלישה
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full ml-3"></div>
                  סמכון זמין
                </li>
              </ul>
              <a href="https://drive.google.com/drive/folders/1KkX9jZlRrbMqRF119UsSYuTAqRbOJZG7?usp=sharing" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Download className="ml-2 h-4 w-4" />
                  להורדה בקרוב
                  <ExternalLink className="mr-2 h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* How the Extension Works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">איך התוסף עובד?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">🌐 באתרי אינטרנט</h3>
                <p className="text-muted-foreground">
                  התוסף מחליף אוטומטיות את המילים שלמדת באתר באנגלית בכל אתר שאתה מבקר. 
                  כך אתה מתרגל את המילים החדשות בהקשרים אמיתיים ומגוונים.
                </p>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">📺 בכתוביות וידאו</h3>
                <p className="text-muted-foreground">
                  גם בצפייה בסרטונים וסרטים, התוסף יחליף את המילים שלמדת בכתוביות, 
                  מה שהופך כל צפייה להזדמנות תרגול נוספת.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon Applications */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">בקרוב...</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>אפליקציית אנדרואיד</CardTitle>
                <CardDescription>למידה נוחה בנייד</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• למידה אופליין</li>
                  <li>• התראות חכמות</li>
                  <li>• סנכרון עם הרשת</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm border-white/10" style={{
            background: 'var(--gradient-glass)'
          }}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>תוכנת ווינדוס</CardTitle>
                <CardDescription>חוויית למידה מלאה</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ממשק מתקדם</li>
                  <li>• עבודה מהירה</li>
                  <li>• תכונות מתקדמות</li>
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
              <h3 className="font-semibold text-foreground">למידה מהירה</h3>
              <p className="text-sm text-muted-foreground">תוצאות מהירות ויעילות מירבית</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Shield className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">בטוח</h3>
              <p className="text-sm text-muted-foreground">הגנה מלאה על פרטיות המידע שלך</p>
            </div>
            <div className="flex flex-col items-center p-6">
              <Globe className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground">נגיש בכל מקום</h3>
              <p className="text-sm text-muted-foreground">תרגול מתמיד בכל גלישה באינטרנט</p>
            </div>
          </div>
        </div>

        {/* Additional Features and Categories */}
        <div className="text-center">
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              📚 אוצר מילים מרחיב
            </Badge>
            <Badge className="bg-accent/20 text-accent border-accent/30">
              🎯 קטגוריות מתמחות
            </Badge>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              📱 תמיכה בכל הפלטפורמות
            </Badge>
          </div>
          
          <div className="backdrop-blur-sm border-white/20 rounded-xl p-6" style={{
          background: 'var(--gradient-glass)'
        }}>
            <h3 className="text-lg font-semibold mb-2 text-foreground">בקרוב: עוד הרבה קטגוריות מילים</h3>
            <p className="text-muted-foreground mb-4">
              אנחנו מוסיפים כל הזמן קטגוריות מילים חדשות - עסקים, טכנולוגיה, רפואה ועוד
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Downloads;