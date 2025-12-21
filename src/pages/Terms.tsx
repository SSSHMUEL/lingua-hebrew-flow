import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Terms = () => {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isHebrew ? "תנאי שימוש" : "Terms of Service"}
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          {isHebrew ? (
            <>
              <p className="text-muted-foreground">עודכן לאחרונה: דצמבר 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. הסכמה לתנאים</h2>
                <p>
                  בכניסתך לאפליקציה TalkFix או בשימוש בה, אתה מסכים להיות מחויב לתנאי שימוש אלה. 
                  אם אינך מסכים לתנאים אלה, אנא אל תשתמש בשירות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. תיאור השירות</h2>
                <p>
                  TalkFix היא אפליקציה ללימוד שפות המספקת:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>כרטיסיות לימוד אוצר מילים</li>
                  <li>חידונים ותרגולים</li>
                  <li>מעקב התקדמות</li>
                  <li>כתוביות AI לסרטונים</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. חשבונות משתמש</h2>
                <p>
                  אתה אחראי לשמירה על סודיות פרטי החשבון שלך ולכל הפעילויות תחת חשבונך. 
                  יש להודיע לנו מיד על כל שימוש לא מורשה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. מנויים ותשלומים</h2>
                <p>
                  חלק מהשירותים שלנו דורשים מנוי בתשלום. התשלומים מעובדים באמצעות Paddle.com. 
                  על ידי רכישת מנוי, אתה מסכים לתנאי התשלום שלהם.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>המנויים מתחדשים אוטומטית אלא אם בוטלו</li>
                  <li>ניתן לבטל בכל עת מדף הפרופיל</li>
                  <li>לא יינתנו החזרים עבור תקופות חלקיות</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. שימוש מקובל</h2>
                <p>אתה מסכים לא:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>להפר חוקים או תקנות כלשהם</li>
                  <li>לשתף את חשבונך עם אחרים</li>
                  <li>לנסות לגשת לחשבונות או נתונים של משתמשים אחרים</li>
                  <li>להפריע או לשבש את השירות</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. קניין רוחני</h2>
                <p>
                  כל התוכן, הפיצ'רים והפונקציונליות הם רכוש בלעדי של TalkFix ומוגנים על ידי 
                  חוקי זכויות יוצרים, סימנים מסחריים וחוקי קניין רוחני אחרים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. הגבלת אחריות</h2>
                <p>
                  TalkFix לא תהיה אחראית לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים 
                  הנובעים משימוש או חוסר יכולת להשתמש בשירות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. שינויים בתנאים</h2>
                <p>
                  אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. 
                  שימוש מתמשך בשירות לאחר שינויים מהווה הסכמה לתנאים החדשים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. יצירת קשר</h2>
                <p>
                  לשאלות לגבי תנאים אלה, אנא צור קשר בכתובת: support@talkfix.app
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Last updated: December 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
                <p>
                  By accessing or using the TalkFix application, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
                <p>
                  TalkFix is a language learning application that provides:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Vocabulary flashcards</li>
                  <li>Quizzes and practice exercises</li>
                  <li>Progress tracking</li>
                  <li>AI subtitles for videos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities under your account. Please notify us immediately of any unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. Subscriptions and Payments</h2>
                <p>
                  Some of our services require a paid subscription. Payments are processed through Paddle.com. 
                  By purchasing a subscription, you agree to their payment terms.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>You can cancel anytime from your profile page</li>
                  <li>No refunds for partial periods</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Share your account with others</li>
                  <li>Attempt to access other users' accounts or data</li>
                  <li>Interfere with or disrupt the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. Intellectual Property</h2>
                <p>
                  All content, features, and functionality are the exclusive property of TalkFix 
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
                <p>
                  TalkFix shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h2>
                <p>
                  For questions about these terms, please contact us at: support@talkfix.app
                </p>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
