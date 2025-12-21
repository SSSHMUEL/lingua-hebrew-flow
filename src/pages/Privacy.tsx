import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

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
                <p className="mt-2">
                  <strong>Paddle משמש כסוחר הרשום (Merchant of Record)</strong> עבור עסקאות התשלום שלנו. 
                  Paddle אוסף ומעבד מידע תשלום בהתאם למדיניות הפרטיות שלו הזמינה ב-
                  <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paddle.com/legal/privacy
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. מידע שאנו אוספים</h2>
                <p>אנו אוספים את סוגי המידע הבאים:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>פרטי חשבון:</strong> כתובת דוא"ל, שם תצוגה, העדפות שפה</li>
                  <li><strong>נתוני למידה:</strong> התקדמות, מילים שנלמדו, תוצאות חידונים</li>
                  <li><strong>נתוני שימוש:</strong> אופן האינטראקציה שלך עם האפליקציה</li>
                  <li><strong>מידע תשלום:</strong> נאסף ומעובד על ידי Paddle (לא נשמר על ידינו)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. מידע שנאסף על ידי Paddle</h2>
                <p>
                  כשאתה מבצע רכישה, Paddle כסוחר הרשום אוסף:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>פרטי תשלום (כרטיס אשראי, PayPal וכו')</li>
                  <li>כתובת חיוב</li>
                  <li>מידע מס (מע"מ אם רלוונטי)</li>
                  <li>כתובת IP ומידע על המכשיר</li>
                </ul>
                <p className="mt-2">
                  Paddle ישמור על אמצעי הגנה אדמיניסטרטיביים, פיזיים וטכניים מתאימים להגנה על האבטחה, 
                  הסודיות והשלמות של נתונים אלה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. כיצד אנו משתמשים במידע שלך</h2>
                <p>אנו משתמשים במידע שלך כדי:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>לספק ולשפר את שירותינו</li>
                  <li>להתאים אישית את חוויית הלמידה שלך</li>
                  <li>לנהל את חשבונך ומנויך</li>
                  <li>לשלוח עדכונים חשובים על חשבונך</li>
                  <li>לנתח דפוסי שימוש לשיפור האפליקציה</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. אחסון ואבטחת נתונים</h2>
                <p>
                  הנתונים שלך מאוחסנים באופן מאובטח באמצעות Supabase, עם הצפנה במנוחה ובמעבר. 
                  אנו מיישמים אמצעי אבטחה סטנדרטיים בתעשייה להגנה על המידע שלך.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. שיתוף נתונים</h2>
                <p>אנו לא מוכרים את הנתונים האישיים שלך. אנו משתפים נתונים עם:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Paddle:</strong> סוחר רשום לעיבוד תשלומים (<a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">מדיניות הפרטיות של Paddle</a>)</li>
                  <li><strong>Supabase:</strong> לאחסון וניהול נתונים</li>
                  <li><strong>ספקי ניתוח:</strong> לשיפור השירות (נתונים אנונימיים)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. הזכויות שלך</h2>
                <p>יש לך את הזכות:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>לגשת לנתונים האישיים שלך</li>
                  <li>לתקן נתונים לא מדויקים</li>
                  <li>למחוק את חשבונך ונתוניך</li>
                  <li>לייצא את נתוני הלמידה שלך</li>
                  <li>לבטל הסכמה לתקשורת שיווקית</li>
                </ul>
                <p className="mt-2">
                  לבקשות הקשורות לנתוני תשלום, אנא צור קשר עם Paddle ישירות דרך{" "}
                  <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. קובצי עוגיות</h2>
                <p>
                  אנו משתמשים בקובצי עוגיות חיוניים לפונקציונליות האפליקציה, כגון שמירה על 
                  סשן ההתחברות שלך. Paddle עשוי להשתמש בקובצי עוגיות נוספים לעיבוד תשלומים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. פרטיות ילדים</h2>
                <p>
                  השירות שלנו אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין 
                  מידע מילדים מתחת לגיל זה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. העברות בינלאומיות</h2>
                <p>
                  הנתונים שלך עשויים להיות מועברים ומעובדים במדינות מחוץ למדינת מגוריך. 
                  Paddle ו-TalkFix מבטיחים שהעברות כאלה נעשות בהתאם לחוקי הגנת המידע החלים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. שינויים במדיניות זו</h2>
                <p>
                  אנו עשויים לעדכן מדיניות זו מעת לעת. נודיע לך על שינויים משמעותיים 
                  באמצעות דוא"ל או הודעה באפליקציה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. יצירת קשר</h2>
                <p>לשאלות לגבי מדיניות פרטיות זו:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: privacy@talkfix.app</li>
                  <li>Paddle (לעניינים הקשורים לתשלום): <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/legal/privacy</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  ראה גם: <Link to="/terms" className="text-primary hover:underline">תנאי שימוש</Link> | <Link to="/refund" className="text-primary hover:underline">מדיניות החזרים</Link>
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
                <p className="mt-2">
                  <strong>Paddle serves as our Merchant of Record</strong> for payment transactions. 
                  Paddle collects and processes payment information in accordance with their privacy policy available at{" "}
                  <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paddle.com/legal/privacy
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Account details:</strong> Email address, display name, language preferences</li>
                  <li><strong>Learning data:</strong> Progress, learned words, quiz results</li>
                  <li><strong>Usage data:</strong> How you interact with the app</li>
                  <li><strong>Payment information:</strong> Collected and processed by Paddle (not stored by us)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. Information Collected by Paddle</h2>
                <p>
                  When you make a purchase, Paddle as the Merchant of Record collects:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Payment details (credit card, PayPal, etc.)</li>
                  <li>Billing address</li>
                  <li>Tax information (VAT if applicable)</li>
                  <li>IP address and device information</li>
                </ul>
                <p className="mt-2">
                  Paddle will maintain appropriate administrative, physical and technical safeguards for protection of the security, 
                  confidentiality and integrity of this data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Personalize your learning experience</li>
                  <li>Manage your account and subscription</li>
                  <li>Send important updates about your account</li>
                  <li>Analyze usage patterns to improve the app</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Data Storage and Security</h2>
                <p>
                  Your data is stored securely using Supabase, with encryption at rest and in transit. 
                  We implement industry-standard security measures to protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Sharing</h2>
                <p>We do not sell your personal data. We share data with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Paddle:</strong> Merchant of Record for payment processing (<a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paddle's Privacy Policy</a>)</li>
                  <li><strong>Supabase:</strong> For data storage and management</li>
                  <li><strong>Analytics providers:</strong> For service improvement (anonymized data)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Export your learning data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                <p className="mt-2">
                  For requests related to payment data, please contact Paddle directly at{" "}
                  <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Cookies</h2>
                <p>
                  We use essential cookies for app functionality, such as maintaining your login session. 
                  Paddle may use additional cookies for payment processing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect 
                  information from children under this age.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. International Transfers</h2>
                <p>
                  Your data may be transferred and processed in countries outside your country of residence. 
                  Paddle and TalkFix ensure such transfers are made in compliance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. We will notify you of significant changes 
                  via email or in-app notification.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Us</h2>
                <p>For questions about this privacy policy:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: privacy@talkfix.app</li>
                  <li>Paddle (for payment-related matters): <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/legal/privacy</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  See also: <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> | <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>
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