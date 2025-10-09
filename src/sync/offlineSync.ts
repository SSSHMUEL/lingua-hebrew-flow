/**
 * Basic offline sync with Supabase
 * העתק קובץ זה ל: src/sync/offlineSync.ts
 */

import { supabase } from '@/integrations/supabase/client';
import { initLocalDB, saveVocabularyRows, popSyncQueue, queueLocalChange } from '@/integrations/sqliteClient';

export async function syncFromRemote(userId: string) {
  await initLocalDB();

  const { data: vocab, error: vErr } = await supabase.from('vocabulary_words').select('*');
  if (vErr) console.warn('syncFromRemote vocabulary error', vErr);
  else if (vocab) await saveVocabularyRows(vocab);

  const { data: learned, error: lErr } = await supabase.from('learned_words').select('*').eq('user_id', userId);
  if (lErr) console.warn('syncFromRemote learned error', lErr);
  else if (learned) {
    for (const row of learned) {
      // שמור ישירות או בתור — כאן נשים בתור (כדי לאפשר push מאוחר יותר)
      await queueLocalChange('learned_words', 'insert', row);
    }
  }
}

export async function pushLocalChanges() {
  const queue = await popSyncQueue();
  for (const q of queue) {
    try {
      if (q.table_name === 'learned_words') {
        if (q.action === 'insert') await supabase.from('learned_words').upsert(q.payload);
        else if (q.action === 'update') await supabase.from('learned_words').update(q.payload).eq('id', q.payload.id);
        else if (q.action === 'delete') await supabase.from('learned_words').delete().eq('id', q.payload.id);
      }
      // הוסף טיפול בטבלאות נוספות לפי הצורך
    } catch (e) {
      console.warn('pushLocalChanges error', e);
      // במקרה של כישלון אפשר להחזיר את הפריט לתור
    }
  }
}