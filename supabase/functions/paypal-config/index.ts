import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("PAYPAL_SECRET")?.trim();
    const monthlyPlanId = Deno.env.get("PAYPAL_MONTHLY_PLAN_ID")?.trim();
    const yearlyPlanId = Deno.env.get("PAYPAL_YEARLY_PLAN_ID")?.trim();

    if (!clientId || !clientSecret || !monthlyPlanId || !yearlyPlanId) {
      console.error("Missing PayPal configuration:", {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasMonthly: !!monthlyPlanId,
        hasYearly: !!yearlyPlanId,
      });

      return new Response(
        JSON.stringify({
          error: "PayPal configuration missing",
          missing: {
            PAYPAL_CLIENT_ID: !clientId,
            PAYPAL_SECRET: !clientSecret,
            PAYPAL_MONTHLY_PLAN_ID: !monthlyPlanId,
            PAYPAL_YEARLY_PLAN_ID: !yearlyPlanId,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const basicAuth = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;

    const getToken = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false as const, status: res.status, text };
      }

      const json = await res.json().catch(() => null);
      const accessToken = json?.access_token as string | undefined;
      if (!accessToken) {
        return { ok: false as const, status: 500, text: "Missing access_token" };
      }

      return { ok: true as const, accessToken };
    };

    // Detect environment *strictly* via OAuth so we don't accidentally mix sandbox/live.
    const prod = await getToken("https://api-m.paypal.com");
    const sb = prod.ok ? null : await getToken("https://api-m.sandbox.paypal.com");

    const environment: "sandbox" | "production" = prod.ok ? "production" : sb?.ok ? "sandbox" : "production";

    if (!prod.ok && !sb?.ok) {
      console.error("PayPal OAuth failed in both environments", {
        productionAttempt: prod,
        sandboxAttempt: sb,
      });

      return new Response(
        JSON.stringify({
          error: "PayPal credentials mismatch",
          message:
            "PAYPAL_CLIENT_ID/PAYPAL_SECRET לא תואמים או לא שייכים לאותה סביבה (Sandbox/Production).",
          attempts: {
            production: prod,
            sandbox: sb,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiBase = environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    const accessToken = prod.ok ? prod.accessToken : sb!.accessToken;

    const validatePlan = async (planId: string) => {
      const res = await fetch(`${apiBase}/v1/billing/plans/${encodeURIComponent(planId)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        return { ok: false as const, status: res.status, text };
      }

      const plan = await res.json().catch(() => null);
      return { ok: true as const, plan };
    };

    const monthlyCheck = await validatePlan(monthlyPlanId);
    const yearlyCheck = await validatePlan(yearlyPlanId);

    if (!monthlyCheck.ok || !yearlyCheck.ok) {
      console.error("PayPal plan validation failed", {
        environment,
        monthly: monthlyCheck,
        yearly: yearlyCheck,
      });

      return new Response(
        JSON.stringify({
          error: "PayPal plan not found",
          message:
            "אחד ממזהי התוכניות לא קיים באותה סביבה/חשבון של ה‑Client ID. צור Plans מחדש באותו חשבון ובאותה סביבה.",
          environment,
          monthly: monthlyCheck,
          yearly: yearlyCheck,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("PayPal config loaded successfully", {
      environment,
      monthlyStatus: monthlyCheck.plan?.status,
      yearlyStatus: yearlyCheck.plan?.status,
      monthlyCurrency: monthlyCheck.plan?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.currency_code,
      yearlyCurrency: yearlyCheck.plan?.billing_cycles?.[0]?.pricing_scheme?.fixed_price?.currency_code,
    });

    return new Response(
      JSON.stringify({
        clientId,
        monthlyPlanId,
        yearlyPlanId,
        environment,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
