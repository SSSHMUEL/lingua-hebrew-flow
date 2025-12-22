import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Home, Download, Heart, LogOut, FlipHorizontal2, User, Menu, CreditCard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserWordsSync } from '@/hooks/use-words';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useUserWordsSync(user?.id);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: t('common.error'),
        description: isRTL ? "לא ניתן להתנתק" : "Could not log out",
        variant: "destructive"
      });
    } else {
      toast({
        title: isRTL ? "הצלחה" : "Success",
        description: isRTL ? "התנתקת בהצלחה" : "Logged out successfully"
      });
      navigate('/');
    }
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <Home className="h-4 w-4" />
        {t('nav.home')}
      </Link>
      <Link to="/learn" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <BookOpen className="h-4 w-4" />
        {t('nav.learn')}
      </Link>
      <Link to="/practice" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <FlipHorizontal2 className="h-4 w-4" />
        {t('nav.practice')}
      </Link>
      <Link to="/learned" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <Heart className="h-4 w-4" />
        {t('nav.learned')}
      </Link>
      <Link to="/profile" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <User className="h-4 w-4" />
        {t('nav.profile')}
      </Link>
      <Link to="/downloads" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <Download className="h-4 w-4" />
        {t('nav.downloads')}
      </Link>
      <Link to="/pricing" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
        <CreditCard className="h-4 w-4" />
        {isRTL ? 'מחירים' : 'Pricing'}
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-card/40 border-b border-border backdrop-blur-md supports-[backdrop-filter]:bg-card/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-6">
                <div className="flex flex-col gap-4">
                  <NavLinks />
                </div>
                
                <div className="border-t pt-6">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <span className="text-sm text-muted-foreground">
                        {isRTL ? 'שלום' : 'Hello'}, {user.user_metadata?.display_name || user.email}
                      </span>
                      <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="outline" className="w-full">
                        <LogOut className="h-4 w-4 mx-2" />
                        {t('nav.logout')}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          {t('nav.login')}
                        </Button>
                      </Link>
                      <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">
                          {t('auth.signup')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-background font-bold text-xl">T</span>
            </div>
            <span className="hidden sm:inline">TALK FIX</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 rtl:space-x-reverse">
            <NavLinks />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3 rtl:space-x-reverse">
            {user ? (
              <div className="hidden sm:flex items-center space-x-3 rtl:space-x-reverse">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'שלום' : 'Hello'}, {user.user_metadata?.display_name || user.email}
                </span>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mx-2" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm">
                    {t('auth.signup')}
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
