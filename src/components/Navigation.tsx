import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, Home, Download, Heart, LogOut, FlipHorizontal2, User, Menu, CreditCard, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserWordsSync } from '@/hooks/use-words';
import logoImage from '@/assets/logo.png';

export const Navigation: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL, language, setLanguage } = useLanguage();
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
      <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <Home className="h-4 w-4" />
        {t('nav.home')}
      </Link>
      <Link to="/learn" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <BookOpen className="h-4 w-4" />
        {t('nav.learn')}
      </Link>
      <Link to="/ai-subtitles" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <Sparkles className="h-4 w-4 text-primary" />
        {isRTL ? 'כתוביות AI' : 'AI Subtitles'}
      </Link>
      <Link to="/practice" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <FlipHorizontal2 className="h-4 w-4" />
        {t('nav.practice')}
      </Link>
      <Link to="/learned" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <Heart className="h-4 w-4" />
        {t('nav.learned')}
      </Link>
      <Link to="/profile" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <User className="h-4 w-4" />
        {t('nav.profile')}
      </Link>
      <Link to="/pricing" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white/5" onClick={() => setIsOpen(false)}>
        <CreditCard className="h-4 w-4" />
        {isRTL ? 'מחירים' : 'Pricing'}
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl" style={{ background: 'linear-gradient(180deg, hsl(222 47% 10% / 0.95) 0%, hsl(222 47% 8% / 0.9) 100%)' }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={logoImage} 
                alt="TalkFix" 
                className="w-10 h-10 rounded-xl shadow-lg transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline tracking-tight">
              TALK<span className="text-primary">FIX</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLinks />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              {language === 'he' ? '🇺🇸' : '🇮🇱'}
            </Button>

            {/* Auth Buttons - Desktop */}
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-sm text-primary font-medium px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  {user.user_metadata?.display_name || user.email?.split('@')[0]}
                </span>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
                  <LogOut className="h-4 w-4 mx-1" />
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? "right" : "left"} className="w-[300px] border-white/10 bg-card/95 backdrop-blur-xl">
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex flex-col gap-2">
                    <NavLinks />
                  </div>
                  
                  <div className="border-t border-white/10 pt-6">
                    {user ? (
                      <div className="flex flex-col gap-4">
                        <span className="text-sm text-primary font-medium">
                          {isRTL ? 'שלום' : 'Hello'}, {user.user_metadata?.display_name || user.email}
                        </span>
                        <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="outline" className="w-full border-white/20 bg-white/5">
                          <LogOut className="h-4 w-4 mx-2" />
                          {t('nav.logout')}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link to="/auth" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full border-white/20 bg-white/5">
                            {t('nav.login')}
                          </Button>
                        </Link>
                        <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            {t('auth.signup')}
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
    </nav>
  );
};
