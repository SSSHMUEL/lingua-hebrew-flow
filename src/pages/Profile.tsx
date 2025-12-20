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
import { useLanguage } from '@/contexts/LanguageContext';
import { Settings, Target, Crown, Languages, Sparkles } from 'lucide-react';
import { PaddleCheckout } from '@/components/PaddleCheckout';
import { useSubscription } from '@/components/SubscriptionGuard';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL, setLanguage, language } = useLanguage();
  const navigate = useNavigate();
  const { isTrialing, isActive, isExpired, daysRemaining } = useSubscription();
  const [learned, setLearned] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [englishLevel, setEnglishLevel] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("hebrew");
  const [targetLanguage, setTargetLanguage] = useState("english");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const englishLevels = [
    { id: "beginner", label: t('level.beginner') },
    { id: "elementary", label: t('level.elementary') },
    { id: "intermediate", label: t('level.intermediate') },
    { id: "upper-intermediate", label: t('level.upperIntermediate') },
    { id: "advanced", label: t('level.advanced') },
  ];

  const availableTopics = [
    { id: 'basic', name: isRTL ? 'מילים בסיסיות' : 'Basic Words', description: isRTL ? 'מילים חיוניות לשיחה יומיומית' : 'Essential words for daily conversation' },
    { id: 'business', name: t('topic.business'), description: isRTL ? 'מונחים עסקיים ומקצועיים' : 'Business and professional terms' },
    { id: 'technology', name: t('topic.technology'), description: isRTL ? 'מילים מעולם הטכנולוגיה והמחשבים' : 'Words from the tech world' },
    { id: 'travel', name: t('topic.travel'), description: isRTL ? 'מילים שימושיות לנסיעות בחו"ל' : 'Useful words for travel abroad' },
    { id: 'food', name: t('topic.food'), description: isRTL ? 'מילים הקשורות למזון ובישול' : 'Words related to food and cooking' },
    { id: 'health', name: t('topic.health'), description: isRTL ? 'מונחים רפואיים ובריאותיים' : 'Medical and health terms' },
    { id: 'education', name: t('topic.education'), description: isRTL ? 'מילים הקשורות לחינוך ולמידה' : 'Words related to education and learning' },
    { id: 'entertainment', name: isRTL ? 'בידור' : 'Entertainment', description: isRTL ? 'מילים מעולם הבידור והתרבות' : 'Words from entertainment and culture' }
  ];

  useEffect(() => {
    document.title = isRTL ? 'פרופיל | TALK FIX' : 'Profile | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', isRTL ? 'פרופיל המשתמש והתקדמות בלמידה' : 'User profile and learning progress');
  }, [isRTL]);

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
      
      const { data: preferences } = await supabase
        .from('user_topic_preferences' as any)
        .select('topic_id')
        .eq('user_id', user.id);
      
      if (preferences) {
        setSelectedTopics(preferences.map((p: any) => p.topic_id));
      }
      
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
      await supabase
        .from('user_topic_preferences' as any)
        .delete()
        .eq('user_id', user.id);
      
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
        title: isRTL ? "הצלחה!" : "Success!",
        description: isRTL ? "העדפות הנושאים נשמרו בהצלחה" : "Topic preferences saved successfully",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: t('common.error'),
        description: isRTL ? "לא ניתן לשמור את ההעדפות. נסה שוב." : "Could not save preferences. Try again.",
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
      
      // Update UI language based on source language
      setLanguage(sourceLanguage === 'english' ? 'en' : 'he');
      
      toast({
        title: isRTL ? "הצלחה!" : "Success!",
        description: isRTL ? "הגדרות השפה נשמרו בהצלחה" : "Language settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast({
        title: t('common.error'),
        description: isRTL ? "לא ניתן לשמור את ההגדרות. נסה שוב." : "Could not save settings. Try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      isRTL 
        ? 'האם אתה בטוח שברצונך למחוק את החשבון? פעולה זו בלתי הפיכה ותמחק את כל הנתונים שלך.'
        : 'Are you sure you want to delete your account? This action is irreversible and will delete all your data.'
    );
    
    if (!confirmed) return;
    
    setLoading(true);
    try {
      await supabase.from('learned_words').delete().eq('user_id', user.id);
      await supabase.from('subscriptions' as any).delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('user_id', user.id);
      
      await supabase.auth.signOut();
      
      toast({
        title: isRTL ? "החשבון נמחק" : "Account Deleted",
        description: isRTL ? "להתראות! אנחנו מקווים לראות אותך שוב" : "Goodbye! We hope to see you again",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: t('common.error'),
        description: isRTL ? "לא ניתן למחוק את החשבון. נסה שוב מאוחר יותר." : "Could not delete account. Try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">{t('profile.title')}</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {isRTL ? 'שלום' : 'Hello'}, {user?.user_metadata?.display_name || user?.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t('home.wordsLearned')}</span>
                  <span>{learned} / {total}</span>
                </div>
                <Progress value={percent} className="h-3" />
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => navigate('/learn')}>
                    {isRTL ? 'המשך לשיעור' : 'Continue Lesson'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/practice')}>
                    {t('nav.practice')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Status */}
          <Card className={`shadow-lg ${isExpired ? 'border-destructive' : isTrialing ? 'border-primary' : 'border-green-500'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${isActive ? 'text-green-500' : isTrialing ? 'text-primary' : 'text-destructive'}`} />
                {t('profile.subscription')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{isRTL ? 'סטטוס' : 'Status'}</span>
                  <Badge variant={isActive ? "default" : isTrialing ? "secondary" : "destructive"}>
                    {isActive ? (isRTL ? "פעיל" : "Active") : isTrialing ? (isRTL ? "תקופת ניסיון" : "Trial") : (isRTL ? "לא פעיל" : "Inactive")}
                  </Badge>
                </div>
                {(isTrialing || isActive) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'ימים שנותרו' : 'Days Remaining'}</span>
                    <Badge variant="outline">{daysRemaining}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isRTL ? 'אחוז השלמה' : 'Completion'}</span>
                  <Badge className="bg-primary/20 text-primary">{Math.round(percent)}%</Badge>
                </div>
                
                {(isTrialing || isExpired) && (
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => setShowUpgrade(!showUpgrade)}
                  >
                    <Sparkles className="w-4 h-4" />
                    {showUpgrade ? (isRTL ? "סגור" : "Close") : (isRTL ? "שדרג עכשיו" : "Upgrade Now")}
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
                {isRTL ? 'שדרוג לחשבון פרימיום' : 'Upgrade to Premium'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'בחר את התוכנית המתאימה לך והמשך ללמוד ללא הגבלה' : 'Choose the plan that suits you and continue learning without limits'}
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
              {isRTL ? 'הגדרות שפה ורמה' : 'Language & Level Settings'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'ערוך את הגדרות הלמידה שלך' : 'Edit your learning settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* UI Language Toggle */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                {isRTL ? 'שפת ממשק:' : 'Interface Language:'}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant={language === 'he' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('he')}
                >
                  🇮🇱 עברית
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  🇺🇸 English
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                {isRTL ? 'רמת השפה שלי:' : 'My Language Level:'}
              </Label>
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
                <Label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'שפת מקור:' : 'Source Language:'}
                </Label>
                <RadioGroup value={sourceLanguage} onValueChange={setSourceLanguage} className="flex gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      sourceLanguage === "hebrew" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSourceLanguage("hebrew")}
                  >
                    <span>🇮🇱</span>
                    <span className="text-sm">{isRTL ? 'עברית' : 'Hebrew'}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      sourceLanguage === "english" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSourceLanguage("english")}
                  >
                    <span>🇺🇸</span>
                    <span className="text-sm">{isRTL ? 'אנגלית' : 'English'}</span>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {isRTL ? 'שפת יעד:' : 'Target Language:'}
                </Label>
                <RadioGroup value={targetLanguage} onValueChange={setTargetLanguage} className="flex gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      targetLanguage === "english" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setTargetLanguage("english")}
                  >
                    <span>🇺🇸</span>
                    <span className="text-sm">{isRTL ? 'אנגלית' : 'English'}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                      targetLanguage === "hebrew" ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setTargetLanguage("hebrew")}
                  >
                    <span>🇮🇱</span>
                    <span className="text-sm">{isRTL ? 'עברית' : 'Hebrew'}</span>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <Button onClick={saveLanguageSettings} disabled={loading} size="sm">
              {loading ? (isRTL ? 'שומר...' : 'Saving...') : t('common.save')}
            </Button>
          </CardContent>
        </Card>

        {/* Topic Selection */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {isRTL ? 'בחר נושאי לימוד' : 'Select Learning Topics'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'בחר את הקטגוריות שמעניינות אותך כדי להתמקד בלמידת מילים רלוונטיות' : 'Choose categories that interest you to focus on relevant words'}
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
                {isRTL 
                  ? `נבחרו ${selectedTopics.length} מתוך ${availableTopics.length} נושאים`
                  : `${selectedTopics.length} of ${availableTopics.length} topics selected`}
              </div>
              <Button 
                onClick={saveTopicPreferences} 
                disabled={loading}
                size="sm"
              >
                {loading ? (isRTL ? 'שומר...' : 'Saving...') : (isRTL ? 'שמור העדפות' : 'Save Preferences')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-lg mt-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Settings className="h-5 w-5" />
              {isRTL ? 'אזור מסוכן' : 'Danger Zone'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'פעולות אלו הן בלתי הפיכות. נא להיזהר.' : 'These actions are irreversible. Please be careful.'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <h3 className="font-medium text-destructive mb-2">
                  {isRTL ? 'מחיקת חשבון' : 'Delete Account'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isRTL 
                    ? 'מחיקת החשבון תמחק לצמיתות את כל הנתונים שלך, כולל ההתקדמות והמילים הנלמדות.'
                    : 'Deleting your account will permanently delete all your data, including progress and learned words.'}
                </p>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? (isRTL ? 'מוחק...' : 'Deleting...') : (isRTL ? 'מחק חשבון' : 'Delete Account')}
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
