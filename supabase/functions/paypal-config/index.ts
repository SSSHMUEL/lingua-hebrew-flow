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
    const monthlyPlanId = Deno.env.get("PAYPAL_MONTHLY_PLAN_ID");
    const yearlyPlanId = Deno.env.get("PAYPAL_YEARLY_PLAN_ID");
    
    // Determine environment based on client ID format
    // Sandbox client IDs typically start with "sb-" or contain "sandbox"
    const environment = clientId?.includes("sandbox") || clientId?.startsWith("sb-") 
      ? "sandbox" 
      : "production";

    if (!clientId || !monthlyPlanId || !yearlyPlanId) {
      console.error("Missing PayPal configuration:", { 
        hasClientId: !!clientId, 
        hasMonthly: !!monthlyPlanId, 
        hasYearly: !!yearlyPlanId 
      });
      return new Response(
        JSON.stringify({ error: "PayPal configuration missing" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
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
