import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Refund = () => {
  const { language } = useLanguage();
  const isHebrew = language === "he";

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
      
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
      <Card className="glass-card border-white/10">
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
                <h2 className="text-xl font-semibold mt-6 mb-3">1. סוחר רשום</h2>
                <p>
                  <strong>Paddle.com</strong> משמש כסוחר הרשום (Merchant of Record) עבור כל עסקאות התשלום של TalkFix. 
                  משמעות הדבר היא ש-Paddle מעבד את התשלום שלך ואחראי על טיפול בבקשות החזר.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. תקופת ניסיון</h2>
                <p>
                  אנו מציעים תקופת ניסיון חינמית של 30 יום לכל המשתמשים החדשים. 
                  במהלך תקופה זו, תוכל לגשת לכל התכונות ללא חיוב.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. זכות הצרכן לביטול (14 ימים)</h2>
                <p>
                  בהתאם לתנאי Paddle, אם הנך צרכן, יש לך את הזכות לבטל את הרכישה ולקבל החזר מלא 
                  תוך <strong>14 יום</strong> מבלי לתת כל סיבה.
                </p>
                <p className="mt-2">
                  <strong>חריג:</strong> זכותך לבטל אינה חלה על תוכן דיגיטלי שכבר התחלת להוריד, 
                  להזרים או לרכוש בדרך אחרת.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. מדיניות החזרים למנויים</h2>
                <p>
                  בנוסף לזכות הביטול של 14 יום, אנו מציעים החזר כספי מלא תוך 7 ימים מהרכישה הראשונה 
                  אם אינך מרוצה מהשירות.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>בקשות החזר חייבות להיעשות תוך 7 ימים מהתשלום הראשון</li>
                  <li>החזרים יעובדו תוך 5-10 ימי עסקים</li>
                  <li>ההחזר יבוצע באמצעות אותו אמצעי תשלום בו השתמשת בעסקה הראשונית</li>
                  <li>לא תחויב בעמלות כתוצאה מההחזר</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. מנויים וחידושים</h2>
                <p>
                  המנויים בתשלום מתחדשים אוטומטית עד לביטולם. תחויב בין השעות 00:00 ל-01:00 (UTC) 
                  ביום בו תקופת המנוי מתחדשת.
                </p>
                <p className="mt-2">
                  אם ברצונך לבטל את המנוי שלך, אנא עשה זאת <strong>לפחות 48 שעות</strong> לפני תום תקופת החיוב הנוכחית.
                </p>
                <p className="mt-2">
                  עבור חידושי מנוי (לאחר התקופה הראשונה), אנו לא מציעים החזרים עבור תקופות שלא נוצלו. 
                  עם זאת, תוכל לבטל בכל עת כדי למנוע חיובים עתידיים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. כיצד לבקש החזר</h2>
                <p>לבקשת החזר, ניתן ליצור קשר:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>דרך TalkFix: support@talkfix.app</li>
                  <li>ישירות דרך Paddle: <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ol>
                <p className="mt-2">בבקשתך, אנא כלול:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>כתובת הדוא"ל של החשבון שלך</li>
                  <li>מספר ההזמנה (אם יש)</li>
                  <li>סיבת בקשת ההחזר</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. החזרי מס מכירה</h2>
                <p>
                  אם חויבת במס מכירה (מע"מ) על הרכישה שלך ואתה רשום למס מכירה במדינת הרכישה, 
                  ייתכן שתהיה זכאי להחזר של סכום מס המכירה.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>יש ליצור קשר עם Paddle תוך 60 יום מהשלמת הרכישה</li>
                  <li>נדרש קוד מס מכירה תקף עבור מדינתך</li>
                  <li>בקשות לאחר 60 יום לא יעובדו</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. ביטול מנוי</h2>
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
                <h2 className="text-xl font-semibold mt-6 mb-3">9. חריגים</h2>
                <p>החזרים עשויים להידחות במקרים הבאים:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>ראיות להונאה, ניצול לרעה של החזרים או התנהגות מניפולטיבית</li>
                  <li>השהיית חשבון בגלל הפרת תנאי השימוש</li>
                  <li>בקשות לאחר תום חלונות הביטול (14 יום) או ההחזר (7 ימים)</li>
                  <li>חידושי מנוי לתקופות שלא נוצלו</li>
                </ul>
                <p className="mt-2">
                  <strong>הערה:</strong> אין בכך כדי לפגוע בזכויותיך כצרכן ביחס למוצרים שאינם כמתואר, 
                  פגומים או שאינם מתאימים למטרה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. יצירת קשר</h2>
                <p>לשאלות לגבי מדיניות ההחזרים שלנו:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: support@talkfix.app</li>
                  <li>Paddle: <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  ראה גם: <Link to="/terms" className="text-primary hover:underline">תנאי שימוש</Link> | <Link to="/privacy" className="text-primary hover:underline">מדיניות פרטיות</Link>
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Last updated: December 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. Merchant of Record</h2>
                <p>
                  <strong>Paddle.com</strong> serves as the Merchant of Record for all TalkFix payment transactions. 
                  This means Paddle processes your payment and is responsible for handling refund requests.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Free Trial</h2>
                <p>
                  We offer a 30-day free trial for all new users. 
                  During this period, you can access all features without charge.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. Consumer Right to Cancel (14 Days)</h2>
                <p>
                  In accordance with Paddle's terms, if you are a consumer, you have the right to cancel your purchase 
                  and receive a full refund within <strong>14 days</strong> without giving any reason.
                </p>
                <p className="mt-2">
                  <strong>Exception:</strong> Your right to cancel does not apply to digital content that you have already 
                  started to download, stream, or otherwise purchase.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. Subscription Refund Policy</h2>
                <p>
                  In addition to the 14-day cancellation right, we offer a full refund within 7 days of your first purchase 
                  if you're not satisfied with the service.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refund requests must be made within 7 days of the first payment</li>
                  <li>Refunds will be processed within 5-10 business days</li>
                  <li>The refund will be made using the same payment method used in the original transaction</li>
                  <li>You will not be charged any fees as a result of the refund</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Subscriptions and Renewals</h2>
                <p>
                  Paid subscriptions auto-renew until cancelled. You will be charged between 00:00 and 01:00 (UTC) 
                  on the day your subscription period renews.
                </p>
                <p className="mt-2">
                  If you wish to cancel your subscription, please do so <strong>at least 48 hours</strong> before 
                  the end of the current billing period.
                </p>
                <p className="mt-2">
                  For subscription renewals (after the first period), we do not offer refunds for unused periods. 
                  However, you can cancel at any time to prevent future charges.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. How to Request a Refund</h2>
                <p>To request a refund, you can contact:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>TalkFix: support@talkfix.app</li>
                  <li>Paddle directly: <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ol>
                <p className="mt-2">In your request, please include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Your account email address</li>
                  <li>Order number (if available)</li>
                  <li>Reason for the refund request</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Sales Tax Refunds</h2>
                <p>
                  If you were charged sales tax (VAT) on your purchase and you are registered for sales tax 
                  in the country of purchase, you may be entitled to a refund of the sales tax amount.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>You must contact Paddle within 60 days of completing the purchase</li>
                  <li>A valid sales tax code for your country is required</li>
                  <li>Requests after 60 days will not be processed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Cancelling Your Subscription</h2>
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
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Exceptions</h2>
                <p>Refunds may be declined for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Evidence of fraud, refund abuse, or other manipulative behavior</li>
                  <li>Account suspension due to terms of service violations</li>
                  <li>Requests after the cancellation (14 days) or refund (7 days) windows</li>
                  <li>Subscription renewals for unused periods</li>
                </ul>
                <p className="mt-2">
                  <strong>Note:</strong> This does not affect your rights as a consumer in relation to products 
                  that are not as described, faulty, or not fit for purpose.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. Contact Us</h2>
                <p>For questions about our refund policy:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: support@talkfix.app</li>
                  <li>Paddle: <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  See also: <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> | <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </section>
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Refund;