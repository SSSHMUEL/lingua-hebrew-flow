import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let { audienceType, interests, skillLevel } = await req.json();

    if (!audienceType || !interests) {
      return new Response(
        JSON.stringify({ error: 'Missing audienceType or interests' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle both array and comma-separated string
    if (typeof interests === 'string') {
      interests = interests.split(',').map(i => i.trim()).filter(Boolean);
    }

    if (!Array.isArray(interests) || interests.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Interests must be an array or comma-separated string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map CEFR levels to database levels
    const levelMapping: Record<string, string[]> = {
      'Letters': ['basic', 'בסיסי'],
      'A1': ['basic', 'בסיסי'],
      'A2': ['basic', 'intermediate'],
      'B1': ['intermediate'],
      'B2': ['advanced'],
      'C1': ['advanced'],
      'C2': ['advanced'],
    };

    // Fallback if skillLevel is missing but audienceType exists
    const audienceFallback: Record<string, string[]> = {
      'kids': ['basic', 'בסיסי'],
      'students': ['basic', 'intermediate'],
      'business': ['intermediate', 'advanced'],
    };

    const targetLevels = skillLevel ? levelMapping[skillLevel] : audienceFallback[audienceType] || ['basic'];

    // Get words matching the user's interests and appropriate level
    let query = supabase
      .from('vocabulary_words')
      .select('id, category, level')
      .in('category', interests);

    // Optionally filter by level if available in the database
    if (targetLevels && targetLevels.length > 0) {
      query = query.in('level', targetLevels);
    }

    const { data: words, error: wordsError } = await query.limit(100);

    if (wordsError) {
      console.error('Error fetching words:', wordsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch words' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!words || words.length === 0) {
      // If no words found with interests, get general words
      const { data: generalWords, error: generalError } = await supabase
        .from('vocabulary_words')
        .select('id, category, level')
        .limit(50);

      if (generalError || !generalWords) {
        return new Response(
          JSON.stringify({ error: 'No words available' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Use general words
      const userWordRecords = generalWords.slice(0, 50).map(word => ({
        user_id: user.id,
        word_id: word.id,
        status: 'new',
        view_count: 0,
      }));

      const { error: insertError } = await supabase
        .from('user_words')
        .upsert(userWordRecords, { onConflict: 'user_id,word_id' });

      if (insertError) {
        console.error('Error inserting user words:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to populate words' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, wordsAdded: generalWords.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Take top 50 words from the matched categories
    const selectedWords = words.slice(0, 50);

    // Create user_words records
    const userWordRecords = selectedWords.map(word => ({
      user_id: user.id,
      word_id: word.id,
      status: 'new',
      view_count: 0,
    }));

    // Insert into user_words table (upsert to handle duplicates)
    const { error: insertError } = await supabase
      .from('user_words')
      .upsert(userWordRecords, { onConflict: 'user_id,word_id' });

    if (insertError) {
      console.error('Error inserting user words:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to populate words' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        wordsAdded: selectedWords.length,
        categories: [...new Set(selectedWords.map(w => w.category))]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in populate-user-words:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
