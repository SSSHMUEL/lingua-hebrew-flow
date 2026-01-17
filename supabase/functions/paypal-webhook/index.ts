import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("PayPal webhook received:", JSON.stringify(body, null, 2));

    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      console.error("Invalid webhook payload");
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscriptionId = resource.id;
    const customId = resource.custom_id; // This is the user_id we passed
    const planId = resource.plan_id;

    console.log("Processing event:", eventType, "for user:", customId, "subscription:", subscriptionId);

    // Calculate period dates
    const now = new Date();
    let periodEnd: Date;
    let plan: string;

    // Determine if it's monthly or yearly based on plan
    const monthlyPlanId = Deno.env.get("PAYPAL_MONTHLY_PLAN_ID");
    const yearlyPlanId = Deno.env.get("PAYPAL_YEARLY_PLAN_ID");

    if (planId === yearlyPlanId) {
      periodEnd = new Date(now);
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      plan = "yearly";
    } else {
      periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      plan = "monthly";
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.CREATED": {
        if (!customId) {
          console.error("No custom_id (user_id) in subscription");
          return new Response(
            JSON.stringify({ error: "Missing user ID" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            plan: plan,
            paddle_subscription_id: subscriptionId, // Reusing the paddle column for PayPal
            paddle_customer_id: customId,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            trial_end: null, // End trial when subscription starts
            updated_at: now.toISOString(),
          })
          .eq("user_id", customId);

        if (error) {
          console.error("Error updating subscription:", error);
          return new Response(
            JSON.stringify({ error: "Failed to update subscription" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        console.log("Subscription activated for user:", customId);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        // Find user by subscription ID
        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("paddle_subscription_id", subscriptionId)
          .single();

        if (subscription) {
          await supabase
            .from("subscriptions")
            .update({
              status: eventType === "BILLING.SUBSCRIPTION.CANCELLED" ? "cancelled" : "suspended",
              cancel_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("user_id", subscription.user_id);

          console.log("Subscription cancelled/suspended for user:", subscription.user_id);
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Recurring payment completed - extend the subscription
        const billingAgreementId = resource.billing_agreement_id;

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("user_id, plan")
          .eq("paddle_subscription_id", billingAgreementId)
          .single();

        if (subscription) {
          const newPeriodEnd = new Date(now);
          if (subscription.plan === "yearly") {
            newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
          } else {
            newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
          }

          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              current_period_start: now.toISOString(),
              current_period_end: newPeriodEnd.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("user_id", subscription.user_id);

          console.log("Payment completed, subscription extended for user:", subscription.user_id);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook error:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
