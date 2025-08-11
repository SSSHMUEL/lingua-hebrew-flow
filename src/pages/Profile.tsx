import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learned, setLearned] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = 'פרופיל | TALK FIX';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'פרופיל המשתמש והתקדמות בלמידה');
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    (async () => {
      const { count: learnedCount } = await supabase
        .from('learned_words')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      const { count: totalCount } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });
      setLearned(learnedCount || 0);
      setTotal(totalCount || 0);
    })();
  }, [user, navigate]);

  const percent = total > 0 ? (learned / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">פרופיל משתמש</h1>
        <Card>
          <CardHeader>
            <CardTitle>שלום{user?.email ? `, ${user.email}` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>מילים נלמדו</span>
                <span>{learned} / {total}</span>
              </div>
              <Progress value={percent} className="h-3" />
              <div className="flex gap-3 pt-2">
                <Button onClick={() => navigate('/learn')}>המשך לשיעור</Button>
                <Button variant="outline" onClick={() => navigate('/flashcards')}>לכרטיסיות</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
