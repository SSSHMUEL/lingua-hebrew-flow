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
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_SECRET");
    const monthlyPlanId = Deno.env.get("PAYPAL_MONTHLY_PLAN_ID");
    const yearlyPlanId = Deno.env.get("PAYPAL_YEARLY_PLAN_ID");

    if (!clientId || !monthlyPlanId || !yearlyPlanId) {
      console.error("Missing PayPal configuration:", {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasMonthly: !!monthlyPlanId,
        hasYearly: !!yearlyPlanId,
      });
      return new Response(JSON.stringify({ error: "PayPal configuration missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Detect environment reliably by attempting to fetch an OAuth token.
    // This prevents common sandbox/live mismatches that cause the PayPal popup to open and immediately close.
    let environment: "sandbox" | "production" = "production";

    const heuristicEnv = (): "sandbox" | "production" => {
      // NOTE: client IDs do not always include "sb-" even in sandbox, so this is only a fallback.
      return clientId.includes("sandbox") || clientId.startsWith("sb-") ? "sandbox" : "production";
    };

    const tryGetToken = async (baseUrl: string) => {
      if (!clientSecret) {
        return { ok: false as const, status: 0, text: "Missing PAYPAL_SECRET" };
      }

      const auth = `Basic ${btoa(`${clientId}:${clientSecret}`)}`;

      const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (res.ok) return { ok: true as const };
      const text = await res.text().catch(() => "");
      return { ok: false as const, status: res.status, text };
    };

    // Try production first, then sandbox.
    const prod = await tryGetToken("https://api-m.paypal.com");
    if (prod.ok) {
      environment = "production";
    } else {
      const sb = await tryGetToken("https://api-m.sandbox.paypal.com");
      if (sb.ok) {
        environment = "sandbox";
      } else {
        environment = heuristicEnv();
        console.warn("Could not detect PayPal env via OAuth; falling back to heuristic.", {
          productionAttempt: prod,
          sandboxAttempt: sb,
          chosen: environment,
        });
      }
    }

    console.log("PayPal config loaded successfully, environment:", environment);

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
