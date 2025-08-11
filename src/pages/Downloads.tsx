import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Chrome, Download, Star, Zap, Shield } from 'lucide-react';
export const Downloads: React.FC = () => {
  const downloadOptions = [{
    id: 'android',
    title: 'אפליקציית אנדרואיד',
    description: 'למדו בדרכים עם האפליקציה החכמה שלנו לאנדרואיד',
    icon: Smartphone,
    features: ['למידה במצב לא מקוון', 'התראות חכמות', 'סנכרון ענן'],
    color: 'bg-green-500'
  }, {
    id: 'windows',
    title: 'תוכנת ווינדוס',
    description: 'חוויית למידה מלאה במחשב האישי שלכם',
    icon: Monitor,
    features: ['ממשק מתקדם', 'דוחות התקדמות', 'תרגילים אינטראקטיביים'],
    color: 'bg-blue-500'
  }, {
    id: 'chrome',
    title: 'הרחבת כרום',
    description: 'למדו תוך כדי גלישה באינטרנט',
    icon: Chrome,
    features: ['תרגום מיידי', 'למידה בזמן גלישה', 'חסכון זמן'],
    color: 'bg-orange-500'
  }];
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">הורדות</h1>
            <p className="text-xl text-muted-foreground mb-6">
קחו את לימוד האנגלית אתכם לכל מקום!
  התוסף שלנו כבר ממש כאן תישארו מעודכנים
          </p>
            <Badge variant="secondary" className="text-lg px-6 py-2">
              <Star className="h-4 w-4 ml-2" />
              בקרוב
            </Badge>
          </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">למידה מהירה</h3>
              <p className="text-muted-foreground">
                אלגוריתמים חכמים לשיפור מהיר של האנגלית
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">בטוח ומאובטח</h3>
              <p className="text-muted-foreground">
                המידע שלכם מוגן ומסונכרן בצורה בטוחה
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">נגיש בכל מקום</h3>
              <p className="text-muted-foreground">למדו מהבית, מהעבודה או בדרכים בכל גלישה באינטרנט שלגם תיצאו יותר חכמים</p>
            </div>
          </div>

          {/* Download Options */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {downloadOptions.map(option => <Card key={option.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className={`${option.color} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4`}>
                    <option.icon className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{option.title}</CardTitle>
                  <p className="text-muted-foreground">{option.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {option.features.map((feature, index) => <div key={index} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full ml-3 flex-shrink-0"></div>
                        <span>{feature}</span>
                      </div>)}
                  </div>
                  
                  <Button className="w-full" size="lg" disabled>
                    <Download className="h-5 w-5 ml-2" />
                    להורדה בקרוב
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center bg-secondary/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">בקרוב אצלכם</h2>
            <p className="text-lg text-muted-foreground mb-6">
              אנחנו עובדים קשה על יצירת האפליקציות והתוכנות שיאפשרו לכם ללמוד אנגלית בכל מקום ובכל זמן.
              הירשמו לאתר כדי להיות הראשונים לקבל עדכונים!
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                אפליקציית iOS - בפיתוח
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                אפליקציית מק - בתכנון
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                הרחבת פיירפוקס - בבדיקות
              </Badge>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4">רוצים להיות הראשונים לדעת?</h3>
            <p className="text-muted-foreground mb-6">
              הירשמו לאתר ותקבלו הודעה ברגע שהאפליקציות יהיו זמינות להורדה
            </p>
            <Button size="lg" onClick={() => window.location.href = '/auth'}>
              הירשמו עכשיו
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default Downloads;