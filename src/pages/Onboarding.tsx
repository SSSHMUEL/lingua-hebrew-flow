import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Users, GraduationCap, Briefcase, Sparkles, Loader2, BookOpen, Crown } from "lucide-react";
import { useLanguage, LanguageCode } from "@/contexts/LanguageContext";

// New Onboarding Data Structure
const ONBOARDING_DATA = {
  kids: {
    id: "kids",
    icon: Users,
    emoji: "🎮",
    labelEn: "Kids & Teens",
    labelHe: "ילדים ונוער",
    descEn: "Fun learning for kids and teenagers",
    descHe: "למידה מהנה המותאמת לילדים ולבני נוער",
    levels: [
      {
        id: "Letters",
        labelEn: "Letters",
        labelHe: "אותיות",
        categories: [
          { id: "בסיסי", labelEn: "The ABC", labelHe: "ה-ABC", icon: "🔤" },
          { id: "בסיסי", labelEn: "First Sounds", labelHe: "צלילים ראשונים", icon: "🔊" },
          { id: "בסיסי", labelEn: "Similar Letters", labelHe: "אותיות דומות", icon: "📝" },
        ]
      },
      {
        id: "A1",
        labelEn: "Beginners (A1)",
        labelHe: "מתחילים (A1)",
        categories: [
          { id: "החברים והמשפחה שלי", labelEn: "Family & Friends", labelHe: "החברים והמשפחה שלי", icon: "🏠" },
          { id: "מה יש לי בצלחת?", labelEn: "On My Plate", labelHe: "מה יש לי בצלחת?", icon: "🍎" },
          { id: "מסע מסביב לעולם", labelEn: "Around the World", labelHe: "מסע מסביב לעולם", icon: "🌍" },
          { id: "יוצאים להרפתקה בעיר", labelEn: "City Adventure", labelHe: "יוצאים להרפתקה בעיר", icon: "🚲" },
          { id: "החברים על ארבע", labelEn: "Four-legged friends", labelHe: "החברים על ארבע", icon: "🐶" },
          { id: "מה אני מרגיש היום?", labelEn: "How I Feel", labelHe: "מה אני מרגיש היום?", icon: "😊" },
          { id: "זמן לשחק!", labelEn: "Time to Play!", labelHe: "זמן לשחק!", icon: "🎮" },
          { id: "הבגדים החדשים שלי", labelEn: "My New Clothes", labelHe: "הבגדים החדשים שלי", icon: "👕" },
        ]
      },
      {
        id: "A2",
        labelEn: "Advanced (A2)",
        labelHe: "מתקדמים (A2)",
        categories: [
          { id: "התחביבים והחוגים שלי", labelEn: "Hobbies & Clubs", labelHe: "התחביבים והחוגים שלי", icon: "🎨" },
          { id: "מטיילים בעולם הגדול", labelEn: "World Traveler", labelHe: "מטיילים בעולם הגדול", icon: "✈️" },
          { id: "השף הצעיר במטבח", labelEn: "Young Chef", labelHe: "השף הצעיר במטבח", icon: "👨‍🍳" },
          { id: "הכוח הסודי שלי", labelEn: "My Secret Power", labelHe: "הכוח הסודי שלי", icon: "💪" },
          { id: "הטכנולוגיה סביבנו", labelEn: "Tech Around Us", labelHe: "הטכנולוגיה סביבנו", icon: "💻" },
          { id: "המקצועות של הגדולים", labelEn: "Grown-up Jobs", labelHe: "המקצועות של הגדולים", icon: "👷" },
          { id: "השכונה והסביבה שלי", labelEn: "My Neighborhood", labelHe: "השכונה והסביבה שלי", icon: "🌳" },
          { id: "סיפורים ודמיון", labelEn: "Stories & Imagination", labelHe: "סיפורים ודמיון", icon: "🏰" },
        ]
      }
    ]
  },
  students: {
    id: "students",
    icon: GraduationCap,
    emoji: "📚",
    labelEn: "Students & Adults",
    labelHe: "סטודנטים ומבוגרים",
    descEn: "General English for academic and daily use",
    descHe: "אנגלית כללית לשימוש אקדמי ויומיומי",
    levels: [
      {
        id: "B1",
        labelEn: "Intermediate (B1)",
        labelHe: "בינוני (B1)",
        categories: [
          { id: "נסיעות", labelEn: "Travel & Trips", labelHe: "נסיעות וטיולים", icon: "✈️" },
          { id: "קניות", labelEn: "Shopping", labelHe: "קניות", icon: "🛍️" },
          { id: "בידור", labelEn: "Leisure Activities", labelHe: "פעילויות פנאי", icon: "🎬" },
          { id: "בריאות", labelEn: "Health", labelHe: "בריאות", icon: "🏥" },
        ]
      },
      {
        id: "B2",
        labelEn: "Upper-Intermediate (B2)",
        labelHe: "בינוני-גבוה (B2)",
        categories: [
          { id: "בסיסי", labelEn: "Current Events", labelHe: "אקטואליה", icon: "📰" },
          { id: "עסקים", labelEn: "World of Work", labelHe: "עולם העבודה", icon: "💼" },
          { id: "בידור", labelEn: "Culture & Cinema", labelHe: "תרבות וקולנוע", icon: "🍿" },
          { id: "טכנולוגיה", labelEn: "Basic Technology", labelHe: "טכנולוגיה בסיסית", icon: "💻" },
        ]
      }
    ]
  },
  business: {
    id: "business",
    icon: Briefcase,
    emoji: "💼",
    labelEn: "Business & Professional",
    labelHe: "אנשי עסקים",
    descEn: "Professional English for the corporate world",
    descHe: "אנגלית מקצועית לעולם העסקים והניהול",
    levels: [
      {
        id: "C1",
        labelEn: "Advanced (C1)",
        labelHe: "מתקדם (C1)",
        categories: [
          { id: "כלכלה", labelEn: "Management & Economy", labelHe: "ניהול וכלכלה", icon: "📊" },
          { id: "עסקים", labelEn: "Marketing & Sales", labelHe: "שיווק ומכירות", icon: "📢" },
          { id: "Technology", labelEn: "Entrepreneurship & Startups", labelHe: "יזמות וסטארטאפים", icon: "🚀" },
          { id: "עסקים", labelEn: "Negotiation", labelHe: "משא ומתן", icon: "🤝" },
        ]
      },
      {
        id: "C2",
        labelEn: "Expert (C2)",
        labelHe: "מומחה (C2)",
        categories: [
          { id: "Technology", labelEn: "Data Analysis", labelHe: "ניתוח נתונים", icon: "📉" },
          { id: "כלכלה", labelEn: "Capital Market", labelHe: "שוק ההון", icon: "💹" },
          { id: "עסקים", labelEn: "Law & Contracts", labelHe: "משפטים וחוזים", icon: "⚖️" },
          { id: "עסקים", labelEn: "Global Leadership", labelHe: "מנהיגות גלובלית", icon: "🌍" },
        ]
      }
    ]
  }
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setLearningDirection } = useLanguage();

  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem("onboarding_step");
    return saved ? parseInt(saved) : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    sessionStorage.setItem("onboarding_step", step.toString());
  }, [step]);

  // Selection states
  const [selectedSegment, setSelectedSegment] = useState<keyof typeof ONBOARDING_DATA | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Language direction - default to Hebrew UI (he-en learning)
  const [learningDirection] = useState<'he-en' | 'en-he'>('he-en');
  const isEnglishUI = learningDirection === 'en-he';
  const currentDir = isEnglishUI ? 'ltr' : 'rtl';

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/");
      }

      setCheckingAuth(false);
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevelId(levelId);
    setSelectedTopics([]);
    setStep(3); // Auto-advance to topics
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !selectedSegment) {
      toast({
        title: isEnglishUI ? "Select your profile" : "בחר את הפרופיל שלך",
        description: isEnglishUI ? "Please select who you are" : "בחר מי אתה כדי להמשיך",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !selectedLevelId) {
      toast({
        title: isEnglishUI ? "Select your level" : "בחר את הרמה שלך",
        description: isEnglishUI ? "Please select your English level" : "בחר את רמת האנגלית שלך כדי להמשיך",
        variant: "destructive",
      });
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    if (!selectedSegment || !selectedLevelId) return;

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Set default learning direction (Hebrew to English)
      const sourceLanguage = 'hebrew';
      const targetLanguage = 'english';
      // Use upsert to ensure the profile record exists (especially for new users)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          segment_type: selectedSegment,
          skill_level: selectedLevelId,
          interest_topics: selectedTopics,
          onboarding_completed: true,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          english_level: selectedLevelId, // backward compatibility
          interests: selectedTopics, // backward compatibility
        } as any, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Update local state for language without triggering separate DB call
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'he';

      // Save to user_topic_preferences for compatibility
      if (selectedTopics.length > 0) {
        await supabase
          .from("user_topic_preferences")
          .delete()
          .eq("user_id", user.id);

        const topicRecords = selectedTopics.map(topicId => ({
          user_id: user.id,
          topic_id: topicId,
        }));

        const { error: topicsError } = await supabase
          .from("user_topic_preferences")
          .insert(topicRecords);

        if (topicsError) throw topicsError;
      }

      // Call edge function to populate initial words
      try {
        await supabase.functions.invoke('populate-user-words', {
          body: {
            audienceType: selectedSegment,
            interests: selectedTopics.join(','),
            skillLevel: selectedLevelId
          }
        });
      } catch (e) {
        console.error("Error populating words:", e);
      }

      toast({
        title: isEnglishUI ? "Welcome! 🎉" : "ברוך הבא! 🎉",
        description: isEnglishUI
          ? "Registration complete. You have 30 days free trial!"
          : "ההרשמה הושלמה בהצלחה. יש לך 30 יום ניסיון חינם!",
      });

      // Clear the step storage before redirect
      sessionStorage.removeItem("onboarding_step");

      // Use window.location.href for a full page reload to ensure OnboardingGuard 
      // and all providers pick up the fresh database state.
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        title: isEnglishUI ? "Error" : "שגיאה",
        description: isEnglishUI ? "Error saving data" : "אירעה שגיאה בשמירת הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentSegment = selectedSegment ? ONBOARDING_DATA[selectedSegment] : null;
  const currentLevel = currentSegment ? currentSegment.levels.find(l => l.id === selectedLevelId) : null;
  const availableCategories = currentLevel ? currentLevel.categories : [];

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4" style={{ background: 'var(--gradient-hero)' }} dir={currentDir}>
      {/* Background effects */}
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

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${s === step
                ? "w-12 bg-primary"
                : s < step
                  ? "w-8 bg-primary/60"
                  : "w-8 bg-muted"
                }`}
            />
          ))}
        </div>

        {/* Step 1: Segment Selection */}
        {step === 1 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isEnglishUI ? "Who are you?" : "מי אתה?"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isEnglishUI
                  ? "Choose the group that best describes you"
                  : "בחר את הקבוצה שמתארת אותך הכי טוב"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {(Object.keys(ONBOARDING_DATA) as Array<keyof typeof ONBOARDING_DATA>).map((key) => {
                const segment = ONBOARDING_DATA[key];
                const Icon = segment.icon;
                const isSelected = selectedSegment === key;

                return (
                  <div
                    key={key}
                    className={`flex items-center p-6 rounded-2xl border-2 transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.01] ${isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-background/50"
                      }`}
                    onClick={() => {
                      setSelectedSegment(key);
                      setSelectedLevelId(null);
                      setSelectedTopics([]);
                    }}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${isSelected ? "bg-primary/20" : "bg-muted"
                      }`}>
                      {segment.emoji}
                    </div>
                    <div className={`flex-1 ${isEnglishUI ? 'ml-4' : 'mr-4'} ${!isEnglishUI ? 'text-right' : 'text-left'}`}>
                      <div className="font-bold text-xl mb-1">
                        {isEnglishUI ? segment.labelEn : segment.labelHe}
                      </div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {isEnglishUI ? segment.descEn : segment.descHe}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Level Selection */}
        {step === 2 && currentSegment && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isEnglishUI ? "What is your level?" : "מה הרמה שלך?"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isEnglishUI
                  ? `Select your starting level for ${currentSegment.labelEn}`
                  : `בחר את רמת הפתיחה שלך עבור ${currentSegment.labelHe}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {currentSegment.levels.map((level) => {
                const isSelected = selectedLevelId === level.id;

                return (
                  <div
                    key={level.id}
                    className={`flex items-center p-5 rounded-2xl border-2 transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.01] ${isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border bg-background/50"
                      }`}
                    onClick={() => handleLevelSelect(level.id)}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className={`flex-1 ${isEnglishUI ? 'ml-4' : 'mr-4'} ${!isEnglishUI ? 'text-right' : 'text-left'}`}>
                      <div className="font-bold text-lg">
                        {isEnglishUI ? level.labelEn : level.labelHe}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Topics Selection */}
        {step === 3 && currentLevel && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {isEnglishUI ? "Which topics interest you?" : "איזה קטגוריות מעניינות אותך?"}
              </CardTitle>
              <CardDescription className="text-lg">
                {isEnglishUI
                  ? "Choose what you'd like to talk about"
                  : "בחר את התכנים שתרצה לראות בתוסף"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableCategories.map((category) => {
                  const isSelected = selectedTopics.includes(category.id);

                  return (
                    <div
                      key={category.id}
                      className={`relative flex flex-col items-center justify-center p-6 rounded-[2rem] border-4 transition-all cursor-pointer group hover:scale-[1.05] active:scale-[0.95] ${isSelected
                        ? "border-primary bg-primary/10 shadow-xl shadow-primary/20"
                        : "border-white/5 bg-background/40 hover:border-white/20"
                        }`}
                      onClick={() => handleTopicToggle(category.id)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-primary rounded-full p-1.5 shadow-lg border-2 border-background animate-in zoom-in duration-300">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`text-6xl mb-4 transition-transform duration-500 group-hover:rotate-12 ${isSelected ? 'scale-110' : 'opacity-80'}`}>
                        {category.icon}
                      </div>
                      <span className={`font-black text-center text-sm sm:text-base leading-tight ${isSelected ? 'text-primary' : 'text-foreground/70'}`}>
                        {isEnglishUI ? category.labelEn : category.labelHe}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Promo info */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className={isEnglishUI ? 'text-left' : 'text-right'}>
                    <h4 className="font-bold text-primary text-base">
                      {isEnglishUI ? "30 Days Free Trial!" : "30 ימי ניסיון חינם!"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isEnglishUI ? "Start your journey with full access to all features" : "התחל את המסע שלך עם גישה מלאה לכל התכונות"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="ghost" onClick={handleBack} className="gap-2 text-muted-foreground hover:text-foreground">
              {isEnglishUI ? (
                <>
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </>
              ) : (
                <>
                  חזרה
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              className="gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/20"
              disabled={step === 1 ? !selectedSegment : !selectedLevelId}
            >
              {isEnglishUI ? (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <ArrowLeft className="w-5 h-5" />
                  הבא
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading || selectedTopics.length === 0}
              className="gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isEnglishUI ? "Setting up..." : "מגדיר..."}
                </>
              ) : (
                <>
                  {isEnglishUI ? "Start Learning" : "התחל ללמוד"}
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

