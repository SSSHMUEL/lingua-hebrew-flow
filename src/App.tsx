import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { Navigation } from "@/components/Navigation";
import { SubscriptionProvider, SubscriptionBanner } from "@/components/SubscriptionGuard";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Learn from "./pages/Learn";
import Learned from "./pages/Learned";
import Downloads from "./pages/Downloads";
import About from "./pages/About";
import AISubtitles from "./pages/AISubtitles";
import NotFound from "./pages/NotFound";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import { UserWordsSynchronizer } from "@/components/UserWordsSynchronizer";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isRTL } = useLanguage();
  const location = useLocation();
  
  // Don't show navigation on onboarding page
  const hideNavigation = location.pathname === "/onboarding";
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <SubscriptionBanner />
      {!hideNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/learned" element={<Learned />} />
        <Route path="/downloads" element={<Downloads />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-subtitles" element={<AISubtitles />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SubscriptionProvider>
            <OnboardingGuard>
              <UserWordsSynchronizer />
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </OnboardingGuard>
          </SubscriptionProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
