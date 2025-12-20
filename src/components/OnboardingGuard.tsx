import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  // Routes that should be accessible without completing onboarding
  const exemptRoutes = ["/auth", "/onboarding"];

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking onboarding status:", error);
        }

        // If no profile exists or onboarding not completed, redirect to onboarding
        const completed = profile?.onboarding_completed === true;
        setOnboardingCompleted(completed);

        // If onboarding is not completed and user is not on an exempt route, redirect to onboarding
        if (!completed && !exemptRoutes.includes(location.pathname)) {
          navigate("/onboarding", { replace: true });
        }
      } catch (err) {
        console.error("Error checking onboarding:", err);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, location.pathname, navigate]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newProfile = payload.new as { onboarding_completed: boolean };
          setOnboardingCompleted(newProfile.onboarding_completed);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Show loading while checking
  if (authLoading || (user && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};
