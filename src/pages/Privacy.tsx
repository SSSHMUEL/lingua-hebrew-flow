import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Privacy = () => {
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
                  <strong>PayPal משמש לעיבוד התשלומים שלנו.</strong>{" "}
                  PayPal אוסף ומעבד מידע תשלום בהתאם למדיניות הפרטיות שלו הזמינה ב-
                  <a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paypal.com/privacy
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
                  <li><strong>מידע תשלום:</strong> נאסף ומעובד על ידי PayPal (לא נשמר על ידינו)</li>
                </ul>
              </section>

              {/* Google User Data Section - Required for Google OAuth verification */}
              <section className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h2 className="text-xl font-semibold mt-2 mb-3">3. נתוני משתמש Google (Google User Data)</h2>
                
                <h3 className="font-semibold mt-4 mb-2">3.1 נתונים שאנו ניגשים אליהם מ-Google</h3>
                <p>כאשר אתה נכנס באמצעות חשבון Google שלך, אנו ניגשים <strong>אך ורק</strong> לנתונים הבאים:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>כתובת אימייל:</strong> לצורך יצירת חשבון, זיהוי והתחברות</li>
                  <li><strong>שם פרופיל:</strong> להצגת שמך באפליקציה</li>
                  <li><strong>תמונת פרופיל:</strong> להצגה בפרופיל שלך (אופציונלי)</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  אנו משתמשים בהיקפי ההרשאות הבאים בלבד: <code>email</code>, <code>profile</code>, <code>openid</code>
                </p>

                <h3 className="font-semibold mt-4 mb-2">3.2 כיצד אנו משתמשים בנתוני Google</h3>
                <p>אנו משתמשים בנתוני Google שלך אך ורק למטרות הבאות:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>אימות:</strong> כדי לאמת את זהותך ולאפשר לך להתחבר לחשבונך</li>
                  <li><strong>הצגת פרופיל:</strong> להציג את שמך ותמונתך בממשק האפליקציה</li>
                  <li><strong>תקשורת:</strong> לשלוח התראות חשובות על חשבונך (כמו אימות או שינויי מנוי)</li>
                </ul>
                <p className="mt-2"><strong>אנו לא משתמשים בנתוני Google שלך לפרסום, שיווק, או מכירה לצדדים שלישיים.</strong></p>

                <h3 className="font-semibold mt-4 mb-2">3.3 אחסון נתוני Google</h3>
                <p>נתוני Google שלך מאוחסנים בצורה מאובטחת:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>מיקום:</strong> שרתי Supabase עם הצפנה בזמן מנוחה ובזמן העברה</li>
                  <li><strong>משך שמירה:</strong> כל עוד יש לך חשבון פעיל</li>
                  <li><strong>הגנה:</strong> Row Level Security (RLS) מבטיחה שרק אתה יכול לגשת לנתונים שלך</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">3.4 שיתוף נתוני Google</h3>
                <p><strong>אנו לא משתפים את נתוני Google שלך עם צדדים שלישיים</strong> למעט:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Supabase:</strong> לאחסון מאובטח (ספק התשתית שלנו)</li>
                </ul>
                <p className="mt-2">אנו לא מוכרים, משכירים או סוחרים בנתוני Google שלך.</p>

                <h3 className="font-semibold mt-4 mb-2">3.5 מחיקת נתוני Google</h3>
                <p>תוכל לבקש מחיקה מלאה של נתוני Google שלך בכל עת:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>דרך הגדרות הפרופיל באפליקציה (לחץ על "מחק חשבון")</li>
                  <li>על ידי שליחת אימייל ל-<a href="mailto:support@talkfix.app" className="text-primary hover:underline">support@talkfix.app</a></li>
                </ul>
                <p className="mt-2">לאחר מחיקה, כל נתוני Google שלך יוסרו לצמיתות תוך 30 יום.</p>
              </section>

              {/* Chrome Extension Privacy Section */}
              <section className="bg-secondary/50 border border-border rounded-lg p-4">
                <h2 className="text-xl font-semibold mt-2 mb-3">4. תוסף הדפדפן של TalkFix</h2>
                
                <h3 className="font-semibold mt-4 mb-2">4.1 מבוא</h3>
                <p>
                  ברוכים הבאים ל-TalkFix. אנו מחויבים להגן על פרטיותך. 
                  סעיף זה מסביר כיצד תוסף הדפדפן שלנו מתקשר עם הנתונים שלך.
                </p>

                <h3 className="font-semibold mt-4 mb-2">4.2 איסוף ושימוש במידע</h3>
                <p>TalkFix אינו אוסף, מאחסן או מעביר נתוני גלישה אישיים.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>תוכן אתרים:</strong> התוסף שלנו דורש הרשאה לקרוא ולשנות תוכן אתרים. זה משמש באופן מקומי בלבד בדפדפן שלך לזיהוי מילים בעברית והחלפתן בתרגומים לאנגלית למטרות חינוכיות.</li>
                  <li><strong>אין העברת היסטוריית גלישה:</strong> שום טקסט מהאתרים שאתה מבקר בהם לא נשלח לשרתים שלנו או לצדדים שלישיים.</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.3 אחסון וסנכרון נתונים (Supabase)</h3>
                <p>כדי לספק חוויית למידה עקבית, TalkFix מסנכרן את ההתקדמות שלך:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>רשימת מילים:</strong> רשימת המילים שלמדת מאוחסנת ונשלפת מ-Supabase, ספק מסד נתונים מאובטח של צד שלישי.</li>
                  <li><strong>מטרה:</strong> אחסון זה משמש אך ורק כדי לאפשר לך גישה לרשימת המילים האישית שלך ממכשירים שונים ולשמור את התקדמות הלמידה שלך.</li>
                  <li><strong>אימות:</strong> אם אתה מתחבר, פרטי החשבון הבסיסיים שלך (כמו אימייל) מטופלים באופן מאובטח על ידי Supabase לזיהוי רשימת המילים הספציפית שלך.</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.4 גילוי מידע</h3>
                <p>
                  אנו לא מוכרים, סוחרים או מעבירים את המידע שלך לצדדים חיצוניים. 
                  אנו עומדים במדיניות נתוני המשתמש של Google, כולל:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>אי מכירת נתוני משתמשים.</li>
                  <li>אי שימוש בנתונים למטרות לא קשורות (כמו פרסום או דירוג אשראי).</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.5 הרשאות התוסף</h3>
                <p>התוסף מבקש את ההרשאות הבאות:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>storage:</strong> לשמירת הסשן וההגדרות המקומיות שלך.</li>
                  <li><strong>scripting / activeTab / host permissions:</strong> לאפשר החלפת טקסט בדפים שאתה מבקר בהם למטרות חינוכיות.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. מידע שנאסף על ידי PayPal</h2>
                <p>
                  כשאתה מבצע רכישה, PayPal אוסף:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>פרטי תשלום (כרטיס אשראי, חשבון PayPal, Google Pay)</li>
                  <li>כתובת חיוב</li>
                  <li>מידע מס (מע"מ אם רלוונטי)</li>
                  <li>כתובת IP ומידע על המכשיר</li>
                </ul>
                <p className="mt-2">
                  PayPal שומר על אמצעי הגנה מתקדמים להגנה על האבטחה, 
                  הסודיות והשלמות של נתונים אלה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. כיצד אנו משתמשים במידע שלך</h2>
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
                <h2 className="text-xl font-semibold mt-6 mb-3">7. שימוש בנתונים עבור AI/ML</h2>
                <p>
                  <strong>אנו לא משתמשים בנתונים האישיים שלך או בנתוני Google שלך לאימון מודלים של בינה מלאכותית או למידת מכונה.</strong> 
                  כל שירותי AI שאנו מספקים משתמשים במודלים מאומנים מראש ללא נתוני המשתמש שלך.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. אחסון ואבטחת נתונים</h2>
                <p>
                  הנתונים שלך מאוחסנים באופן מאובטח באמצעות Supabase, עם הצפנה במנוחה ובמעבר. 
                  אנו מיישמים אמצעי אבטחה סטנדרטיים בתעשייה להגנה על המידע שלך.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. שיתוף נתונים</h2>
                <p>אנו לא מוכרים את הנתונים האישיים שלך. אנו משתפים נתונים עם:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>PayPal:</strong> לעיבוד תשלומים (<a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">מדיניות הפרטיות של PayPal</a>)</li>
                  <li><strong>Supabase:</strong> לאחסון וניהול נתונים</li>
                  <li><strong>ספקי ניתוח:</strong> לשיפור השירות (נתונים אנונימיים)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. הזכויות שלך</h2>
                <p>יש לך את הזכות:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>לגשת לנתונים האישיים שלך</li>
                  <li>לתקן נתונים לא מדויקים</li>
                  <li>למחוק את חשבונך ונתוניך</li>
                  <li>לייצא את נתוני הלמידה שלך</li>
                  <li>לבטל הסכמה לתקשורת שיווקית</li>
                </ul>
                <p className="mt-2">
                  לבקשות הקשורות לנתוני תשלום, אנא צור קשר עם PayPal ישירות דרך{" "}
                  <a href="https://www.paypal.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/help</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. קובצי עוגיות</h2>
                <p>
                  אנו משתמשים בקובצי עוגיות חיוניים לפונקציונליות האפליקציה, כגון שמירה על 
                  סשן ההתחברות שלך. PayPal עשוי להשתמש בקובצי עוגיות נוספים לעיבוד תשלומים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. פרטיות ילדים</h2>
                <p>
                  השירות שלנו אינו מיועד לילדים מתחת לגיל 13. איננו אוספים ביודעין 
                  מידע מילדים מתחת לגיל זה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">13. העברות בינלאומיות</h2>
                <p>
                  הנתונים שלך עשויים להיות מועברים ומעובדים במדינות מחוץ למדינת מגוריך. 
                  PayPal ו-TalkFix מבטיחים שהעברות כאלה נעשות בהתאם לחוקי הגנת המידע החלים.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">14. שינויים במדיניות זו</h2>
                <p>
                  אנו עשויים לעדכן מדיניות זו מעת לעת. נודיע לך על שינויים משמעותיים 
                  באמצעות דוא"ל או הודעה באפליקציה.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">15. יצירת קשר</h2>
                <p>לשאלות לגבי מדיניות פרטיות זו:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: privacy@talkfix.app</li>
                  <li>PayPal (לעניינים הקשורים לתשלום): <a href="https://www.paypal.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/help</a></li>
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
                  <strong>PayPal is used for our payment processing.</strong>{" "}
                  PayPal collects and processes payment information in accordance with their privacy policy available at{" "}
                  <a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    paypal.com/privacy
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
                  <li><strong>Payment information:</strong> Collected and processed by PayPal (not stored by us)</li>
                </ul>
              </section>

              {/* Google User Data Section - Required for Google OAuth verification */}
              <section className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                <h2 className="text-xl font-semibold mt-2 mb-3">3. Google User Data</h2>
                
                <h3 className="font-semibold mt-4 mb-2">3.1 Data We Access from Google</h3>
                <p>When you sign in with your Google account, we access <strong>only</strong> the following data:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Email address:</strong> For account creation, identification, and login</li>
                  <li><strong>Profile name:</strong> To display your name in the app</li>
                  <li><strong>Profile picture:</strong> To display in your profile (optional)</li>
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  We use only the following scopes: <code>email</code>, <code>profile</code>, <code>openid</code>
                </p>

                <h3 className="font-semibold mt-4 mb-2">3.2 How We Use Google Data</h3>
                <p>We use your Google data solely for the following purposes:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Authentication:</strong> To verify your identity and allow you to log into your account</li>
                  <li><strong>Profile display:</strong> To show your name and picture in the app interface</li>
                  <li><strong>Communication:</strong> To send important notifications about your account</li>
                </ul>
                <p className="mt-2"><strong>We do not use your Google data for advertising, marketing, or selling to third parties.</strong></p>

                <h3 className="font-semibold mt-4 mb-2">3.3 Google Data Storage</h3>
                <p>Your Google data is stored securely:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Location:</strong> Supabase servers with encryption at rest and in transit</li>
                  <li><strong>Retention:</strong> As long as you have an active account</li>
                  <li><strong>Protection:</strong> Row Level Security (RLS) ensures only you can access your data</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">3.4 Google Data Sharing</h3>
                <p><strong>We do not share your Google data with third parties</strong> except:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Supabase:</strong> For secure storage (our infrastructure provider)</li>
                </ul>
                <p className="mt-2">We do not sell, rent, or trade your Google data.</p>

                <h3 className="font-semibold mt-4 mb-2">3.5 Google Data Deletion</h3>
                <p>You can request complete deletion of your Google data at any time:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Through the profile settings in the app (click "Delete Account")</li>
                  <li>By emailing <a href="mailto:support@talkfix.app" className="text-primary hover:underline">support@talkfix.app</a></li>
                </ul>
                <p className="mt-2">After deletion, all your Google data will be permanently removed within 30 days.</p>
              </section>

              {/* Chrome Extension Privacy Section */}
              <section className="bg-secondary/50 border border-border rounded-lg p-4">
                <h2 className="text-xl font-semibold mt-2 mb-3">4. TalkFix Chrome Extension</h2>
                
                <h3 className="font-semibold mt-4 mb-2">4.1 Introduction</h3>
                <p>
                  Welcome to TalkFix ("we," "our," or "us"). We are committed to protecting your privacy. 
                  This section explains how our Chrome Extension interacts with your data.
                </p>

                <h3 className="font-semibold mt-4 mb-2">4.2 Information Collection and Use</h3>
                <p>TalkFix does not collect, store, or transmit any personal browsing data.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Website Content:</strong> Our extension requires permission to read and change website content. This is used strictly locally on your browser to identify Hebrew words and replace them with English translations for educational purposes.</li>
                  <li><strong>No Data Transmission of Browsing History:</strong> No text from the websites you visit is ever sent to our servers or third parties.</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.3 Data Storage and Sync (Supabase)</h3>
                <p>To provide a consistent learning experience, TalkFix syncs your progress:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>User Word List:</strong> The list of words you have learned is stored and retrieved from Supabase, a secure third-party database provider.</li>
                  <li><strong>Purpose:</strong> This storage is used solely to allow you to access your personal word list across different devices and to save your learning progress.</li>
                  <li><strong>Authentication:</strong> If you sign in, your basic account information (like email) is handled securely by Supabase to identify your specific word list.</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.4 Disclosure of Information</h3>
                <p>
                  We do not sell, trade, or otherwise transfer your information to outside parties. 
                  We comply with Google User Data Policies, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Not selling user data.</li>
                  <li>Not using data for unrelated purposes (such as advertising or creditworthiness).</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">4.5 Permissions</h3>
                <p>The extension requests the following permissions:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>storage:</strong> To maintain your session and local settings.</li>
                  <li><strong>scripting / activeTab / host permissions:</strong> To allow the replacement of text on the pages you visit for educational purposes.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">5. Information Collected by PayPal</h2>
                <p>When you make a purchase, PayPal collects:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Payment details (credit card, PayPal account, Google Pay)</li>
                  <li>Billing address</li>
                  <li>Tax information (VAT if applicable)</li>
                  <li>IP address and device information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">6. How We Use Your Information</h2>
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
                <h2 className="text-xl font-semibold mt-6 mb-3">7. AI/ML Data Usage</h2>
                <p>
                  <strong>We do not use your personal data or Google data for training artificial intelligence or machine learning models.</strong> 
                  Any AI services we provide use pre-trained models without your user data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">8. Data Storage and Security</h2>
                <p>
                  Your data is stored securely using Supabase, with encryption at rest and in transit. 
                  We implement industry-standard security measures to protect your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">9. Data Sharing</h2>
                <p>We do not sell your personal data. We share data with:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>PayPal:</strong> For payment processing (<a href="https://www.paypal.com/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal's Privacy Policy</a>)</li>
                  <li><strong>Supabase:</strong> For data storage and management</li>
                  <li><strong>Analytics providers:</strong> For service improvement (anonymized data)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">10. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your account and data</li>
                  <li>Export your learning data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
                <p className="mt-2">
                  For requests related to payment data, please contact PayPal directly at{" "}
                  <a href="https://www.paypal.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/help</a>.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">11. Cookies</h2>
                <p>
                  We use essential cookies for app functionality, such as maintaining your login session. 
                  PayPal may use additional cookies for payment processing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">12. Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect 
                  information from children under this age.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">13. International Transfers</h2>
                <p>
                  Your data may be transferred and processed in countries outside your country of residence. 
                  PayPal and TalkFix ensure such transfers are made in compliance with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">14. Changes to This Policy</h2>
                <p>
                  We may update this policy from time to time. We will notify you of significant changes 
                  via email or in-app notification.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mt-6 mb-3">15. Contact Us</h2>
                <p>For questions about this privacy policy:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>TalkFix: privacy@talkfix.app</li>
                  <li>PayPal (for payment-related matters): <a href="https://www.paypal.com/help" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paypal.com/help</a></li>
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
    </div>
  );
};

export default Privacy;
