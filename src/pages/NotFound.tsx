import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }} dir={isRTL ? 'rtl' : 'ltr'}>
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

      <div className="text-center relative z-10 glass-card p-12 border-white/10 rounded-3xl shadow-2xl max-w-md w-full">
        <h1 className="text-8xl font-black mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">404</h1>
        <p className="text-2xl font-bold text-foreground mb-2">
          {isHebrew ? "אופס! הדף לא נמצא" : "Oops! Page not found"}
        </p>
        <p className="text-muted-foreground mb-8">
          {isHebrew ? "הדף שחיפשת אינו קיים או שהועבר לכתובת אחרת." : "The page you are looking for doesn't exist or has been moved."}
        </p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-primary to-primary/80 glow-primary rounded-full px-8 py-6 text-lg">
            <Home className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isHebrew ? "חזרה לדף הבית" : "Return to Home"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

