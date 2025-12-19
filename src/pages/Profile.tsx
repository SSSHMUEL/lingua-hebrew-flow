import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Settings, BookOpen, Target, Crown, Languages, GraduationCap, Sparkles } from 'lucide-react';
import { PaddleCheckout } from '@/components/PaddleCheckout';
import { useSubscription } from '@/components/SubscriptionGuard';

const englishLevels = [
  { id: "beginner", label: "מתחיל" },
  { id: "elementary", label: "בסיסי" },
  { id: "intermediate", label: "בינוני" },
  { id: "upper-intermediate", label: "מתקדם בינוני" },
  { id: "advanced", label: "מתקדם" },
];

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isTrialing, isActive, isExpired, daysRemaining, subscription } = useSubscription();
  const [learned, setLearned] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [englishLevel, setEnglishLevel] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("hebrew");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const availableTopics = [
    { id: 'basic', name: 'מילים בסיסיות', description: 'מילים חיוניות לשיחה יומיומית' },
    { id: 'business', name: 'עסקים', description: 'מונחים עסקיים ומקצועיים' },
    { id: 'technology', name: 'טכנולוגיה', description: 'מילים מעולם הטכנולוגיה והמחשבים' },
    { id: 'travel', name: 'נסיעות', description: 'מילים שימושיות לנסיעות בחו"ל' },
    { id: 'food', name: 'אוכל', description: 'מילים הקשורות למזון ובישול' },
    { id: 'health', name: 'בריאות', description: 'מונחים רפואיים ובריאותיים' },
    { id: 'education', name: 'חינוך', description: 'מילים הקשורות לחינוך ולמידה' },
    { id: 'entertainment', name: 'בידור', description: 'מילים מעולם הבידור והתרבות' }
  ];

  useEffect(() => {
    document.title = 'פרופיל | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'פרופיל המשתמש והתקדמות בלמידה');
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    (async () => {
      const { count: learnedCount } = await supabase
        .from('learned_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const { count: totalCount } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });
      setLearned(learnedCount || 0);
      setTotal(totalCount || 0);
      
      // Load user's topic preferences
      const { data: preferences } = await supabase
        .from('user_topic_preferences' as any)
        .select('topic_id')
        .eq('user_id', user.id);
      
      if (preferences) {
        setSelectedTopics(preferences.map((p: any) => p.topic_id));
      }
      
      // Load user's profile settings
      const { data: profile } = await supabase
        .from('profiles')
        .select('english_level, source_language, target_language')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setEnglishLevel(profile.english_level || "");
        setSourceLanguage(profile.source_language || "hebrew");
        setTargetLanguage(profile.target_language || "english");
      }
    })();
  }, [user, navigate]);

  const percent = total > 0 ? (learned / total) * 100 : 0;

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const saveTopicPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First, delete all existing preferences
      await supabase
        .from('user_topic_preferences' as any)
        .delete()
        .eq('user_id', user.id);
      
      // Then insert the new selected topics
      if (selectedTopics.length > 0) {
        const preferences = selectedTopics.map(topicId => ({
          user_id: user.id,
          topic_id: topicId
        }));
        
        const { error } = await supabase
          .from('user_topic_preferences' as any)
          .insert(preferences);
        
        if (error) throw error;
      }
      
      toast({
        title: "הצלחה!",
        description: "העדפות הנושאים נשמרו בהצלחה",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההעדפות. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveLanguageSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          english_level: englishLevel,
          source_language: sourceLanguage,
          target_language: targetLanguage,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "הצלחה!",
        description: "הגדרות השפה נשמרו בהצלחה",
      });
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההגדרות. נסה שוב.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו בלתי הפיכה ותמחק את כל הנתונים שלך.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    try {
      // Delete user's data
      await supabase.from('learned_words').delete().eq('user_id', user.id);
      await supabase.from('subscriptions' as any).delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      // Sign out the user (admin delete requires server-side)
      await supabase.auth.signOut();
      
      toast({
        title: "החשבון נמחק",
        description: "להתראות! אנחנו מקווים לראות אותך שוב",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את החשבון. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">פרופיל משתמש</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                שלום, {user?.user_metadata?.display_name || user?.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>מילים נלמדו</span>
                  <span>{learned} / {total}</span>
                </div>
                <Progress value={percent} className="h-3" />
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => navigate('/learn')}>המשך לשיעור</Button>
                  <Button variant="outline" onClick={() => navigate('/practice')}>תרגול</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Subscription Status */}
          <Card className={`shadow-lg ${isExpired ? 'border-destructive' : isTrialing ? 'border-primary' : 'border-green-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${isActive ? 'text-green-500' : isTrialing ? 'text-primary' : 'text-destructive'}`} />
                סטטוס מנוי
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">סטטוס</span>
                  <Badge variant={isActive ? "default" : isTrialing ? "secondary" : "destructive"}>
                    {isActive ? "פעיל" : isTrialing ? "תקופת ניסיון" : "לא פעיל"}
                  </Badge>
                </div>
                {(isTrialing || isActive) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ימים שנותרו</span>
                    <Badge variant="outline">{daysRemaining}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אחוז השלמה</span>
                  <Badge className="bg-primary/20 text-primary">{Math.round(percent)}%</Badge>
                </div>
                
                {(isTrialing || isExpired) && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => setShowUpgrade(!showUpgrade)}
                  >
                    <Sparkles className="w-4 h-4" />
                    {showUpgrade ? "סגור" : "שדרג עכשיו"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Section */}
        {showUpgrade && (
          <Card className="shadow-lg mt-6 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                שדרוג לחשבון פרימיום
              </CardTitle>
              <CardDescription>
                בחר את התוכנית המתאימה לך והמשך ללמוד ללא הגבלה
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaddleCheckout onSuccess={() => {
                setShowUpgrade(false);
                window.location.reload();
              }} />
            </CardContent>
          </Card>
        )}

        {/* Language Settings */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              הגדרות שפה ורמה
            </CardTitle>
            <CardDescription>
              ערוך את הגדרות הלמידה שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">רמת האנגלית שלי:</Label>
              <RadioGroup value={englishLevel} onValueChange={setEnglishLevel} className="flex flex-wrap gap-2">
                {englishLevels.map((level) => (
                  <div
                    key={level.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                      englishLevel === level.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setEnglishLevel(level.id)}
                  >
                    <RadioGroupItem value={level.id} id={`level-${level.id}`} className="sr-only" />
                    <Label htmlFor={`level-${level.id}`} className="cursor-pointer text-sm">{level.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">שפת מקור:</Label>
                <RadioGroup value={sourceLanguage} onValueChange={setSourceLanguage} className="flex gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      sourceLanguage === "hebrew" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSourceLanguage("hebrew")}
                  >
                    <span>🇮🇱</span>
                    <span className="text-sm">עברית</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      sourceLanguage === "english" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSourceLanguage("english")}
                  >
                    <span>🇺🇸</span>
                    <span className="text-sm">אנגלית</span>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">שפת יעד:</Label>
                <RadioGroup value={targetLanguage} onValueChange={setTargetLanguage} className="flex gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      targetLanguage === "english" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setTargetLanguage("english")}
                  >
                    <span>🇺🇸</span>
                    <span className="text-sm">אנגלית</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      targetLanguage === "hebrew" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setTargetLanguage("hebrew")}
                  >
                    <span>🇮🇱</span>
                    <span className="text-sm">עברית</span>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Button onClick={saveLanguageSettings} disabled={loading} size="sm">
              {loading ? 'שומר...' : 'שמור הגדרות'}
            </Button>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              בחר נושאי לימוד
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              בחר את הקטגוריות שמעניינות אותך כדי להתמקד בלמידת מילים רלוונטיות
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {availableTopics.map((topic) => (
                <div key={topic.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={topic.id} className="text-sm font-medium cursor-pointer">
                      {topic.name}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                נבחרו {selectedTopics.length} מתוך {availableTopics.length} נושאים
              </div>
              <Button 
                onClick={saveTopicPreferences} 
                disabled={loading}
                size="sm"
              >
                {loading ? 'שומר...' : 'שמור העדפות'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-lg mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Settings className="h-5 w-5" />
              אזור מסוכן
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              פעולות אלו הן בלתי הפיכות. נא להיזהר.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <h3 className="font-medium text-destructive mb-2">מחיקת חשבון</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  מחיקת החשבון תמחק לצמיתות את כל הנתונים שלך, כולל ההתקדמות והמילים הנלמדות.
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'מוחק...' : 'מחק חשבון'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
