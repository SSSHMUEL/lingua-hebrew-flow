-- Enable RLS on backup tables that were flagged
ALTER TABLE public.profiles_backup_today ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.words_backup_today ENABLE ROW LEVEL SECURITY;

-- Deny all access to backup tables (they're just for backup purposes)
CREATE POLICY "No public access to profiles backup"
ON public.profiles_backup_today
FOR ALL
USING (false);

CREATE POLICY "No public access to words backup"
ON public.words_backup_today
FOR ALL
USING (false);