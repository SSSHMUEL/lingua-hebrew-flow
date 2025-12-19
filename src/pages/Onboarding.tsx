import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, GraduationCap, Languages, BookOpen, Sparkles } from "lucide-react";

const englishLevels = [
  { id: "beginner", label: "מתחיל", description: "אני רק מתחיל ללמוד אנגלית" },
  { id: "elementary", label: "בסיסי", description: "אני מכיר מילים בסיסיות וביטויים פשוטים" },
  { id: "intermediate", label: "בינוני", description: "אני יכול לנהל שיחה פשוטה" },
  { id: "upper-intermediate", label: "מתקדם בינוני", description: "אני מבין רוב התוכן אבל צריך לשפר" },
  { id: "advanced", label: "מתקדם", description: "אני שולט באנגלית ברמה גבוהה" },
];

const sourceLanguages = [
  { id: "hebrew", label: "עברית", flag: "🇮🇱" },
  { id: "english", label: "אנגלית", flag: "🇺🇸" },
];

const targetLanguages = [
  { id: "english", label: "אנגלית", flag: "🇺🇸" },
  { id: "hebrew", label: "עברית", flag: "🇮🇱" },
];

const availableTopics = [
  { id: "business", label: "עסקים", icon: "💼" },
  { id: "travel", label: "טיולים", icon: "✈️" },
  { id: "technology", label: "טכנולוגיה", icon: "💻" },
  { id: "food", label: "אוכל", icon: "🍕" },
  { id: "sports", label: "ספורט", icon: "⚽" },
  { id: "movies", label: "סרטים", icon: "🎬" },
  { id: "music", label: "מוזיקה", icon: "🎵" },
  { id: "health", label: "בריאות", icon: "🏥" },
  { id: "education", label: "חינוך", icon: "📚" },
  { id: "shopping", label: "קניות", icon: "🛍️" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [englishLevel, setEnglishLevel] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("hebrew");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if onboarding is already completed
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

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleNext = () => {
    if (step === 1 && !englishLevel) {
      toast({
        title: "בחר רמת אנגלית",
        description: "יש לבחור את רמת האנגלית שלך כדי להמשיך",
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
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Update profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          english_level: englishLevel,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Save topic preferences
      if (selectedTopics.length > 0) {
        // Delete existing preferences
        await supabase
          .from("user_topic_preferences")
          .delete()
          .eq("user_id", user.id);

        // Insert new preferences
        const topicRecords = selectedTopics.map(topicId => ({
          user_id: user.id,
          topic_id: topicId,
        }));

        const { error: topicsError } = await supabase
          .from("user_topic_preferences")
          .insert(topicRecords);

        if (topicsError) throw topicsError;
      }

      toast({
        title: "ברוך הבא! 🎉",
        description: "ההרשמה הושלמה בהצלחה. יש לך 30 יום ניסיון חינם!",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הנתונים",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-12 bg-primary"
                  : s < step
                  ? "w-8 bg-primary/60"
                  : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: English Level */}
        {step === 1 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">מה רמת האנגלית שלך?</CardTitle>
              <CardDescription>זה יעזור לנו להתאים את התוכן ברמה המתאימה לך</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={englishLevel} onValueChange={setEnglishLevel}>
                {englishLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`flex items-center space-x-3 space-x-reverse p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                      englishLevel === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => setEnglishLevel(level.id)}
                  >
                    <RadioGroupItem value={level.id} id={level.id} />
                    <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Languages */}
        {step === 2 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">מאיזו שפה לאיזו שפה?</CardTitle>
              <CardDescription>בחר את שפת המקור ושפת היעד ללמידה</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">שפת המקור שלי:</h3>
                <RadioGroup value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <div className="grid grid-cols-2 gap-3">
                    {sourceLanguages.map((lang) => (
                      <div
                        key={lang.id}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                          sourceLanguage === lang.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => setSourceLanguage(lang.id)}
                      >
                        <RadioGroupItem value={lang.id} id={`source-${lang.id}`} className="sr-only" />
                        <span className="text-2xl">{lang.flag}</span>
                        <Label htmlFor={`source-${lang.id}`} className="font-semibold cursor-pointer">
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">אני רוצה ללמוד:</h3>
                <RadioGroup value={targetLanguage} onValueChange={setTargetLanguage}>
                  <div className="grid grid-cols-2 gap-3">
                    {targetLanguages.map((lang) => (
                      <div
                        key={lang.id}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                          targetLanguage === lang.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                        onClick={() => setTargetLanguage(lang.id)}
                      >
                        <RadioGroupItem value={lang.id} id={`target-${lang.id}`} className="sr-only" />
                        <span className="text-2xl">{lang.flag}</span>
                        <Label htmlFor={`target-${lang.id}`} className="font-semibold cursor-pointer">
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Topics */}
        {step === 3 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">באילו נושאים אתה מתעניין?</CardTitle>
              <CardDescription>בחר נושאים שמעניינים אותך כדי שנתאים את התוכן (אופציונלי)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                      selectedTopics.includes(topic.id)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleTopicToggle(topic.id)}
                  >
                    <Checkbox
                      checked={selectedTopics.includes(topic.id)}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                    />
                    <span className="text-lg">{topic.icon}</span>
                    <span className="font-medium text-sm">{topic.label}</span>
                  </div>
                ))}
              </div>

              {/* Trial info */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">30 ימי ניסיון חינם!</h4>
                    <p className="text-sm text-muted-foreground">
                      ללא צורך בפרטי תשלום. תוכל להחליט אחר כך.
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
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>
          ) : (
            <div />
          )}
          
          {step < 3 ? (
            <Button onClick={handleNext} className="gap-2">
              המשך
              <ArrowLeft className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
              {isLoading ? "שומר..." : "בואו נתחיל! 🚀"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
