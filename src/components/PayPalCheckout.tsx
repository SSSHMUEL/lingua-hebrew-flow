import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/components/SubscriptionGuard";

interface PayPalCheckoutProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: {
          shape?: string;
          color?: string;
          layout?: string;
          label?: string;
        };
        createSubscription: (data: any, actions: any) => Promise<string>;
        onApprove: (data: { subscriptionID: string; orderID?: string }, actions: any) => Promise<void>;
        onError: (err: any) => void;
        onCancel?: () => void;
      }) => {
        render: (container: string | HTMLElement) => Promise<void>;
      };
    };
  }
}

const plans = [
  {
    id: "monthly",
    name: "חודשי",
    nameEn: "Monthly",
    price: "₪9.90",
    period: "לחודש",
    periodEn: "/month",
    features: [
      "גישה לכל המילים והנושאים",
      "כרטיסיות לימוד ללא הגבלה",
      "חידונים ותרגולים",
      "מעקב התקדמות",
    ],
    featuresEn: [
      "Access to all words and topics",
      "Unlimited flashcards",
      "Quizzes and practice",
      "Progress tracking",
    ],
  },
  {
    id: "yearly",
    name: "שנתי",
    nameEn: "Yearly",
    price: "₪99.90",
    period: "לשנה",
    periodEn: "/year",
    popular: true,
    savings: "חסכון של 17%",
    savingsEn: "Save 17%",
    features: [
      "כל הפיצ'רים של החודשי",
      "חסכון משמעותי",
      "עדיפות בתמיכה",
      "גישה לפיצ'רים חדשים ראשונים",
    ],
    featuresEn: [
      "All monthly features",
      "Significant savings",
      "Priority support",
      "Early access to new features",
    ],
  },
];

export const PayPalCheckout = ({ onSuccess }: PayPalCheckoutProps) => {
  const { toast } = useToast();
  const { refreshSubscription, isActive } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState<{
    clientId: string;
    monthlyPlanId: string;
    yearlyPlanId: string;
    environment: 'sandbox' | 'production';
  } | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [buttonsRendered, setButtonsRendered] = useState<Record<string, boolean>>({});

  // Poll for subscription updates after successful checkout
  const pollForSubscriptionUpdate = useCallback(async () => {
    const maxAttempts = 10;
    const pollInterval = 2000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      await refreshSubscription();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data?.status === "active") {
          setShowSuccess(true);
          toast({
            title: "🎉 תודה על הרכישה!",
            description: "המנוי שלך פעיל עכשיו. תהנה מגישה מלאה לכל התכנים!",
          });
          onSuccess?.();
          return true;
        }
      }
    }
    return false;
  }, [refreshSubscription, toast, onSuccess]);

  useEffect(() => {
    const fetchPayPalConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("paypal-config");
        console.log("PayPal config response:", { data, error });
        if (error) throw error;
        if (data) {
          console.log("PayPal config loaded:", {
            clientId: data.clientId ? data.clientId.substring(0, 10) + "..." : "MISSING",
            monthlyPlanId: data.monthlyPlanId || "MISSING",
            yearlyPlanId: data.yearlyPlanId || "MISSING",
            environment: data.environment
          });
          setPaypalConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch PayPal config:", error);
        toast({
          title: "שגיאה",
          description: "לא ניתן לטעון את מערכת התשלומים",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("User loaded:", user?.id || "NO USER");
      if (user) {
        setUserId(user.id);
      }
    };

    fetchPayPalConfig();
    getUser();
  }, [toast]);

  useEffect(() => {
    if (!paypalConfig?.clientId) return;

    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      if (window.paypal) {
        setPaypalLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    const environment = paypalConfig.environment === 'sandbox' ? 'sandbox' : 'live';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.clientId}&vault=true&intent=subscription&currency=ILS`;
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load PayPal SDK");
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את מערכת התשלומים",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script as it might be needed later
    };
  }, [paypalConfig, toast]);

  useEffect(() => {
    // Wait for userId to be available before rendering buttons
    if (!paypalLoaded || !paypalConfig || !window.paypal || !userId) return;

    plans.forEach((plan) => {
      const containerId = `paypal-button-${plan.id}`;
      const container = document.getElementById(containerId);
      
      if (!container || buttonsRendered[plan.id]) return;

      const planId = plan.id === "monthly" 
        ? paypalConfig.monthlyPlanId 
        : paypalConfig.yearlyPlanId;

      // Validate that planId exists
      if (!planId) {
        console.error(`No plan ID found for ${plan.id} plan`);
        return;
      }

      try {
        window.paypal!.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: async (data: any, actions: any) => {
            setSelectedPlan(plan.id);
            console.log("Creating subscription with plan_id:", planId, "custom_id:", userId);
            return actions.subscription.create({
              plan_id: planId,
              custom_id: userId,
            });
          },
          onApprove: async (data: { subscriptionID: string }) => {
            console.log("PayPal subscription approved:", data.subscriptionID);
            
            toast({
              title: "מעבד את התשלום...",
              description: "אנא המתן רגע",
            });

            // Notify our backend about the subscription
            try {
              await supabase.functions.invoke("paypal-webhook", {
                body: {
                  event_type: "BILLING.SUBSCRIPTION.ACTIVATED",
                  resource: {
                    id: data.subscriptionID,
                    custom_id: userId,
                    plan_id: planId,
                  }
                }
              });
            } catch (err) {
              console.error("Error notifying backend:", err);
            }

            await pollForSubscriptionUpdate();
            setSelectedPlan(null);
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            toast({
              title: "שגיאה",
              description: "אירעה שגיאה בתשלום. נסה שוב.",
              variant: "destructive",
            });
            setSelectedPlan(null);
          },
          onCancel: () => {
            setSelectedPlan(null);
          }
        }).render(`#${containerId}`);

        setButtonsRendered(prev => ({ ...prev, [plan.id]: true }));
      } catch (err) {
        console.error("Error rendering PayPal button:", err);
      }
    });
  }, [paypalLoaded, paypalConfig, userId, pollForSubscriptionUpdate, toast, buttonsRendered]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showSuccess || isActive) {
    return (
      <Card className="border-primary bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <PartyPopper className="w-16 h-16 text-primary mb-4" />
          <h3 className="text-2xl font-bold mb-2">תודה על הרכישה! 🎉</h3>
          <p className="text-muted-foreground">
            המנוי שלך פעיל עכשיו. תהנה מגישה מלאה לכל התכנים!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.popular
              ? "border-primary shadow-lg shadow-primary/20"
              : "border-border"
          }`}
        >
          {plan.popular && (
            <Badge className="absolute -top-3 right-4 bg-primary">
              <Sparkles className="w-3 h-3 ml-1" />
              הכי משתלם
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </CardTitle>
            <CardDescription>{plan.name}</CardDescription>
            {plan.savings && (
              <Badge variant="secondary" className="w-fit mt-2">
                {plan.savings}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            {/* PayPal Button Container */}
            <div 
              id={`paypal-button-${plan.id}`} 
              className="min-h-[50px]"
            >
              {!paypalLoaded && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            
            {selectedPlan === plan.id && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                מעבד...
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
