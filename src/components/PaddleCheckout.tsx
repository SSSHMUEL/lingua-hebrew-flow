import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaddleCheckoutProps {
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Paddle?: {
      Initialize: (options: { token: string }) => void;
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

// These will be configured via environment/secrets
const PADDLE_CLIENT_TOKEN = ""; // Will be set when user provides it
const MONTHLY_PRICE_ID = ""; // Will be set when user provides it
const YEARLY_PRICE_ID = ""; // Will be set when user provides it

const plans = [
  {
    id: "monthly",
    name: "חודשי",
    price: "₪9.90",
    period: "לחודש",
    priceId: MONTHLY_PRICE_ID,
    features: [
      "גישה לכל המילים והנושאים",
      "כרטיסיות לימוד ללא הגבלה",
      "חידונים ותרגולים",
      "מעקב התקדמות",
    ],
  },
  {
    id: "yearly",
    name: "שנתי",
    price: "₪99.90",
    period: "לשנה",
    priceId: YEARLY_PRICE_ID,
    popular: true,
    savings: "חסכון של 17%",
    features: [
      "כל הפיצ'רים של החודשי",
      "חסכון משמעותי",
      "עדיפות בתמיכה",
      "גישה לפיצ'רים חדשים ראשונים",
    ],
  },
];

export const PaddleCheckout = ({ onSuccess }: PaddleCheckoutProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isPaddleReady, setIsPaddleReady] = useState(false);

  useEffect(() => {
    // Load Paddle.js
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if (window.Paddle && PADDLE_CLIENT_TOKEN) {
        window.Paddle.Initialize({ token: PADDLE_CLIENT_TOKEN });
        setIsPaddleReady(true);
      }
    };
    document.body.appendChild(script);

    // Get user info
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserId(user.id);
      }
    };
    getUser();

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async (plan: typeof plans[0]) => {
    if (!isPaddleReady || !plan.priceId) {
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
        items: [{ priceId: plan.priceId, quantity: 1 }],
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

  if (!PADDLE_CLIENT_TOKEN || !MONTHLY_PRICE_ID || !YEARLY_PRICE_ID) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">
          מערכת התשלומים תהיה זמינה בקרוב
        </p>
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
              disabled={isLoading !== null}
            >
              {isLoading === plan.id ? "מעבד..." : "בחר תוכנית"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
