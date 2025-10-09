import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoBase64, userId } = await req.json();
    
    if (!videoBase64 || !userId) {
      throw new Error('Missing required parameters');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get user's learned words
    const { data: learnedWords, error: learnedError } = await supabaseClient
      .from('learned_words')
      .select(`
        vocabulary_words (
          english_word
        )
      `)
      .eq('user_id', userId);

    if (learnedError) {
      console.error('Error fetching learned words:', learnedError);
    }

    const learnedEnglishWords = learnedWords?.map(
      lw => (lw as any).vocabulary_words?.english_word
    ).filter(Boolean) || [];

    console.log('Learned words:', learnedEnglishWords);

    // Call Gemini to generate subtitles
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a subtitle generator. Generate Hebrew subtitles for the video with timestamps.
CRITICAL RULES:
1. Translate everything to Hebrew EXCEPT these specific English words: ${learnedEnglishWords.join(', ')}
2. Keep these learned words in English to help the user practice them
3. Format: [timestamp] subtitle text
4. Timestamps format: [MM:SS] or [HH:MM:SS]
5. Each subtitle should be 1-2 lines maximum
6. Return a JSON array with format: [{"timestamp": "00:05", "text": "subtitle in Hebrew with learned words in English"}]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate Hebrew subtitles for this video. Keep the learned English words in English.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:video/mp4;base64,${videoBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'מגבלת קצב חריגה, נסה שוב מאוחר יותר' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'נדרש תשלום, אנא הוסף יתרה לחשבון Lovable AI שלך' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const data = await response.json();
    const subtitlesText = data.choices[0].message.content;
    
    console.log('Generated subtitles:', subtitlesText);

    // Try to parse as JSON, fallback to text parsing
    let subtitles;
    try {
      subtitles = JSON.parse(subtitlesText);
    } catch {
      // Parse text format [timestamp] text
      const lines = subtitlesText.split('\n').filter((line: string) => line.trim());
      subtitles = lines.map((line: string) => {
        const match = line.match(/\[([\d:]+)\]\s*(.+)/);
        if (match) {
          return { timestamp: match[1], text: match[2] };
        }
        return null;
      }).filter(Boolean);
    }

    return new Response(
      JSON.stringify({ subtitles }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-subtitles function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
