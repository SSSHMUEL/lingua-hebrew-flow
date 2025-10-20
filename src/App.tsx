import React from 'react'; // הוספנו את הייבוא הזה
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/AuthProvider"; // הוספנו את useAuth
import { useUserWordsSync } from "@/hooks/use-words"; // הוספנו את ה-Hook שלנו
import { Navigation } from "@/components/Navigation";
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

const queryClient = new QueryClient();

// ================== קומפוננטת הבדיקה שלנו ==================
// היא חיה "בתוך" AuthProvider ולכן יכולה לראות את המשתמש
const DebugComponent = () => {
  // ננסה לקבל את המשתמש ולהפעיל את סנכרון המילים
  const { user } = useAuth();
  useUserWordsSync(user?.id);

  // נציג ריבוע צהוב על המסך כדי לראות מה קורה
  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '10px',
      backgroundColor: 'yellow',
      color: 'black',
      padding: '10px',
      zIndex: 9999,
      border: '2px solid red',
      fontSize: '12px'
    }}>
      DEBUG: User ID is: {user?.id || 'NOT LOGGED IN'}
    </div>
  );
};
// ==========================================================


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      {/* הפעלנו את קומפוננטת הבדיקה שלנו כאן */}
      <DebugComponent />
      
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div dir="rtl" className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/learned" element={<Learned />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/about" element={<About />} />
              <Route path="/ai-subtitles" element={<AISubtitles />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;