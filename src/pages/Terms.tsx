import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

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
                <h2 className="text-xl font-semibold mt-6 mb-3">1. מבוא לשירותים</h2>
                <p>
                  תנאים והגבלות אלה יוצרים חוזה ("הסכם") בינך ("הקונה") לבין TalkFix ו-Paddle (כמוגדר להלן) 
                  ומסדירים את השימוש שלך בשירותים.
                </p>
                <p className="mt-2">
                  <strong>Paddle הוא הסוחר הרשום (Merchant of Record)</strong> ומשווק מורשה של המוצר עבור TalkFix, 
                  מה שאומר שאתה רוכש את המוצר מ-Paddle באמצעות השירותים, אך המוצר מורשה לך על ידי TalkFix.
                </p>
                <p className="mt-2">
                  אנא קרא את ההסכם בעיון. על ידי ביצוע הזמנה עם Paddle, הנך מסכים לתנאים ולהגבלות המפורטים 
                  הן בהסכם זה והן בתנאי Paddle הזמינים ב-
                  <a href="https://www.paddle.com/legal/invoiced-consumer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paddle.com/legal/invoiced-consumer-terms
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. הגדרות</h2>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>"Paddle"</strong> - עבור רכישות מארה"ב: Paddle.com Inc; עבור שאר העולם: Paddle.com Market Limited</li>
                  <li><strong>"מוצר"</strong> - אפליקציית TalkFix והשירותים הדיגיטליים הנלווים</li>
                  <li><strong>"שירותים"</strong> - שירותי Paddle שבאמצעותם ניתן לרכוש או להירשם למוצר</li>
                  <li><strong>"עסקה"</strong> - רכישת המוצר באמצעות השירותים שלנו</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. תיאור השירות</h2>
                <p>TalkFix היא אפליקציה ללימוד שפות המספקת:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>כרטיסיות לימוד אוצר מילים</li>
                  <li>חידונים ותרגולים</li>
                  <li>מעקב התקדמות</li>
                  <li>כתוביות AI לסרטונים</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. חשבונות משתמש</h2>
                <p>
                  אתה אחראי לשמירה על סודיות פרטי החשבון שלך ולכל הפעילויות תחת חשבונך. 
                  יש להודיע לנו מיד על כל שימוש לא מורשה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. מנויים ותשלומים</h2>
                <p>
                  התשלומים מעובדים על ידי Paddle.com, שהוא הסוחר הרשום עבור עסקאות אלה. 
                  על ידי רכישת מנוי, אתה מסכים לתנאי התשלום של Paddle.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>המנויים מתחדשים אוטומטית אלא אם בוטלו</li>
                  <li>ניתן לבטל בכל עת מדף הפרופיל</li>
                  <li>תחויב בין השעות 00:00 ל-01:00 (UTC) ביום בו תקופת המנוי מתחדשת</li>
                  <li>יש לבטל לפחות 48 שעות לפני תום תקופת החיוב הנוכחית</li>
                </ul>
                <p className="mt-2">
                  Paddle תחייב את אמצעי התשלום שבחרת עבור כל עסקה בתשלום, כולל כל מיסים רלוונטיים 
                  בהתאם לתחום המס בו מתבצעת העסקה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. זכות הצרכן לביטול</h2>
                <p>
                  אם הנך צרכן, יש לך את הזכות לבטל הסכם זה ולקבל החזר תוך 14 יום מבלי לתת כל סיבה, 
                  אלא אם כבר התחלת להשתמש בתוכן הדיגיטלי.
                </p>
                <p className="mt-2">
                  לביטול, אנא צור קשר דרך support@talkfix.app או דרך מרכז התמיכה של Paddle.
                </p>
                <p className="mt-2">
                  למידע מלא על מדיניות ההחזרים, ראה את <Link to="/refund" className="text-primary hover:underline">מדיניות ההחזרים</Link> שלנו.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. שימוש מקובל</h2>
                <p>אתה מסכים לא:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>להפר חוקים או תקנות כלשהם</li>
                  <li>לשתף את חשבונך עם אחרים</li>
                  <li>לנסות לגשת לחשבונות או נתונים של משתמשים אחרים</li>
                  <li>להפריע או לשבש את השירות</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. קניין רוחני</h2>
                <p>
                  כל התוכן, הפיצ'רים והפונקציונליות הם רכוש בלעדי של TalkFix ומוגנים על ידי 
                  חוקי זכויות יוצרים, סימנים מסחריים וחוקי קניין רוחני אחרים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. הגבלת אחריות</h2>
                <p>
                  TalkFix ו-Paddle לא יהיו אחראים לנזקים עקיפים, מקריים, מיוחדים, תוצאתיים או עונשיים 
                  הנובעים משימוש או חוסר יכולת להשתמש בשירות.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. סיום שירותים</h2>
                <p>
                  אם לא תעמוד בתנאי הסכם זה, Paddle רשאית, ללא הודעה מוקדמת: לסיים הסכם זה, 
                  לסיים את הרישיון שלך למוצר, או למנוע את גישתך לשירותים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. החוק החל</h2>
                <p>
                  לצרכנים בארה"ב: הסכם זה יהיה כפוף לחוקי מדינת ניו יורק.
                  לכל שאר הצרכנים: הסכם זה יהיה כפוף לחוקי אנגליה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. שינויים בתנאים</h2>
                <p>
                  אנו שומרים לעצמנו את הזכות לשנות תנאים אלה בכל עת. 
                  שימוש מתמשך בשירות לאחר שינויים מהווה הסכמה לתנאים החדשים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">13. יצירת קשר</h2>
                <p>לשאלות לגבי תנאים אלה:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: support@talkfix.app</li>
                  <li>Paddle (לעניינים הקשורים לתשלום): <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  ראה גם: <Link to="/privacy" className="text-primary hover:underline">מדיניות פרטיות</Link> | <Link to="/refund" className="text-primary hover:underline">מדיניות החזרים</Link>
                </p>
              </section>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">Last updated: December 2024</p>
              
              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction to Services</h2>
                <p>
                  These terms and conditions create a contract ("Agreement") between you ("Buyer") and TalkFix and Paddle (as defined below) 
                  and govern your use of the Services.
                </p>
                <p className="mt-2">
                  <strong>Paddle is the Merchant of Record</strong> and authorized reseller of the Product for TalkFix, 
                  meaning you are purchasing the Product from Paddle through the Services, but the Product is licensed to you by TalkFix.
                </p>
                <p className="mt-2">
                  Please read this Agreement carefully. By placing an order with Paddle, you agree to the terms and conditions set out 
                  both in this Agreement and in Paddle's terms available at{" "}
                  <a href="https://www.paddle.com/legal/invoiced-consumer-terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paddle.com/legal/invoiced-consumer-terms
                  </a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">2. Definitions</h2>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li><strong>"Paddle"</strong> - For US purchases: Paddle.com Inc; For rest of world: Paddle.com Market Limited</li>
                  <li><strong>"Product"</strong> - The TalkFix application and associated digital services</li>
                  <li><strong>"Services"</strong> - Paddle's services through which the Product can be purchased or subscribed to</li>
                  <li><strong>"Transaction"</strong> - Purchase of the Product through our Services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">3. Description of Service</h2>
                <p>TalkFix is a language learning application that provides:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Vocabulary flashcards</li>
                  <li>Quizzes and practice exercises</li>
                  <li>Progress tracking</li>
                  <li>AI subtitles for videos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">4. User Accounts</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities under your account. Please notify us immediately of any unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Subscriptions and Payments</h2>
                <p>
                  Payments are processed by Paddle.com, which is the Merchant of Record for these transactions. 
                  By purchasing a subscription, you agree to Paddle's payment terms.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Subscriptions auto-renew unless cancelled</li>
                  <li>You can cancel anytime from your profile page</li>
                  <li>You will be charged between 00:00 and 01:00 (UTC) on the day your subscription period renews</li>
                  <li>Cancel at least 48 hours before the end of the current billing period</li>
                </ul>
                <p className="mt-2">
                  Paddle will charge your chosen payment method for any paid transaction, including any applicable taxes 
                  according to the tax jurisdiction in which the transaction takes place.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. Consumer Right to Cancel</h2>
                <p>
                  If you are a consumer, you have the right to cancel this Agreement and receive a refund within 14 days 
                  without giving any reason, unless you have already started using the digital content.
                </p>
                <p className="mt-2">
                  To cancel, please contact us at support@talkfix.app or through Paddle's help center.
                </p>
                <p className="mt-2">
                  For full details on our refund policy, see our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">7. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Violate any laws or regulations</li>
                  <li>Share your account with others</li>
                  <li>Attempt to access other users' accounts or data</li>
                  <li>Interfere with or disrupt the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Intellectual Property</h2>
                <p>
                  All content, features, and functionality are the exclusive property of TalkFix 
                  and are protected by copyright, trademark, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Limitation of Liability</h2>
                <p>
                  TalkFix and Paddle shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages arising from your use or inability to use the service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. Termination of Services</h2>
                <p>
                  If you fail to comply with the terms of this Agreement, Paddle may, without prior notice: 
                  terminate this Agreement, terminate your license to the Product, or prevent your access to the Services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. Governing Law</h2>
                <p>
                  For US consumers: This Agreement shall be governed by the laws of the State of New York.
                  For all other consumers: This Agreement shall be governed by the laws of England.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. 
                  Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">13. Contact Us</h2>
                <p>For questions about these terms:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: support@talkfix.app</li>
                  <li>Paddle (for payment-related matters): <a href="https://www.paddle.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.com/help</a></li>
                </ul>
              </section>

              <section className="border-t pt-6 mt-6">
                <p className="text-sm text-muted-foreground">
                  See also: <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> | <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link>
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