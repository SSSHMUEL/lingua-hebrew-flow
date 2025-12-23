import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const Auth: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') === 'signup' ? 'signup' : 'signin';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      }
    });
    
    if (error) {
      toast({
        title: "שגיאת התחברות",
        description: error.message,
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/onboarding`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });
      
      if (error) {
        toast({
          title: "שגיאת הרשמה",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            display_name: displayName,
          });
        
        if (profileError && !profileError.message.includes('duplicate')) {
          console.error('Error creating profile:', profileError);
        }
        
        toast({
          title: "נרשמת בהצלחה! 🎉",
          description: "כעת תעבור למסך ההכרות"
        });
        
        navigate('/onboarding');
      }
    } catch (err: any) {
      toast({
        title: "שגיאה",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) {
      toast({
        title: "שגיאת התחברות",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "התחברת בהצלחה!",
        description: "ברוך השב ללמידת אנגלית"
      });
      navigate('/');
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס כתובת אימייל",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    setLoading(false);
    
    if (error) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "נשלח בהצלחה!",
        description: "בדוק את האימייל שלך לקישור איפוס הסיסמה"
      });
      setResetEmail('');
    }
  };

  const GoogleButton = ({ text }: { text: string }) => (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 glass-button border-white/20"
      onClick={handleGoogleSignIn}
      disabled={googleLoading}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {googleLoading ? 'מתחבר...' : text}
    </Button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right side (weaker than homepage) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.35)' }}
        />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ברוכים הבאים לTALK FIX</h1>
          <p className="text-muted-foreground">למדו אנגלית בצורה חכמה ומהנה</p>
        </div>

        <Card className="glass-card border-white/10">
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="signin">התחברות</TabsTrigger>
              <TabsTrigger value="signup">הרשמה</TabsTrigger>
              <TabsTrigger value="reset">איפוס סיסמה</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="text-right">התחברות לחשבון</CardTitle>
                <CardDescription className="text-right">
                  הכנס את פרטי ההתחברות שלך כדי להמשיך ללמוד
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleButton text="התחבר עם גוגל" />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">או</span>
                  </div>
                </div>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-right block">
                      <Mail className="inline h-4 w-4 ml-2" />
                      כתובת אימייל
                    </Label>
                    <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required className="text-right glass-input border-white/10" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-right block">
                      <Lock className="inline h-4 w-4 ml-2" />
                      סיסמה
                    </Label>
                    <Input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="הכנס סיסמה" required className="text-right glass-input border-white/10" />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 glow-primary" disabled={loading}>
                    {loading ? 'מתחבר...' : 'התחבר'}
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-right">יצירת חשבון חדש</CardTitle>
                <CardDescription className="text-right">
                  הצטרף אלינו והתחל את המסע שלך בלמידת אנגלית
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleButton text="הירשם עם גוגל" />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full bg-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">או</span>
                  </div>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-right block">
                      <User className="inline h-4 w-4 ml-2" />
                      שם לתצוגה
                    </Label>
                    <Input id="signup-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="השם שלך" required className="text-right glass-input border-white/10" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-right block">
                      <Mail className="inline h-4 w-4 ml-2" />
                      כתובת אימייל
                    </Label>
                    <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required className="text-right glass-input border-white/10" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-right block">
                      <Lock className="inline h-4 w-4 ml-2" />
                      סיסמה
                    </Label>
                    <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="בחר סיסמה חזקה" required className="text-right glass-input border-white/10" minLength={6} />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 glow-primary" disabled={loading}>
                    {loading ? 'נרשם...' : 'הירשם'}
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="reset">
              <CardHeader>
                <CardTitle className="text-right">איפוס סיסמה</CardTitle>
                <CardDescription className="text-right">
                  הכנס את כתובת האימייל שלך כדי לקבל קישור לאיפוס סיסמה
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-right block">
                      <Mail className="inline h-4 w-4 ml-2" />
                      כתובת אימייל
                    </Label>
                    <Input 
                      id="reset-email" 
                      type="email" 
                      value={resetEmail} 
                      onChange={(e) => setResetEmail(e.target.value)} 
                      placeholder="your.email@example.com" 
                      required 
                      className="text-right glass-input border-white/10" 
                      dir="ltr" 
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 glow-primary" disabled={loading}>
                    {loading ? 'שולח...' : 'שלח קישור איפוס'}
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          על ידי הרשמה, אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו
        </p>
      </div>
    </div>
  );
};

export default Auth;
