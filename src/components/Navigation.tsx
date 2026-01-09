import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Home, Heart, LogOut, FlipHorizontal2, User, Menu, CreditCard, Sparkles, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserWordsSync } from '@/hooks/use-words';
import { Logo } from '@/components/Logo';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { isRTL, language } = useLanguage();
  const isHebrew = language === 'he';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useUserWordsSync(user?.id);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: isHebrew ? "לא ניתן להתנתק" : "Could not log out",
        variant: "destructive"
      });
    } else {
      toast({
        title: isHebrew ? "הצלחה" : "Success",
        description: isHebrew ? "התנתקת בהצלחה" : "Logged out successfully"
      });
      navigate('/');
    }
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex ${mobile ? 'flex-col gap-2' : 'flex-row items-center gap-1'}`}>
      <Link
        to="/"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <Home className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'בית' : 'Home'}</span>
      </Link>
      <Link
        to="/learn"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <BookOpen className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'למידה' : 'Learn'}</span>
      </Link>
      <Link
        to="/practice"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <FlipHorizontal2 className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'תרגול' : 'Practice'}</span>
      </Link>
      <Link
        to="/ai-subtitles"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm">{isHebrew ? 'כתוביות AI' : 'AI Subtitles'}</span>
      </Link>
      <Link
        to="/learned"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <Heart className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'מילים שלמדתי' : 'Learned Words'}</span>
      </Link>
      <Link
        to="/profile"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <User className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'פרופיל' : 'Profile'}</span>
      </Link>
      <Link
        to="/pricing"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <CreditCard className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'מחירים' : 'Pricing'}</span>
      </Link>
      <Link
        to="/about"
        className={`flex items-center gap-2 text-muted-foreground hover:text-primary transition-all px-3 py-2 rounded-xl hover:bg-white/5 ${mobile ? 'w-full' : ''}`}
        onClick={() => setIsOpen(false)}
      >
        <Info className="h-4 w-4" />
        <span className="font-medium text-sm">{isHebrew ? 'אודות' : 'About'}</span>
      </Link>
    </div>
  );

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-3xl px-4"
      style={{
        background: 'linear-gradient(180deg, hsl(222 47% 12%) 0%, hsl(222 47% 8%) 100%)',
        boxShadow: '0 10px 30px -10px hsl(0 0% 0% / 0.6), inset 0 1px 0 0 hsl(0 0% 100% / 0.05)'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="container mx-auto py-3 sm:py-5">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse lg:flex-row' : ''}`}>
          {/* Mobile: Logo on left, Menu on right (always, regardless of RTL/LTR) */}
          {/* Desktop: Logo on left (LTR) or right (RTL) */}
          <div className="flex items-center order-1 lg:order-none">
            <Link to="/" className="group" aria-label={isHebrew ? "חזרה לדף הבית" : "Return to home page"}>
              <Logo className="transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Navigation - Middle Child -> Center */}
          <div className="hidden lg:flex items-center flex-1 justify-center mx-4">
            <NavLinks />
          </div>

          {/* User Controls + Mobile Menu */}
          <div className="flex items-center gap-3 order-2 lg:order-none">
            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-primary font-bold">
                    {isHebrew ? 'שלום, ' : 'Hello, '}{user.user_metadata?.display_name || user.email?.split('@')[0]}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all"
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                  <span className="font-semibold text-xs">{isHebrew ? 'התנתקות' : 'Logout'}</span>
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-2xl">
                    {isHebrew ? 'התחברות' : 'Login'}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-5 shadow-lg shadow-primary/20 font-bold">
                    {isHebrew ? 'הרשמה' : 'Sign Up'}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Always on the right side */}
            <div className="lg:hidden flex items-center">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground rounded-2xl" aria-label={isHebrew ? "תפריט" : "Menu"}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className="border-white/10 bg-card/95 backdrop-blur-3xl rounded-l-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
                  <div className="flex flex-col gap-8 mt-10">
                    <div className="px-2">
                      <Logo />
                    </div>

                    <NavLinks mobile />

                    <div className="mt-auto pt-10 border-t border-white/10">
                      {user ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 border border-primary/20">
                            <User className="h-5 w-5 text-primary" />
                            <span className="text-base text-primary font-bold">
                              {isHebrew ? 'שלום, ' : 'Hello, '}{user.user_metadata?.display_name || user.email}
                            </span>
                          </div>
                          <Button
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                            variant="destructive"
                            className="w-full rounded-2xl shadow-lg shadow-destructive/20 font-bold py-6"
                          >
                            <LogOut className={`h-5 w-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                            {isHebrew ? 'התנתקות' : 'Logout'}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <Link to="/auth" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full border-white/20 bg-white/5 rounded-2xl py-6 font-bold">
                              {isHebrew ? 'התחברות' : 'Login'}
                            </Button>
                          </Link>
                          <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-primary hover:bg-primary/90 rounded-2xl py-6 font-bold shadow-lg shadow-primary/20">
                              {isHebrew ? 'הרשמה' : 'Sign Up'}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
