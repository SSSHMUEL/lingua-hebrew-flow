import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaddleCheckoutProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string; environment?: string }) => void;
      Checkout: {
        open: (options: {
          items: Array<{ priceId: string; quantity: number }>;
          customer?: { email: string };
          customData?: Record<string, string>;
          successCallback?: (data: any) => void;
          closeCallback?: () => void;
        }) => void;
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
    priceIdKey: "PADDLE_MONTHLY_PRICE_ID",
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
    priceIdKey: "PADDLE_YEARLY_PRICE_ID",
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

export const PaddleCheckout = ({ onSuccess }: PaddleCheckoutProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isPaddleReady, setIsPaddleReady] = useState(false);
  const [paddleConfig, setPaddleConfig] = useState<{
    clientToken: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  } | null>(null);

  useEffect(() => {
    // Fetch Paddle configuration from edge function
    const fetchPaddleConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("paddle-config");
        if (error) throw error;
        if (data) {
          setPaddleConfig(data);
        }
      } catch (error) {
        console.error("Failed to fetch Paddle config:", error);
      }
    };

    fetchPaddleConfig();

    // Get user info
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!paddleConfig?.clientToken) return;

    // Load Paddle.js
    const existingScript = document.querySelector('script[src*="paddle.js"]');
    if (existingScript) {
      if (window.Paddle) {
        window.Paddle.Initialize({ token: paddleConfig.clientToken });
        setIsPaddleReady(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle && paddleConfig.clientToken) {
        window.Paddle.Initialize({ token: paddleConfig.clientToken });
        setIsPaddleReady(true);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script as it might be needed later
    };
  }, [paddleConfig]);

  const getPriceId = (plan: typeof plans[0]) => {
    if (!paddleConfig) return null;
    return plan.id === "monthly" 
      ? paddleConfig.monthlyPriceId 
      : paddleConfig.yearlyPriceId;
  };

  const handleCheckout = async (plan: typeof plans[0]) => {
    const priceId = getPriceId(plan);
    
    if (!isPaddleReady || !priceId) {
      toast({
        title: "שגיאה",
        description: "מערכת התשלומים לא זמינה כרגע. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(plan.id);

    try {
      window.Paddle?.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: userEmail },
        customData: { userId },
        successCallback: async (data) => {
          toast({
            title: "תודה על הרכישה! 🎉",
            description: "המנוי שלך פעיל עכשיו",
          });
          onSuccess?.();
        },
        closeCallback: () => {
          setIsLoading(null);
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בפתיחת חלון התשלום",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  if (!paddleConfig) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
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
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              onClick={() => handleCheckout(plan)}
              disabled={isLoading !== null || !isPaddleReady}
            >
              {isLoading === plan.id ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  מעבד...
                </>
              ) : (
                "בחר תוכנית"
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
