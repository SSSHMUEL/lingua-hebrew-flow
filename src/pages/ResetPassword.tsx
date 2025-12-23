import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
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
          title: isRTL ? "שגיאה" : "Error",
          description: isRTL ? "קישור לא תקין או שפג תוקפו" : "Invalid or expired link",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };
    
    checkSession();
  }, [navigate, isRTL]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: isRTL ? "הסיסמאות אינן תואמות" : "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: isRTL ? "שגיאה" : "Error",
        description: isRTL ? "הסיסמה חייבת להכיל לפחות 6 תווים" : "Password must be at least 6 characters",
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
        title: isRTL ? "שגיאה" : "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setIsComplete(true);
      toast({
        title: isRTL ? "הצלחה!" : "Success!",
        description: isRTL ? "הסיסמה עודכנה בהצלחה" : "Password updated successfully"
      });
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {isRTL ? "הסיסמה עודכנה!" : "Password Updated!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isRTL ? "הסיסמה החדשה שלך נשמרה בהצלחה" : "Your new password has been saved successfully"}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              {isRTL ? "לדף הבית" : "Go to Home"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isRTL ? "איפוס סיסמה" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? "הכנס את הסיסמה החדשה שלך" : "Enter your new password"}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-right">
              {isRTL ? "סיסמה חדשה" : "New Password"}
            </CardTitle>
            <CardDescription className="text-right">
              {isRTL ? "בחר סיסמה חדשה וחזקה" : "Choose a new strong password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">
                  <Lock className="inline h-4 w-4 ml-2" />
                  {isRTL ? "סיסמה חדשה" : "New Password"}
                </Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder={isRTL ? "הכנס סיסמה חדשה" : "Enter new password"}
                  required 
                  className="text-right" 
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-right block">
                  <Lock className="inline h-4 w-4 ml-2" />
                  {isRTL ? "אישור סיסמה" : "Confirm Password"}
                </Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder={isRTL ? "אשר את הסיסמה" : "Confirm password"}
                  required 
                  className="text-right" 
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (isRTL ? 'שומר...' : 'Saving...') : (isRTL ? 'עדכן סיסמה' : 'Update Password')}
                <ArrowRight className="h-4 w-4 mr-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
