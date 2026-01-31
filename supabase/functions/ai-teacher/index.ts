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
    const { messages, learnedWords, userTopics, isIntroduction } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build learned words context - emphasize using these words
    const wordsContext = learnedWords && learnedWords.length > 0
      ? `\n\n📚 **המילים שהמשתמש כבר למד (חובה לשלב בשיחה!):**\n${learnedWords.map((w: { hebrew: string; english: string }) => `• ${w.hebrew} = **${w.english}**`).join('\n')}\n\n⚠️ חשוב מאוד: שלב כמה שיותר מהמילים האלה בכל תשובה! כשאתה משתמש במילה שהמשתמש למד, כתוב אותה באנגלית מודגשת (**word**) והוסף את ההקשר בעברית.`
      : '\n\n📝 המשתמש עדיין לא למד מילים. התחל ללמד אותו מילים בסיסיות.';

    // Build topics context from user preferences
    const topicsContext = userTopics && userTopics.length > 0
      ? `\n\n🎯 **נושאים שמעניינים את המשתמש:** ${userTopics.join(', ')}\nהתמקד בנושאים האלה בשיחה ובדוגמאות שאתה נותן.`
      : '';

    // Special introduction prompt
    const introductionInstructions = isIntroduction
      ? `\n\n🌟 **זו ההודעה הראשונה - הצג את עצמך!**
בהודעה הזו עליך:
1. להציג את עצמך בקצרה כמורה TalkFix
2. להסביר איך אתה עובד (משלב מילים שהמשתמש למד בשיחה)
3. להציע נושא לשיחה מהנושאים שמעניינים את המשתמש
4. לשאול שאלה פתוחה כדי להתחיל
5. אם יש מילים שהמשתמש למד, תן דוגמה קצרה לאיך אתה משלב אותן`
      : '';

    const systemPrompt = `אתה מורה לאנגלית ידידותי, מעודד ואינטראקטיבי בשם "TalkFix Teacher" 🎓

🎯 **המטרה שלך:** לעזור למשתמש לתרגל אנגלית דרך שיחה טבעית תוך שילוב המילים שהוא כבר למד.

📋 **הנחיות חשובות:**
1. **שלב את המילים שהמשתמש למד!** - זו העדיפות הראשונה. בכל תשובה, נסה להשתמש לפחות ב-2-3 מילים מהרשימה
2. דבר עברית אבל שלב מילים באנגלית באופן טבעי
3. כשאתה משתמש במילה נלמדת, כתוב אותה כך: **English** (עברית)
4. תן משובים חיוביים ומעודדים 🎉
5. אם המשתמש טועה, תקן בעדינות והסבר
6. שאל שאלות פתוחות לעידוד שיחה
7. השתמש באימוג'ים למעורבות

💡 **דוגמה לשימוש נכון במילים נלמדות:**
אם המשתמש למד "בית = house" ו"לאכול = eat", תגיד:
"היום נדבר על מה קורה ב-**house** (בית) שלך! מה אתה אוהב לעשות כשאתה חוזר **home** (הביתה)? אולי אתה אוהב ל-**eat** (לאכול) משהו טעים? 🍕"
${wordsContext}${topicsContext}${introductionInstructions}`;

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
