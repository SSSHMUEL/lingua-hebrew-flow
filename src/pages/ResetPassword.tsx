import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: isHebrew ? "שגיאה" : "Error",
          description: isHebrew ? "קישור לא תקין או שפג תוקפו" : "Invalid or expired link",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };

    checkSession();
  }, [navigate, isHebrew]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "הסיסמאות אינן תואמות" : "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: isHebrew ? "הסיסמה חייבת להכיל לפחות 6 תווים" : "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      toast({
        title: isHebrew ? "שגיאה" : "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setIsComplete(true);
      toast({
        title: isHebrew ? "הצלחה!" : "Success!",
        description: isHebrew ? "הסיסמה עודכנה בהצלחה" : "Password updated successfully"
      });
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Fixed background effect - Orange glow on right, Cyan on left */}
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

        <Card className="w-full max-w-md relative z-10 glass-card border-white/10 shadow-2xl">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {isHebrew ? "הסיסמה עודכנה!" : "Password Updated!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isHebrew ? "הסיסמה החדשה שלך נשמרה בהצלחה" : "Your new password has been saved successfully"}
            </p>
            <Button onClick={() => navigate('/')} className="w-full bg-gradient-to-r from-primary to-primary/80 glow-primary rounded-full">
              {isHebrew ? "לדף הבית" : "Go to Home"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Fixed background effect - Orange glow on right, Cyan on left */}
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isHebrew ? "איפוס סיסמה" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {isHebrew ? "הכנס את הסיסמה החדשה שלך" : "Enter your new password"}
          </p>
        </div>

        <Card className="glass-card border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className={isRTL ? 'text-right' : 'text-left'}>
              {isHebrew ? "סיסמה חדשה" : "New Password"}
            </CardTitle>
            <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
              {isHebrew ? "בחר סיסמה חדשה וחזקה" : "Choose a new strong password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className={`block ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Lock className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isHebrew ? "סיסמה חדשה" : "New Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isHebrew ? "הכנס סיסמה חדשה" : "Enter new password"}
                  required
                  className="glass-input border-white/10"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className={`block ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Lock className={`inline h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isHebrew ? "אישור סיסמה" : "Confirm Password"}
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isHebrew ? "אשר את הסיסמה" : "Confirm password"}
                  required
                  className="glass-input border-white/10"
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-primary/80 glow-primary rounded-full mt-4" disabled={loading}>
                {loading ? (isHebrew ? 'שומר...' : 'Saving...') : (isHebrew ? 'עדכן סיסמה' : 'Update Password')}
                {isRTL ? <ArrowRight className="h-4 w-4 mr-2" /> : <ArrowLeft className="h-4 w-4 ml-2" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
