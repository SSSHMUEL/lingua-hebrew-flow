import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Settings, Target, Crown, Languages, User, Shield, Trash2, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { PayPalCheckout } from '@/components/PayPalCheckout';
import { useSubscription } from '@/components/SubscriptionGuard';
import { Input } from '@/components/ui/input';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { isRTL, setLanguage, language, t } = useLanguage();
  const isHebrew = language === 'he';
  const navigate = useNavigate();
  const { isActive } = useSubscription();
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

  const learningLevels = [
    { id: "letters", label: isHebrew ? "אותיות בלבד" : "Letters Only", icon: "🔤", description: isHebrew ? "לימוד האלפבית" : "Learn the alphabet" },
    { id: "beginner", label: isHebrew ? "מתחיל" : "Beginner", icon: "🌱", description: isHebrew ? "מתחיל ללמוד" : "Just starting" },
    { id: "elementary", label: isHebrew ? "בסיסי" : "Elementary", icon: "📚", description: isHebrew ? "מילים בסיסיות" : "Basic words" },
    { id: "intermediate", label: isHebrew ? "בינוני" : "Intermediate", icon: "💬", description: isHebrew ? "שיחות פשוטות" : "Simple conversations" },
    { id: "advanced", label: isHebrew ? "מתקדם" : "Advanced", icon: "🎓", description: isHebrew ? "רמה גבוהה" : "High proficiency" },
  ];

  const availableTopics = [
    { id: 'basic', name: isHebrew ? 'מילים בסיסיות' : 'Basic Words', description: isHebrew ? 'מילים חיוניות לשיחה יומיומית' : 'Essential words for daily conversation' },
    { id: 'business', name: isHebrew ? 'עסקים' : 'Business', description: isHebrew ? 'מונחים עסקיים ומקצועיים' : 'Business and professional terms' },
    { id: 'technology', name: isHebrew ? 'טכנולוגיה' : 'Technology', description: isHebrew ? 'מילים מעולם הטכנולוגיה והמחשבים' : 'Words from the tech world' },
    { id: 'travel', name: isHebrew ? 'טיולים' : 'Travel', description: isHebrew ? 'מילים שימושיות לנסיעות בחו"ל' : 'Useful words for travel abroad' },
    { id: 'food', name: isHebrew ? 'אוכל' : 'Food', description: isHebrew ? 'מילים הקשורות למזון ובישול' : 'Words related to food and cooking' },
    { id: 'health', name: isHebrew ? 'בריאות' : 'Health', description: isHebrew ? 'מונחים רפואיים ובריאותיים' : 'Medical and health terms' },
    { id: 'education', name: isHebrew ? 'חינוך' : 'Education', description: isHebrew ? 'מילים הקשורות לחינוך ולמידה' : 'Words related to education and learning' },
    { id: 'entertainment', name: isHebrew ? 'בידור' : 'Entertainment', description: isHebrew ? 'מילים מעולם הבידור והתרבות' : 'Words from entertainment and culture' }
  ];

  useEffect(() => {
    document.title = isHebrew ? `פרופיל | TALK FIX` : `Profile | TALK FIX`;
  }, [isHebrew]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

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
        .from('user_topic_preferences')
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
        let level = profile.english_level?.toLowerCase() || "";
        // Normalize 'basic' to 'elementary' to match UI options
        if (level === 'basic') level = 'elementary';

        setEnglishLevel(level);
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
      await supabase.from('user_topic_preferences').delete().eq('user_id', user.id);
      if (selectedTopics.length > 0) {
        const preferences = selectedTopics.map(topicId => ({
          user_id: user.id,
          topic_id: topicId
        }));
        const { error } = await supabase.from('user_topic_preferences').insert(preferences);
        if (error) throw error;
      }
      toast({ title: isHebrew ? "הצלחה!" : "Success!", description: isHebrew ? "העדפות הנושאים נשמרו" : "Topic preferences saved" });
    } catch (error) {
      toast({ title: isHebrew ? "שגיאה" : "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const saveLanguageSettings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        english_level: englishLevel,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }).eq('user_id', user.id);
      if (error) throw error;
      setLanguage(sourceLanguage === 'english' ? 'en' : 'he');
      toast({ title: isHebrew ? "הצלחה!" : "Success!", description: isHebrew ? "ההגדרות נשמרו" : "Settings saved" });
    } catch (error) {
      toast({ title: isHebrew ? "שגיאה" : "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: isHebrew ? "הסיסמאות אינן תואמות" : "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: isHebrew ? "הסיסמה עודכנה" : "Password updated" });
      setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      toast({ title: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(isHebrew ? 'האם למחוק את החשבון?' : 'Delete account?')) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      await supabase.functions.invoke('delete-account', { headers: { Authorization: `Bearer ${sessionData.session?.access_token}` } });
      await supabase.auth.signOut();
      toast({ title: isHebrew ? "החשבון נמחק" : "Account Deleted" });
      navigate('/');
    } catch (error) {
      toast({ title: isHebrew ? "שגיאה" : "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20" style={{ background: 'var(--gradient-hero)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]" style={{ background: 'hsl(25 85% 45% / 0.2)' }} />
        <div className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px]" style={{ background: 'hsl(190 85% 55% / 0.15)' }} />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/15 text-primary border-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-bold">
            <Settings className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('profile.accountManagement')}
          </Badge>
          <h1 className="text-5xl font-black text-foreground tracking-tighter italic">
            {t('profile.title')}
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Access Level Card */}
          <Card className="glass-card overflow-hidden group rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{t('profile.accountLevel')}</p>
                  <h3 className="text-3xl font-black italic tracking-tight">{isActive ? t('profile.premium') : t('profile.inactive')}</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('profile.unlockFeatures')}
                </p>
              </div>

              {!isActive && (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-orange-400 text-white font-bold py-7 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                  onClick={() => navigate('/pricing')}
                >
                  {t('profile.upgradeToPro')} <Crown className={`w-4 h-4 ${isRTL ? 'mr-3' : 'ml-3'}`} />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* User Status Card */}
          <Card className="glass-card group rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">{t('profile.authenticatedUser')}</p>
                  <h3 className="text-3xl font-black italic tracking-tight">{user?.user_metadata?.display_name || 'USERNAME'}</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
              </div>

              <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-4xl font-black italic text-primary">{learned} / {total}</span>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mb-1">{t('profile.wordsLearned')}</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
                  <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(30,144,255,0.5)] transition-all duration-1000" style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="ghost" className="bg-white/5 hover:bg-white/10 text-white font-bold py-6 rounded-2xl border border-white/5" onClick={() => navigate('/practice')}>
                  {t('profile.practice')}
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold py-6 rounded-2xl shadow-lg shadow-primary/20" onClick={() => navigate('/learn')}>
                  {t('profile.continueLearning')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Security Card - Column 2/5 */}
          <Card className="glass-card md:col-span-2 rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black italic tracking-tighter">{t('profile.security')}</h3>
                <Shield className="h-6 w-6 text-orange-400" />
              </div>

              <div className="space-y-4">
                <Button
                  variant="ghost"
                  className="w-full justify-between bg-white/5 hover:bg-white/10 font-bold py-6 rounded-2xl border border-white/5"
                  onClick={() => setShowUpgrade(u => !u)}
                >
                  <span>{t('profile.resetPassword')}</span>
                  <Settings className="h-4 w-4 opacity-40" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-between bg-white/5 hover:bg-white/10 font-bold py-6 rounded-2xl border border-white/5"
                  onClick={handleSignOut}
                >
                  <span>{t('profile.signOut')}</span>
                  <LogOut className="h-4 w-4 opacity-40" />
                </Button>

                <div className="pt-8">
                  <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase">{t('profile.permanentActions')}</p>
                  <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-bold px-0"
                    onClick={handleDeleteAccount}
                  >
                    {t('profile.deleteAccount')} <Trash2 className={`h-4 w-4 ${isRTL ? 'mr-3' : 'ml-3'}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Level Card - Column 3/5 */}
          <Card className="glass-card md:col-span-3 rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-2xl font-black italic tracking-tighter">{t('profile.languageAndLevel')}</h3>
                <Languages className="h-6 w-6 text-primary" />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase">{t('profile.interfaceLanguage')}</p>
                  <div className="flex gap-2">
                    <Button
                      className={`flex-1 font-bold py-4 rounded-xl transition-all ${language === 'he' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-muted-foreground'}`}
                      onClick={() => { setLanguage('he'); setSourceLanguage('hebrew'); }}
                    >
                      עברית
                    </Button>
                    <Button
                      className={`flex-1 font-bold py-4 rounded-xl transition-all ${language === 'en' ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-muted-foreground'}`}
                      onClick={() => { setLanguage('en'); setSourceLanguage('english'); }}
                    >
                      us English
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase">{t('profile.learningLevel')}</p>
                  <div className="flex flex-wrap gap-2">
                    {learningLevels.map(lvl => (
                      <Button
                        key={lvl.id}
                        className={`font-bold px-4 py-2 text-xs rounded-xl transition-all flex items-center gap-2 ${englishLevel === lvl.id ? 'bg-primary text-white' : 'bg-white/5 text-muted-foreground'}`}
                        onClick={() => setEnglishLevel(lvl.id)}
                        title={lvl.description}
                      >
                        <span>{lvl.icon}</span>
                        {lvl.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={saveLanguageSettings} className="w-full mt-10 bg-primary hover:bg-primary/90 text-white font-bold py-7 rounded-2xl shadow-xl shadow-primary/20">
                {t('profile.applySettings')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Learning Interests Card */}
        <Card className="glass-card rounded-[2.5rem]">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black italic tracking-tighter">{t('profile.learningInterests')}</h3>
              <Button
                className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 font-bold px-8 rounded-xl"
                onClick={saveTopicPreferences}
              >
                {t('profile.savePreferences')}
              </Button>
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-10 opacity-70">
              {t('profile.selectCategories')}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {availableTopics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`relative p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group hover:scale-[1.03] ${selectedTopics.includes(topic.id) ? 'border-primary bg-primary/20 shadow-2xl shadow-primary/20' : 'border-white/5 bg-white/5'}`}
                >
                  {selectedTopics.includes(topic.id) && (
                    <div className="absolute top-4 right-4 bg-primary rounded-full p-1 border-2 border-background">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 ${selectedTopics.includes(topic.id) ? 'bg-primary/30 scale-110' : 'bg-white/10 opacity-40'}`}>
                      {topic.id === 'basic' && '⭐'}
                      {topic.id === 'business' && '💼'}
                      {topic.id === 'technology' && '💻'}
                      {topic.id === 'travel' && '✈️'}
                      {topic.id === 'food' && '🍕'}
                      {topic.id === 'health' && '🏥'}
                      {topic.id === 'education' && '📖'}
                      {topic.id === 'entertainment' && '🎬'}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black tracking-tight italic ${selectedTopics.includes(topic.id) ? 'text-white' : 'text-muted-foreground'}`}>{topic.name}</h4>
                      <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mt-1 hidden md:block">
                        {topic.description.split(' ').slice(0, 3).join(' ')}
                      </p>
                    </div>
                  </div>
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
