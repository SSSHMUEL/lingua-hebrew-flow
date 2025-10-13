import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DAILY_LIMIT = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioBase64, userId } = await req.json();
    
    if (!audioBase64 || !userId) {
      throw new Error('Missing required parameters');
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check usage limit
    const today = new Date().toISOString().split('T')[0];
    
    const { data: usageData, error: usageError } = await supabaseClient
      .from('transcription_usage')
      .select('usage_count')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .maybeSingle();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error checking usage:', usageError);
      throw new Error('Failed to check usage limit');
    }

    const currentUsage = usageData?.usage_count || 0;

    if (currentUsage >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: `הגעת למגבלת השימוש היומית (${DAILY_LIMIT} תמלולים ליום)` }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    
    // Prepare form data for Groq API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'he');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'segment');

    console.log('Calling Groq API for transcription...');

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'מגבלת קצב חריגה, נסה שוב מאוחר יותר' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Groq API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response received');

    // Convert Groq response to SRT format with smart word replacement
    const subtitles = data.segments?.map((segment: any, index: number) => {
      let text = segment.text.trim();
      
      // Replace learned Hebrew words with their English equivalents
      // This is a simple word-by-word replacement
      const words = text.split(' ');
      const processedWords = words.map((word: string) => {
        // Remove punctuation for matching
        const cleanWord = word.replace(/[.,!?;:]/g, '');
        
        // Check if this word is in the learned list (we'll need to check against Hebrew translations)
        // For now, keep all words in Hebrew as the replacement logic will be handled on frontend
        return word;
      });
      
      text = processedWords.join(' ');

      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.end);
      
      return {
        index: index + 1,
        timestamp: startTime,
        endTime: endTime,
        text: text
      };
    }) || [];

    console.log('Generated subtitles:', subtitles.length);

    // Update usage count
    if (usageData) {
      await supabaseClient
        .from('transcription_usage')
        .update({ usage_count: currentUsage + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('usage_date', today);
    } else {
      await supabaseClient
        .from('transcription_usage')
        .insert({ user_id: userId, usage_date: today, usage_count: 1 });
    }

    return new Response(
      JSON.stringify({ subtitles, remainingUsage: DAILY_LIMIT - currentUsage - 1 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribeVideo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}
