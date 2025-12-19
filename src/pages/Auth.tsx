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
export const Auth: React.FC = () => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  // Check URL parameters for tab selection
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') === 'signup' ? 'signup' : 'signin';
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
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

      // Create profile for the new user
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
    const {
      error
    } = await supabase.auth.signInWithPassword({
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
      redirectTo: `${window.location.origin}/auth?reset=true`
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
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">ברוכים הבאים לTALK FIX</h1>
          <p className="text-muted-foreground">למדו אנגלית בצורה חכמה ומהנה</p>
        </div>

        <Card className="shadow-lg">
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
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
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-right block">
                      <Mail className="inline h-4 w-4 ml-2" />
                      כתובת אימייל
                    </Label>
                    <Input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required className="text-right" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-right block">
                      <Lock className="inline h-4 w-4 ml-2" />
                      סיסמה
                    </Label>
                    <Input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="הכנס סיסמה" required className="text-right" />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
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
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-right block">
                      <User className="inline h-4 w-4 ml-2" />
                      שם לתצוגה
                    </Label>
                    <Input id="signup-name" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="השם שלך" required className="text-right" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-right block">
                      <Mail className="inline h-4 w-4 ml-2" />
                      כתובת אימייל
                    </Label>
                    <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required className="text-right" dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-right block">
                      <Lock className="inline h-4 w-4 ml-2" />
                      סיסמה
                    </Label>
                    <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="בחר סיסמה חזקה" required className="text-right" minLength={6} />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
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
                      className="text-right" 
                      dir="ltr" 
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
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
    </div>;
};
export default Auth;