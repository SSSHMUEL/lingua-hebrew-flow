import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Privacy = () => {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isHebrew ? "מדיניות פרטיות" : "Privacy Policy"}
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          {isHebrew ? (
            <>
              <p className="text-muted-foreground">עודכן לאחרונה: דצמבר 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. מבוא</h2>
                <p>
                  ב-TalkFix אנו מכבדים את הפרטיות שלך ומחויבים להגן על הנתונים האישיים שלך. 
                  מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע שלך.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. מידע שאנו אוספים</h2>
                <p>אנו אוספים את סוגי המידע הבאים:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>פרטי חשבון:</strong> כתובת דוא"ל, שם תצוגה, העדפות שפה</li>
                  <li><strong>נתוני למידה:</strong> התקדמות, מילים שנלמדו, תוצאות חידונים</li>
                  <li><strong>נתוני שימוש:</strong> אופן האינטראקציה שלך עם האפליקציה</li>
                  <li><strong>מידע תשלום:</strong> מעובד באופן מאובטח על ידי Paddle</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. כיצד אנו משתמשים במידע שלך</h2>
                <p>אנו משתמשים במידע שלך כדי:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>לספק ולשפר את שירותינו</li>
                  <li>להתאים אישית את חוויית הלמידה שלך</li>
                  <li>לעבד תשלומים ולנהל מנויים</li>
                  <li>לשלוח עדכונים חשובים על חשבונך</li>
                  <li>לנתח דפוסי שימוש לשיפור האפליקציה</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. אחסון ואבטחת נתונים</h2>
                <p>
                  הנתונים שלך מאוחסנים באופן מאובטח באמצעות Supabase, עם הצפנה במנוחה ובמעבר. 
                  אנו מיישמים אמצעי אבטחה סטנדרטיים בתעשייה להגנה על המידע שלך.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. שיתוף נתונים</h2>
                <p>אנו לא מוכרים את הנתונים האישיים שלך. אנו עשויים לשתף נתונים עם:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Paddle:</strong> לעיבוד תשלומים</li>
                  <li><strong>Supabase:</strong> לאחסון וניהול נתונים</li>
                  <li><strong>ספקי ניתוח:</strong> לשיפור השירות (נתונים אנונימיים)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. הזכויות שלך</h2>
                <p>יש לך את הזכות:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>לגשת לנתונים האישיים שלך</li>
                  <li>לתקן נתונים לא מדויקים</li>
                  <li>למחוק את חשבונך ונתוניך</li>
                  <li>לייצא את נתוני הלמידה שלך</li>
                  <li>לבטל הסכמה לתקשורת שיווקית</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. קובצי עוגיות</h2>
                <p>
                  אנו משתמשים בקובצי עוגיות חיוניים לפונקציונליות האפליקציה, כגון שמירה על 
                  סשן ההתחברות שלך. אנו לא משתמשים בקובצי עוגיות מעקב של צד שלישי.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. פרטיות ילדים</h2>
                <p>
                  השירות שלנו אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין 
                  מידע מילדים מתחת לגיל זה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. שינויים במדיניות זו</h2>
                <p>
                  אנו עשויים לעדכן מדיניות זו מעת לעת. נודיע לך על שינויים משמעותיים 
                  באמצעות דוא"ל או הודעה באפליקציה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. יצירת קשר</h2>
                <p>
                  לשאלות לגבי מדיניות פרטיות זו, אנא צור קשר: privacy@talkfix.app
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Last updated: December 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
                <p>
                  At TalkFix, we respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Account details:</strong> Email address, display name, language preferences</li>
                  <li><strong>Learning data:</strong> Progress, learned words, quiz results</li>
                  <li><strong>Usage data:</strong> How you interact with the app</li>
                  <li><strong>Payment information:</strong> Processed securely by Paddle</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Personalize your learning experience</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important updates about your account</li>
                  <li>Analyze usage patterns to improve the app</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Storage and Security</h2>
                <p>
                  Your data is stored securely using Supabase, with encryption at rest and in transit. 
                  We implement industry-standard security measures to protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Sharing</h2>
                <p>We do not sell your personal data. We may share data with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Paddle:</strong> For payment processing</li>
                  <li><strong>Supabase:</strong> For data storage and management</li>
                  <li><strong>Analytics providers:</strong> For service improvement (anonymized data)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Export your learning data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Cookies</h2>
                <p>
                  We use essential cookies for app functionality, such as maintaining your login session. 
                  We do not use third-party tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect 
                  information from children under this age.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. We will notify you of significant changes 
                  via email or in-app notification.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
                <p>
                  For questions about this privacy policy, please contact: privacy@talkfix.app
                </p>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;
