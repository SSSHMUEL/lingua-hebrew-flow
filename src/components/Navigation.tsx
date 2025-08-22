import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Home, Download, Heart, LogOut, FlipHorizontal2, HelpCircle } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להתנתק",
        variant: "destructive"
      });
    } else {
      toast({
        title: "הצלחה",
        description: "התנתקת בהצלחה"
      });
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/40 border-b border-border backdrop-blur-md supports-[backdrop-filter]:bg-card/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <span className="text-background font-bold text-xl">T</span>
              </div>
              TALK FIX
            </Link>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Home className="h-4 w-4" />
                בית
              </Link>
              <Link to="/learn" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <BookOpen className="h-4 w-4" />
                מסלול לימוד
              </Link>
              <Link to="/practice" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <FlipHorizontal2 className="h-4 w-4" />
                תרגול
              </Link>
              <Link to="/profile" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <HelpCircle className="h-4 w-4" />
                פרופיל
              </Link>
              <Link to="/about" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Heart className="h-4 w-4" />
                אודות
              </Link>
              <Link to="/downloads" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <Download className="h-4 w-4" />
                הורדות
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-sm text-muted-foreground">
                  שלום, {user.user_metadata?.display_name || user.email}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 ml-2" />
                  יציאה
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    התחברות
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm">
                    הרשמה
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};