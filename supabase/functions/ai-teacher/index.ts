import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, learnedWords, topic } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a dynamic system prompt that incorporates learned words
    const wordsContext = learnedWords && learnedWords.length > 0
      ? `\n\nהמשתמש כבר למד את המילים הבאות באנגלית (עברית -> אנגלית):\n${learnedWords.map((w: { hebrew: string; english: string }) => `- ${w.hebrew} = ${w.english}`).join('\n')}\n\nשלב את המילים האלה בשיחה באופן טבעי. כשאתה משתמש במילה שהמשתמש למד, הדגש אותה בטקסט מודגש (**מילה**).`
      : '';

    const topicContext = topic 
      ? `\n\nהנושא הנוכחי לשיחה: ${topic}`
      : '';

    const systemPrompt = `אתה מורה לאנגלית ידידותי ומעודד בשם "TalkFix Teacher". 
אתה מדבר עברית ועוזר למשתמשים ללמוד אנגלית.

הנחיות:
1. שוחח עם המשתמש בעברית אבל שלב מילים באנגלית שהוא כבר למד
2. כשאתה מציג מילה חדשה באנגלית, תמיד הוסף את התרגום בסוגריים
3. תן משובים חיוביים ומעודדים
4. אם המשתמש טועה, תקן בעדינות והסבר
5. שאל שאלות פתוחות כדי לעודד שיחה
6. התאם את רמת האנגלית לרמת המשתמש
7. השתמש באימוג'ים מדי פעם כדי להפוך את השיחה לנעימה יותר 🎉
${wordsContext}${topicContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "הגעת למגבלת הבקשות, נסה שוב מאוחר יותר." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "נדרש תשלום, אנא הוסף קרדיטים." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "שגיאה בשירות ה-AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ai-teacher error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
