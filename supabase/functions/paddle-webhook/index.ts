import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

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

// Verify Paddle webhook signature
async function verifySignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse the signature header: ts=timestamp;h1=hash
    const parts = signature.split(";");
    const tsValue = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
    const h1Value = parts.find((p) => p.startsWith("h1="))?.split("=")[1];

    if (!tsValue || !h1Value) {
      console.error("Missing ts or h1 in signature");
      return false;
    }

    // Create the signed payload: timestamp:rawBody
    const signedPayload = `${tsValue}:${rawBody}`;

    // Create HMAC-SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex string
    const computedHash = new TextDecoder().decode(
      hexEncode(new Uint8Array(signatureBytes))
    );

    // Compare signatures
    return computedHash === h1Value;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    console.log("Webhook received, body length:", rawBody.length);

    // Verify signature if secret is configured
    if (webhookSecret) {
      const paddleSignature = req.headers.get("paddle-signature");
      
      if (!paddleSignature) {
        console.error("Missing paddle-signature header");
        return new Response(JSON.stringify({ error: "Missing signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const isValid = await verifySignature(rawBody, paddleSignature, webhookSecret);
      
      if (!isValid) {
        console.error("Invalid signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log("Signature verified successfully");
    } else {
      console.warn("PADDLE_WEBHOOK_SECRET not configured - skipping signature verification");
    }

    const body: PaddleWebhookData = JSON.parse(rawBody);
    console.log("Paddle webhook event:", body.event_type);
    console.log("Event data:", JSON.stringify(body.data, null, 2));

    const { event_type, data } = body;
    const userId = data.custom_data?.userId;

    if (!userId) {
      console.error("No userId in custom_data:", data.custom_data);
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing for user:", userId);

    switch (event_type) {
      case "subscription.created":
      case "subscription.activated": {
        const plan = data.items?.[0]?.price?.billing_cycle?.interval === "year" 
          ? "yearly" 
          : "monthly";

        console.log("Activating subscription - plan:", plan, "subscription_id:", data.id);

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

        console.log("Updating subscription - status:", data.status, "plan:", plan);

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
        console.log("Canceling subscription for user:", userId);
        
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
        console.log("Pausing subscription for user:", userId);
        
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
        console.log("Resuming subscription for user:", userId);
        
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

    return new Response(JSON.stringify({ success: true, event: event_type }), {
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
