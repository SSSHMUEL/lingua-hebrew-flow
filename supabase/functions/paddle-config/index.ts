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
    const clientToken = Deno.env.get("PADDLE_CLIENT_TOKEN");
    const monthlyPriceId = Deno.env.get("PADDLE_MONTHLY_PRICE_ID");
    const yearlyPriceId = Deno.env.get("PADDLE_YEARLY_PRICE_ID");

    if (!clientToken || !monthlyPriceId || !yearlyPriceId) {
      return new Response(
        JSON.stringify({ error: "Paddle configuration missing" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        clientToken,
        monthlyPriceId,
        yearlyPriceId,
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
