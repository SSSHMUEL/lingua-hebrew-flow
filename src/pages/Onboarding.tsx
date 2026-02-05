import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Users, GraduationCap, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { useLanguage, LanguageCode } from "@/contexts/LanguageContext";

// Audience types with their icons and descriptions
const AUDIENCES = {
  kids: {
    icon: Users,
    emoji: "🎮",
    labelEn: "Kids",
    labelHe: "ילדים",
    descEn: "Fun learning with games, animals, and school topics",
    descHe: "למידה כיפית עם משחקים, חיות ונושאי בית ספר",
  },
  students: {
    icon: GraduationCap,
    emoji: "📚",
    labelEn: "Students",
    labelHe: "תלמידים",
    descEn: "Academic vocabulary for school and university",
    descHe: "אוצר מילים אקדמי לבית ספר ואוניברסיטה",
  },
  business: {
    icon: Briefcase,
    emoji: "💼",
    labelEn: "Business Professionals",
    labelHe: "אנשי עסקים",
    descEn: "Professional vocabulary for work and meetings",
    descHe: "אוצר מילים מקצועי לעבודה ופגישות",
  },
};

// Interests per audience type
const INTERESTS_BY_AUDIENCE = {
  kids: [
    { id: "טבע", labelEn: "Animals & Nature", labelHe: "חיות וטבע", icon: "🐾" },
    { id: "חינוך", labelEn: "School", labelHe: "בית ספר", icon: "🏫" },
    { id: "בידור", labelEn: "Games & Entertainment", labelHe: "משחקים ובידור", icon: "🎮" },
    { id: "אוכל", labelEn: "Food", labelHe: "אוכל", icon: "🍕" },
    { id: "ספורט", labelEn: "Sports", labelHe: "ספורט", icon: "⚽" },
    { id: "בסיסי", labelEn: "Basic Words", labelHe: "מילים בסיסיות", icon: "🔤" },
  ],
  students: [
    { id: "חינוך", labelEn: "Education", labelHe: "חינוך", icon: "📚" },
    { id: "טכנולוגיה", labelEn: "Technology", labelHe: "טכנולוגיה", icon: "💻" },
    { id: "מדע", labelEn: "Science", labelHe: "מדע", icon: "🔬" },
    { id: "בריאות", labelEn: "Health", labelHe: "בריאות", icon: "🏥" },
    { id: "נסיעות", labelEn: "Travel", labelHe: "נסיעות", icon: "✈️" },
    { id: "בידור", labelEn: "Entertainment", labelHe: "בידור", icon: "🎬" },
  ],
  business: [
    { id: "עסקים", labelEn: "Business", labelHe: "עסקים", icon: "💼" },
    { id: "כלכלה", labelEn: "Economy & Finance", labelHe: "כלכלה ופיננסים", icon: "📈" },
    { id: "טכנולוגיה", labelEn: "Technology", labelHe: "טכנולוגיה", icon: "💻" },
    { id: "שיווק", labelEn: "Marketing", labelHe: "שיווק", icon: "📣" },
    { id: "מקצועות", labelEn: "Professional", labelHe: "מקצועי", icon: "👔" },
    { id: "נסיעות", labelEn: "Travel", labelHe: "נסיעות", icon: "✈️" },
  ],
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setLearningDirection } = useLanguage();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Step 1: Audience type
  const [audienceType, setAudienceType] = useState<'kids' | 'students' | 'business' | null>(null);
  // Step 2: Interests based on audience
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

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

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !audienceType) {
      toast({
        title: isEnglishUI ? "Select your profile" : "בחר את הפרופיל שלך",
        description: isEnglishUI ? "Please select who you are" : "בחר מי אתה כדי להמשיך",
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
    if (!audienceType) return;
    
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
      setLearningDirection('he' as LanguageCode, 'en' as LanguageCode);

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const profileData = {
        english_level: audienceType, // Store audience type in english_level for now
        source_language: sourceLanguage,
        target_language: targetLanguage,
        onboarding_completed: true,
        interests: selectedInterests,
      };

      let profileError;

      if (existingProfile) {
        const result = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);
        profileError = result.error;
      } else {
        const result = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            ...profileData,
          });
        profileError = result.error;
      }

      if (profileError) throw profileError;

      // Save topic preferences
      if (selectedInterests.length > 0) {
        await supabase
          .from("user_topic_preferences")
          .delete()
          .eq("user_id", user.id);

        const topicRecords = selectedInterests.map(topicId => ({
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
            audienceType,
            interests: selectedInterests,
          }
        });
      } catch (e) {
        console.error("Error populating words:", e);
        // Don't fail onboarding if word population fails
      }

      toast({
        title: isEnglishUI ? "Welcome! 🎉" : "ברוך הבא! 🎉",
        description: isEnglishUI
          ? "Registration complete. You have 30 days free trial!"
          : "ההרשמה הושלמה בהצלחה. יש לך 30 יום ניסיון חינם!",
      });

      navigate("/");
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

  const availableInterests = audienceType ? INTERESTS_BY_AUDIENCE[audienceType] : [];

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
          {[1, 2].map((s) => (
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

        {/* Step 1: Audience Type Selection */}
        {step === 1 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isEnglishUI ? "Who are you?" : "מי אתה?"}
              </CardTitle>
              <CardDescription>
                {isEnglishUI ? "Choose your profile to get personalized content" : "בחר את הפרופיל שלך לקבלת תוכן מותאם אישית"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(AUDIENCES) as Array<keyof typeof AUDIENCES>).map((key) => {
                const audience = AUDIENCES[key];
                const Icon = audience.icon;
                const isSelected = audienceType === key;
                
                return (
                  <div
                    key={key}
                    className={`flex items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 hover:scale-[1.02] ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg"
                        : "border-border"
                    }`}
                    onClick={() => {
                      setAudienceType(key);
                      setSelectedInterests([]); // Reset interests when changing audience
                    }}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${
                      isSelected ? "bg-primary/20" : "bg-muted"
                    }`}>
                      {audience.emoji}
                    </div>
                    <div className={`flex-1 ${isEnglishUI ? 'ml-4' : 'mr-4'}`}>
                      <div className="font-bold text-lg">
                        {isEnglishUI ? audience.labelEn : audience.labelHe}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isEnglishUI ? audience.descEn : audience.descHe}
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Interests Selection */}
        {step === 2 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isEnglishUI ? "What interests you?" : "מה מעניין אותך?"}
              </CardTitle>
              <CardDescription>
                {isEnglishUI 
                  ? "Choose topics you'd like to learn about (select at least one)" 
                  : "בחר נושאים שתרצה ללמוד עליהם (בחר לפחות אחד)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest.id);
                  
                  return (
                    <div
                      key={interest.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => handleInterestToggle(interest.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleInterestToggle(interest.id)}
                      />
                      <span className="text-2xl">{interest.icon}</span>
                      <span className="font-medium text-sm">
                        {isEnglishUI ? interest.labelEn : interest.labelHe}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Trial info */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className={isEnglishUI ? 'text-left' : 'text-right'}>
                    <h4 className="font-semibold text-primary">
                      {isEnglishUI ? "30 Days Free Trial!" : "30 ימי ניסיון חינם!"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isEnglishUI ? "No payment details required" : "ללא צורך בפרטי תשלום"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="gap-2">
              {isEnglishUI ? (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </>
              ) : (
                <>
                  חזרה
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <Button onClick={handleNext} className="gap-2" disabled={!audienceType}>
              {isEnglishUI ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4" />
                  הבא
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading || selectedInterests.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEnglishUI ? "Setting up..." : "מגדיר..."}
                </>
              ) : (
                <>
                  {isEnglishUI ? "Start Learning" : "התחל ללמוד"}
                  <Sparkles className="w-4 h-4" />
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
