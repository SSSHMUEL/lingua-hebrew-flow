import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, paddle-signature",
};

interface PaddleWebhookData {
  event_type: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    custom_data?: {
      userId?: string;
    };
    items?: Array<{
      price: {
        id: string;
        billing_cycle?: {
          interval: string;
          frequency: number;
        };
      };
    }>;
    current_billing_period?: {
      starts_at: string;
      ends_at: string;
    };
    scheduled_change?: {
      action: string;
      effective_at: string;
    } | null;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: PaddleWebhookData = await req.json();
    console.log("Paddle webhook received:", body.event_type);

    const { event_type, data } = body;
    const userId = data.custom_data?.userId;

    if (!userId) {
      console.error("No userId in custom_data");
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    switch (event_type) {
      case "subscription.created":
      case "subscription.activated": {
        const plan = data.items?.[0]?.price?.billing_cycle?.interval === "year" 
          ? "yearly" 
          : "monthly";

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan,
            paddle_subscription_id: data.id,
            paddle_customer_id: data.customer_id,
            current_period_start: data.current_billing_period?.starts_at,
            current_period_end: data.current_billing_period?.ends_at,
            trial_end: null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }
        console.log("Subscription activated for user:", userId);
        break;
      }

      case "subscription.updated": {
        const plan = data.items?.[0]?.price?.billing_cycle?.interval === "year" 
          ? "yearly" 
          : "monthly";

        const updateData: Record<string, any> = {
          status: data.status,
          plan,
          current_period_start: data.current_billing_period?.starts_at,
          current_period_end: data.current_billing_period?.ends_at,
          updated_at: new Date().toISOString(),
        };

        if (data.scheduled_change?.action === "cancel") {
          updateData.cancel_at = data.scheduled_change.effective_at;
        } else {
          updateData.cancel_at = null;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("user_id", userId);

        if (error) {
          console.error("Error updating subscription:", error);
          throw error;
        }
        console.log("Subscription updated for user:", userId);
        break;
      }

      case "subscription.canceled": {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at: data.current_billing_period?.ends_at,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) {
          console.error("Error canceling subscription:", error);
          throw error;
        }
        console.log("Subscription canceled for user:", userId);
        break;
      }

      case "subscription.paused": {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "paused",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) throw error;
        console.log("Subscription paused for user:", userId);
        break;
      }

      case "subscription.resumed": {
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (error) throw error;
        console.log("Subscription resumed for user:", userId);
        break;
      }

      default:
        console.log("Unhandled event type:", event_type);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
