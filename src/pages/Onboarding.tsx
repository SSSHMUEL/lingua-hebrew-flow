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
import { useLanguage, LanguageCode } from "@/contexts/LanguageContext";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, setLearningDirection, language, isRTL } = useLanguage();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [learningDirection, setLearningDirectionLocal] = useState<'he-en' | 'en-he'>('he-en');
  const [level, setLevel] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Dynamic content based on language direction
  const getLevels = () => {
    const isEnglishUI = learningDirection === 'en-he';
    return [
      { id: "beginner", label: isEnglishUI ? "Beginner" : "מתחיל", description: isEnglishUI ? "I'm just starting to learn" : "אני רק מתחיל ללמוד" },
      { id: "elementary", label: isEnglishUI ? "Elementary" : "בסיסי", description: isEnglishUI ? "I know basic words and simple phrases" : "אני מכיר מילים בסיסיות וביטויים פשוטים" },
      { id: "intermediate", label: isEnglishUI ? "Intermediate" : "בינוני", description: isEnglishUI ? "I can have simple conversations" : "אני יכול לנהל שיחה פשוטה" },
      { id: "upper-intermediate", label: isEnglishUI ? "Upper Intermediate" : "מתקדם בינוני", description: isEnglishUI ? "I understand most content but need improvement" : "אני מבין רוב התוכן אבל צריך לשפר" },
      { id: "advanced", label: isEnglishUI ? "Advanced" : "מתקדם", description: isEnglishUI ? "I have high proficiency" : "אני שולט ברמה גבוהה" },
    ];
  };

  const getTopics = () => {
    const isEnglishUI = learningDirection === 'en-he';
    return [
      { id: "business", label: isEnglishUI ? "Business" : "עסקים", icon: "💼" },
      { id: "travel", label: isEnglishUI ? "Travel" : "טיולים", icon: "✈️" },
      { id: "technology", label: isEnglishUI ? "Technology" : "טכנולוגיה", icon: "💻" },
      { id: "food", label: isEnglishUI ? "Food" : "אוכל", icon: "🍕" },
      { id: "sports", label: isEnglishUI ? "Sports" : "ספורט", icon: "⚽" },
      { id: "movies", label: isEnglishUI ? "Movies" : "סרטים", icon: "🎬" },
      { id: "music", label: isEnglishUI ? "Music" : "מוזיקה", icon: "🎵" },
      { id: "health", label: isEnglishUI ? "Health" : "בריאות", icon: "🏥" },
      { id: "education", label: isEnglishUI ? "Education" : "חינוך", icon: "📚" },
      { id: "shopping", label: isEnglishUI ? "Shopping" : "קניות", icon: "🛍️" },
    ];
  };

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

  const handleDirectionChange = (direction: 'he-en' | 'en-he') => {
    setLearningDirectionLocal(direction);
    // Immediately update the UI language
    const source: LanguageCode = direction === 'he-en' ? 'he' : 'en';
    const target: LanguageCode = direction === 'he-en' ? 'en' : 'he';
    setLearningDirection(source, target);
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleNext = () => {
    if (step === 2 && !level) {
      toast({
        title: learningDirection === 'en-he' ? "Select your level" : "בחר רמה",
        description: learningDirection === 'en-he' ? "Please select your language level to continue" : "יש לבחור את הרמה שלך כדי להמשיך",
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

      const sourceLanguage = learningDirection === 'he-en' ? 'hebrew' : 'english';
      const targetLanguage = learningDirection === 'he-en' ? 'english' : 'hebrew';

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let profileError;

      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from("profiles")
          .update({
            english_level: level,
            source_language: sourceLanguage,
            target_language: targetLanguage,
            onboarding_completed: true,
          })
          .eq("user_id", user.id);
        profileError = result.error;
      } else {
        // Create new profile (upsert)
        const result = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            english_level: level,
            source_language: sourceLanguage,
            target_language: targetLanguage,
            onboarding_completed: true,
          });
        profileError = result.error;
      }

      if (profileError) throw profileError;

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

      toast({
        title: learningDirection === 'en-he' ? "Welcome! 🎉" : "ברוך הבא! 🎉",
        description: learningDirection === 'en-he' 
          ? "Registration complete. You have 30 days free trial!" 
          : "ההרשמה הושלמה בהצלחה. יש לך 30 יום ניסיון חינם!",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      toast({
        title: learningDirection === 'en-he' ? "Error" : "שגיאה",
        description: learningDirection === 'en-he' ? "Error saving data" : "אירעה שגיאה בשמירת הנתונים",
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

  const isEnglishUI = learningDirection === 'en-he';
  const currentDir = isEnglishUI ? 'ltr' : 'rtl';

  return (
    <div className="min-h-screen relative overflow-hidden py-8 px-4" style={{ background: 'var(--gradient-hero)' }} dir={currentDir}>
      {/* Enhanced glowing background effects */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/12 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-primary/8 rounded-full blur-[80px]" />
      
      <div className="max-w-2xl mx-auto relative z-10">
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

        {/* Step 1: Language Direction */}
        {step === 1 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Languages className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isEnglishUI ? "Which direction do you want to learn?" : "באיזה כיוון תרצה ללמוד?"}
              </CardTitle>
              <CardDescription>
                {isEnglishUI ? "Choose your preferred learning direction" : "בחר את כיוון הלמידה המועדף עליך"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={learningDirection} onValueChange={(v) => handleDirectionChange(v as 'he-en' | 'en-he')}>
                <div
                  className={`flex items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    learningDirection === 'he-en'
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleDirectionChange('he-en')}
                >
                  <RadioGroupItem value="he-en" id="he-en" />
                  <Label htmlFor="he-en" className={`flex-1 cursor-pointer ${isEnglishUI ? 'ml-4' : 'mr-4'}`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">🇮🇱</span>
                      <span className="text-xl">→</span>
                      <span className="text-2xl">🇺🇸</span>
                    </div>
                    <div className="font-semibold text-lg">
                      {isEnglishUI ? "Hebrew to English" : "מעברית לאנגלית"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      אני דובר עברית ורוצה ללמוד אנגלית
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    learningDirection === 'en-he'
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleDirectionChange('en-he')}
                >
                  <RadioGroupItem value="en-he" id="en-he" />
                  <Label htmlFor="en-he" className={`flex-1 cursor-pointer ${isEnglishUI ? 'ml-4' : 'mr-4'}`}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl">🇺🇸</span>
                      <span className="text-xl">→</span>
                      <span className="text-2xl">🇮🇱</span>
                    </div>
                    <div className="font-semibold text-lg">
                      {isEnglishUI ? "English to Hebrew" : "מאנגלית לעברית"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      I speak English and want to learn Hebrew
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Language Level */}
        {step === 2 && (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isEnglishUI ? "What's your language level?" : "מה רמת השפה שלך?"}
              </CardTitle>
              <CardDescription>
                {isEnglishUI ? "This helps us customize content to your level" : "זה יעזור לנו להתאים את התוכן ברמה המתאימה לך"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={level} onValueChange={setLevel}>
                {getLevels().map((lvl) => (
                  <div
                    key={lvl.id}
                    className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 ${
                      level === lvl.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => setLevel(lvl.id)}
                  >
                    <RadioGroupItem value={lvl.id} id={lvl.id} />
                    <Label htmlFor={lvl.id} className={`flex-1 cursor-pointer ${isEnglishUI ? 'ml-3' : 'mr-3'}`}>
                      <div className="font-semibold">{lvl.label}</div>
                      <div className="text-sm text-muted-foreground">{lvl.description}</div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
              <CardTitle className="text-2xl">
                {isEnglishUI ? "What topics interest you?" : "באילו נושאים אתה מתעניין?"}
              </CardTitle>
              <CardDescription>
                {isEnglishUI ? "Choose topics you're interested in (optional)" : "בחר נושאים שמעניינים אותך (אופציונלי)"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {getTopics().map((topic) => (
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
                    <h4 className="font-semibold text-primary">
                      {isEnglishUI ? "30 Days Free Trial!" : "30 ימי ניסיון חינם!"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {isEnglishUI ? "No payment details required. Decide later." : "ללא צורך בפרטי תשלום. תוכל להחליט אחר כך."}
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
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </>
              )}
            </Button>
          ) : (
            <div />
          )}
          
          {step < 3 ? (
            <Button onClick={handleNext} className="gap-2">
              {isEnglishUI ? (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  המשך
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading} className="gap-2">
              {isLoading 
                ? (isEnglishUI ? "Saving..." : "שומר...") 
                : (isEnglishUI ? "Let's Start! 🚀" : "בואו נתחיל! 🚀")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
