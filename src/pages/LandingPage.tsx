import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Zap, Brain, Globe, Laptop, ArrowLeft, ArrowRight, Library, Monitor, RefreshCw } from 'lucide-react';
import { WordSwapDemo } from '@/components/WordSwapDemo';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';

export const LandingPage = () => {
    const { language, isRTL } = useLanguage();

    // Content translations
    const content = {
        he: {
            badge: "המהפכה בלימוד אנגלית כבר כאן",
            titleLine1: "ללמוד אנגלית",
            titleLine2: "בלי להתאמץ בכלל",
            description: "התוסף החכם של TalkFix הופך כל גלישה באינטרנט לשיעור אנגלית פרטי. אנחנו מחליפים מילים בעברית לאנגלית באתרים שאתם כבר גולשים בהם - וכך אתם לומדים ומשננים בלי לשים לב!",
            ctaPrimary: "התחילו עכשיו בחינם",
            ctaSecondary: "הורידו את התוסף",
            features: ["מתאים לכל הרמות", "למידה אגבית (Passive Learning)"],
            demoBadge: "שיפור הזיכרון",
            demoSub: "+45% אפקטיביות",
            howItWorksTitle: "איך הקסם עובד?",
            howItWorksDesc: "שיטה מדעית מוכחת שמשלבת את הלימוד בשגרה היומית שלכם, במקום להילחם בה.",
            step1Title: "1. בוחרים נושאים",
            step1Desc: "בוחרים את תחומי העניין שלכם בפלטפורמה שלנו - כדורגל, טכנולוגיה, אופנה ועוד.",
            step2Title: "2. גולשים כרגיל",
            step2Desc: "ממשיכים לגלוש באתרים האהובים עליכם - חדשות, פייסבוק, או כל אתר אחר.",
            step3Title: "3. המילים משתנות",
            step3Desc: "התוסף מזהה מילים מהמאגר שלכם ומחליף אותן לאנגלית בצורה חכמה בתוך הטקסט.",
            audienceTitle: "למי זה מתאים?",
            audienceDescPart1: "השיטה שלנו מושלמת עבור אנשים עסוקים שרוצים לשפר את האנגלית שלהם",
            audienceDescPart2: "בלי להקדיש לזה זמן מיוחד",
            audienceDescPart3: "בין אם אתם סטודנטים, אנשי הייטק, או סתם רוצים להרגיש בטוחים יותר בשיחה - TalkFix תעזור לכם לספוג את השפה בצורה טבעית.",
            audiences: ['מתחילים', 'מתקדמים', 'ילדים ונוער', 'אנשי עסקים'],
            finalCtaTitle: "מוכנים להתחיל?",
            finalCtaButton: "יצירת חשבון חינם",
            finalCtaSub: "נסו את גרסת הפרימיום שלנו חינם",
            footer: {
                terms: "תנאי שימוש",
                privacy: "מדיניות פרטיות",
                refund: "מדיניות החזרים",
                about: "אודות",
                rights: "כל הזכויות שמורות."
            }
        },
        en: {
            badge: "The Language Learning Revolution is Here",
            titleLine1: "Learn Hebrew",
            titleLine2: "Without Any Effort",
            description: "TalkFix's smart extension turns every web browsing session into a private Hebrew lesson. We replace English words with Hebrew on websites you already visit - so you learn and memorize without even noticing!",
            ctaPrimary: "Start Now for Free",
            ctaSecondary: "Download Extension",
            features: ["Suitable for All Levels", "Passive Learning"],
            demoBadge: "Memory Boost",
            demoSub: "+45% Effectiveness",
            howItWorksTitle: "How Does the Magic Work?",
            howItWorksDesc: "A scientifically proven method that integrates learning into your daily routine, instead of fighting it.",
            step1Title: "1. Choose Topics",
            step1Desc: "Select your interests on our platform - Football, Technology, Fashion, and more.",
            step2Title: "2. Browse as Usual",
            step2Desc: "Continue browsing your favorite sites - News, Facebook, or any other site.",
            step3Title: "3. Words Change",
            step3Desc: "The extension identifies words from your pool and smartly swaps them to Hebrew within the text.",
            audienceTitle: "Who is it for?",
            audienceDescPart1: "Our method is perfect for busy people who want to improve their Hebrew",
            audienceDescPart2: "without dedicating special time to it",
            audienceDescPart3: "Whether you are a student, a tech professional, or just want to feel more confident in conversation - TalkFix will help you absorb the language naturally.",
            audiences: ['Beginners', 'Advanced', 'Kids & Teens', 'Business Pros'],
            finalCtaTitle: "Ready to Start?",
            finalCtaButton: "Create Free Account",
            finalCtaSub: "Try our Premium version free",
            footer: {
                terms: "Terms of Use",
                privacy: "Privacy Policy",
                refund: "Refund Policy",
                about: "About",
                rights: "All rights reserved."
            }
        }
    };

    const t = language === 'he' ? content.he : content.en;
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Top Right - Blue/Primary */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]" />

                {/* Center/Left - Maximum Intensity Orange */}
                <div className="absolute top-[5%] -left-[5%] w-[1200px] h-[1200px] rounded-full bg-orange-600/25 blur-[150px]" />

                {/* Bottom - Subtle Blue */}
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 relative z-10">

                {/* Hero Section */}
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20 md:mb-24">
                    <div className="space-y-8">
                        <div className="animate-fall-in opacity-0">
                            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 px-4 py-1.5 text-sm rounded-full transition-transform hover:scale-105 cursor-default">
                                {t.badge}
                            </Badge>
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1] animate-fall-in delay-100 opacity-0">
                            {t.titleLine1} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-blue-400 to-cyan-400">
                                {t.titleLine2}
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl animate-fall-in delay-200 opacity-0">
                            {t.description}
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fall-in delay-300 opacity-0">
                            <Link to="/auth?tab=signup">
                                <Button size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-blue-600 hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                                    {t.ctaPrimary} <ArrowIcon className="mx-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link to="/downloads">
                                <Button size="lg" variant="outline" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md hover:scale-105 transition-all duration-300 w-full sm:w-auto">
                                    <Laptop className="mx-2 h-5 w-5" /> {t.ctaSecondary}
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground pt-4 animate-fall-in delay-500 opacity-0">
                            {t.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <CheckCircle2 className="text-green-500 h-4 w-4" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hero Visual / Animation */}
                    <div className="relative animate-float">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-purple-500/30 rounded-full blur-[100px] opacity-50" />
                        <WordSwapDemo isRTL={isRTL} />

                        {/* Floating Cards */}
                        <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 glass-card p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 animate-bounce-slow shadow-lg">
                            <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div className="text-xs sm:text-sm">
                                <div className="font-bold">{t.demoBadge}</div>
                                <div className="text-muted-foreground text-[10px] sm:text-xs">{t.demoSub}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Value Props / How it works */}
                <div className="mb-16 sm:mb-20 md:mb-24">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6">{t.howItWorksTitle} ✨</h2>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                            {t.howItWorksDesc}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            {
                                icon: <Library className="h-12 w-12 text-blue-400" />,
                                title: t.step1Title,
                                desc: t.step1Desc
                            },
                            {
                                icon: <Monitor className="h-12 w-12 text-blue-400" />,
                                title: t.step2Title,
                                desc: t.step2Desc
                            },
                            {
                                icon: <RefreshCw className="h-12 w-12 text-blue-400" />,
                                title: t.step3Title,
                                desc: t.step3Desc
                            }
                        ].map((item, i) => (
                            <Card key={i} className="glass-card border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 group">
                                <CardContent className="p-8 text-center">
                                    <div className="w-24 h-24 mx-auto bg-primary/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-primary/20 shadow-[0_0_30px_-5px_hsla(var(--primary)/0.3)]">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {item.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Target Audience */}
                <div className="glass-card rounded-2xl sm:rounded-[3rem] p-6 sm:p-8 md:p-16 border-white/10 relative overflow-hidden text-center mb-16 sm:mb-20 md:mb-24">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">{t.audienceTitle} 🤔</h2>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed">
                            {t.audienceDescPart1}
                            <span className="text-primary font-bold"> {t.audienceDescPart2}</span>.
                            <br />
                            {t.audienceDescPart3}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
                            {t.audiences.map((audience) => (
                                <div key={audience} className="bg-white/5 rounded-xl py-3 sm:py-4 px-2 font-bold border border-white/10 text-sm sm:text-base">
                                    {audience}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t.finalCtaTitle}</h2>
                    <Link to="/auth?tab=signup">
                        <Button size="lg" className="rounded-full px-8 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 hover:scale-105 transition-all w-full sm:w-auto">
                            {t.finalCtaButton} <ArrowIcon className="mx-2 h-6 w-6" />
                        </Button>
                    </Link>
                    <p className="mt-4 text-sm text-muted-foreground">{t.finalCtaSub}</p>
                </div>

                {/* Footer */}
                <footer className="border-t border-white/10 mt-16 sm:mt-20 md:mt-24 pt-6 sm:pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Logo size="sm" showText={false} aria-label={isRTL ? "לוגו טוקפיקס" : "TalkFix Logo"} />
                            <span className="font-semibold text-foreground">TalkFix</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                {t.footer.terms}
                            </Link>
                            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                {t.footer.privacy}
                            </Link>
                            <Link to="/refund" className="text-muted-foreground hover:text-primary transition-colors">
                                {t.footer.refund}
                            </Link>
                            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                {t.footer.about}
                            </Link>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} TalkFix. {t.footer.rights}
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};
