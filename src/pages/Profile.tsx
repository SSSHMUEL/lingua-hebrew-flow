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
import { Settings, Target, Crown, Languages, Lock, User, Shield, Trash2, KeyRound, LogOut } from 'lucide-react';
import { PayPalCheckout } from '@/components/PayPalCheckout';
import { useSubscription } from '@/components/SubscriptionGuard';
import { Input } from '@/components/ui/input';

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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isGoogleUser, setIsGoogleUser] = useState(false);

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
    
    // Check if user signed in with Google
    const checkGoogleUser = user.app_metadata?.provider === 'google' || 
                            user.identities?.some(i => i.provider === 'google');
    setIsGoogleUser(checkGoogleUser || false);
    
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

  const handlePasswordUpdate = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: t('common.error'),
        description: isRTL ? "אנא מלא את כל השדות" : "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: isRTL ? "הסיסמאות אינן תואמות" : "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: t('common.error'),
        description: isRTL ? "הסיסמה חייבת להכיל לפחות 6 תווים" : "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: isRTL ? "הצלחה!" : "Success!",
        description: isRTL ? "הסיסמה עודכנה בהצלחה" : "Password updated successfully",
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: t('common.error'),
        description: error.message || (isRTL ? "לא ניתן לעדכן את הסיסמה. נסה שוב." : "Could not update password. Try again."),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Enhanced glowing background effects */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/12 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-primary/8 rounded-full blur-[80px]" />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <Settings className="h-3 w-3 mr-1" />
            {t('profile.accountManagement')}
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">{t('profile.title')}</h1>
        </div>
        
        {/* Top row - 2 cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Subscription Status Card */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{t('profile.accountLevel')}</span>
                <Crown className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{isActive ? t('profile.premium') : t('profile.inactive')}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('profile.unlockFeatures')}
              </p>
              {!isActive && (
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full glow-primary" 
                  onClick={() => setShowUpgrade(!showUpgrade)}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {t('profile.upgradeToPro')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* User Progress Card */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{t('profile.authenticatedUser')}</span>
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{user?.user_metadata?.display_name || user?.email?.split('@')[0]}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl font-bold text-primary">{learned}</span>
                <span className="text-muted-foreground">/ {total}</span>
                <span className="text-sm text-muted-foreground ml-2">{t('profile.wordsLearned')}</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 glass-button border-white/20"
                  onClick={() => navigate('/practice')}
                >
                  {t('profile.practice')}
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                  onClick={() => navigate('/learn')}
                >
                  {t('profile.continueLearning')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Section */}
        {showUpgrade && (
          <Card className="glass-card mb-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                {t('profile.upgradePremium')}
              </CardTitle>
              <CardDescription>
                {t('profile.choosePlan')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayPalCheckout onSuccess={() => {
                setShowUpgrade(false);
                window.location.reload();
              }} />
            </CardContent>
          </Card>
        )}

        {/* Middle row - 2 cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Security Card */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-lg font-semibold">{t('profile.security')}</h3>
                <Shield className="h-5 w-5 text-accent" />
              </div>
              
              <div className="space-y-3">
                {!isGoogleUser && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start glass-button border-white/20"
                    onClick={() => {
                      toast({
                        title: t('profile.resetPassword'),
                        description: isRTL ? "הזן סיסמה חדשה למטה" : "Enter new password below"
                      });
                    }}
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    {t('profile.resetPassword')}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start glass-button border-white/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('profile.signOut')}
                </Button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">{t('profile.permanentActions')}</p>
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('profile.deleteAccount')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Language & Level Card */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <h3 className="text-lg font-semibold">{t('profile.languageAndLevel')}</h3>
                <Languages className="h-5 w-5 text-accent" />
              </div>
              
              {/* UI Language Toggle */}
              <div className="mb-6">
                <Label className="text-xs text-muted-foreground mb-3 block uppercase tracking-wider">
                  {t('profile.interfaceLanguage')}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={language === 'he' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('he')}
                    className={language === 'he' ? 'bg-primary' : 'glass-button border-white/20'}
                  >
                    🇮🇱 עברית
                  </Button>
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLanguage('en')}
                    className={language === 'en' ? 'bg-primary' : 'glass-button border-white/20'}
                  >
                    🇺🇸 English
                  </Button>
                </div>
              </div>

              {/* Level Selection */}
              <div className="mb-6">
                <Label className="text-xs text-muted-foreground mb-3 block uppercase tracking-wider">
                  {t('profile.targetProficiency')}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {englishLevels.map((level) => (
                    <Button
                      key={level.id}
                      variant={englishLevel === level.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEnglishLevel(level.id)}
                      className={englishLevel === level.id 
                        ? 'bg-primary' 
                        : 'glass-button border-white/20'
                      }
                    >
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={saveLanguageSettings}
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                disabled={loading}
              >
                {t('profile.applySettings')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learning Interests Card */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{t('profile.learningInterests')}</h3>
                <Target className="h-5 w-5 text-accent" />
              </div>
              <Button 
                variant="outline"
                onClick={saveTopicPreferences}
                disabled={loading}
                className="glass-button border-white/20"
              >
                {t('profile.savePreferences')}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              {t('profile.selectCategories')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`glass-card rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${
                    selectedTopics.includes(topic.id) 
                      ? 'border-primary/50 bg-primary/10' 
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={selectedTopics.includes(topic.id)}
                      onCheckedChange={() => handleTopicToggle(topic.id)}
                      className="border-white/30"
                    />
                    <span className="text-2xl">
                      {topic.id === 'basic' && '📚'}
                      {topic.id === 'business' && '💼'}
                      {topic.id === 'technology' && '💻'}
                      {topic.id === 'travel' && '✈️'}
                      {topic.id === 'food' && '🍕'}
                      {topic.id === 'health' && '🏥'}
                      {topic.id === 'education' && '📖'}
                      {topic.id === 'entertainment' && '🎬'}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{topic.name}</h4>
                  <p className="text-xs text-muted-foreground">{topic.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
