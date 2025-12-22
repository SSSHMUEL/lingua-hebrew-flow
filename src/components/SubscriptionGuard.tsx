import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SubscriptionContextType {
  isTrialing: boolean;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

interface SubscriptionData {
  status: string;
  plan: string | null;
  trial_end: string | null;
  current_period_end: string | null;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, plan, trial_end, current_period_end")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching subscription:", error);
    }

    setSubscription(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  const calculateDaysRemaining = () => {
    if (!subscription) return 0;
    
    const endDate = subscription.status === "trialing" 
      ? subscription.trial_end 
      : subscription.current_period_end;
    
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const isTrialing = subscription?.status === "trialing" && calculateDaysRemaining() > 0;
  const isActive = subscription?.status === "active" && calculateDaysRemaining() > 0;
  const isExpired = !isTrialing && !isActive;
  const daysRemaining = calculateDaysRemaining();

  const value: SubscriptionContextType = {
    isTrialing,
    isActive,
    isExpired,
    daysRemaining,
    subscription,
    loading,
    refreshSubscription: fetchSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Component removed - no longer showing subscription banners
export const SubscriptionBanner = () => {
  return null;
};

// HOC to protect routes that require active subscription
export const withSubscription = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: { allowTrial?: boolean }
) => {
  return function WithSubscriptionComponent(props: P) {
    const { isTrialing, isActive, isExpired, loading } = useSubscription();
    const navigate = useNavigate();
    const allowTrial = options?.allowTrial !== false;

    useEffect(() => {
      if (!loading && isExpired) {
        // Redirect to profile for subscription
        navigate("/profile");
      }
    }, [loading, isExpired, navigate]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (isExpired) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};
