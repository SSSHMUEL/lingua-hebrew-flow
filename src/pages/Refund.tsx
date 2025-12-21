import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Refund = () => {
  const { language } = useLanguage();
  const isHebrew = language === "he";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isHebrew ? "מדיניות החזרים" : "Refund Policy"}
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none space-y-6">
          {isHebrew ? (
            <>
              <p className="text-muted-foreground">עודכן לאחרונה: דצמבר 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. תקופת ניסיון</h2>
                <p>
                  אנו מציעים תקופת ניסיון חינמית של 30 יום לכל המשתמשים החדשים. 
                  במהלך תקופה זו, תוכל לגשת לכל התכונות ללא חיוב.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. מדיניות החזרים למנויים</h2>
                <p>
                  אנו מציעים החזר כספי מלא תוך 7 ימים מהרכישה הראשונה אם אינך מרוצה מהשירות.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>בקשות החזר חייבות להיעשות תוך 7 ימים מהתשלום הראשון</li>
                  <li>החזרים יעובדו תוך 5-10 ימי עסקים</li>
                  <li>ההחזר יופיע באמצעי התשלום המקורי</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. חידושים</h2>
                <p>
                  עבור חידושי מנוי (לאחר התקופה הראשונה), אנו לא מציעים החזרים עבור תקופות חלקיות. 
                  עם זאת, תוכל לבטל בכל עת כדי למנוע חיובים עתידיים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. כיצד לבקש החזר</h2>
                <p>לבקשת החזר:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>שלח דוא"ל ל-support@talkfix.app</li>
                  <li>כלול את כתובת הדוא"ל של החשבון שלך</li>
                  <li>ציין את סיבת בקשת ההחזר</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. ביטול מנוי</h2>
                <p>
                  תוכל לבטל את המנוי שלך בכל עת מדף הפרופיל שלך. לאחר הביטול:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>תוכל להמשיך להשתמש בשירות עד סוף תקופת החיוב הנוכחית</li>
                  <li>לא תחויב בתקופות עתידיות</li>
                  <li>תוכל להירשם מחדש בכל עת</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. חריגים</h2>
                <p>לא יינתנו החזרים במקרים הבאים:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>השהיית חשבון בגלל הפרת תנאי השימוש</li>
                  <li>בקשות לאחר חלון ה-7 ימים</li>
                  <li>חיובי חידוש (אלא אם מופעלים בטעות)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. יצירת קשר</h2>
                <p>
                  לשאלות לגבי מדיניות ההחזרים שלנו, אנא צור קשר: support@talkfix.app
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Last updated: December 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. Free Trial</h2>
                <p>
                  We offer a 30-day free trial for all new users. 
                  During this period, you can access all features without charge.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Subscription Refund Policy</h2>
                <p>
                  We offer a full refund within 7 days of your first purchase if you're not satisfied with the service.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refund requests must be made within 7 days of the first payment</li>
                  <li>Refunds will be processed within 5-10 business days</li>
                  <li>The refund will appear on your original payment method</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. Renewals</h2>
                <p>
                  For subscription renewals (after the first period), we do not offer refunds for partial periods. 
                  However, you can cancel at any time to prevent future charges.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. How to Request a Refund</h2>
                <p>To request a refund:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Email us at support@talkfix.app</li>
                  <li>Include your account email address</li>
                  <li>State the reason for your refund request</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Cancelling Your Subscription</h2>
                <p>
                  You can cancel your subscription at any time from your profile page. After cancellation:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You can continue using the service until the end of the current billing period</li>
                  <li>You will not be charged for future periods</li>
                  <li>You can resubscribe at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. Exceptions</h2>
                <p>Refunds will not be granted for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Account suspension due to terms of service violations</li>
                  <li>Requests after the 7-day window</li>
                  <li>Renewal charges (unless accidentally triggered)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Contact Us</h2>
                <p>
                  For questions about our refund policy, please contact: support@talkfix.app
                </p>
              </section>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Refund;
