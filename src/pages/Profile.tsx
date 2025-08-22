import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Settings, BookOpen, Target } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [learned, setLearned] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableTopics = [
    { id: 'basic', name: 'מילים בסיסיות', description: 'מילים חיוניות לשיחה יומיומית' },
    { id: 'business', name: 'עסקים', description: 'מונחים עסקיים ומקצועיים' },
    { id: 'technology', name: 'טכנולוגיה', description: 'מילים מעולם הטכנולוגיה והמחשבים' },
    { id: 'travel', name: 'נסיעות', description: 'מילים שימושיות לנסיעות בחו"ל' },
    { id: 'food', name: 'אוכל', description: 'מילים הקשורות למזון ובישול' },
    { id: 'health', name: 'בריאות', description: 'מונחים רפואיים ובריאותיים' },
    { id: 'education', name: 'חינוך', description: 'מילים הקשורות לחינוך ולמידה' },
    { id: 'entertainment', name: 'בידור', description: 'מילים מעולם הבידור והתרבות' }
  ];

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

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const saveTopicPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Here you would save to a user preferences table
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You can add logic here to save selectedTopics to the database
      console.log('Selected topics:', selectedTopics);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">פרופיל משתמש</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                שלום, {user?.user_metadata?.display_name || user?.email}
              </CardTitle>
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
                  <Button variant="outline" onClick={() => navigate('/practice')}>תרגול</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                סטטיסטיקות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">אחוז השלמה</span>
                  <Badge variant="secondary">{Math.round(percent)}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">נושאים נבחרים</span>
                  <Badge variant="outline">{selectedTopics.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">מילים זמינות</span>
                  <Badge className="bg-primary/20 text-primary">{total}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Selection */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              בחר נושאי לימוד
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              בחר את הקטגוריות שמעניינות אותך כדי להתמקד בלמידת מילים רלוונטיות
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {availableTopics.map((topic) => (
                <div key={topic.id} className="flex items-start space-x-3 rtl:space-x-reverse">
                  <Checkbox
                    id={topic.id}
                    checked={selectedTopics.includes(topic.id)}
                    onCheckedChange={() => handleTopicToggle(topic.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor={topic.id} className="text-sm font-medium cursor-pointer">
                      {topic.name}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {topic.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                נבחרו {selectedTopics.length} מתוך {availableTopics.length} נושאים
              </div>
              <Button 
                onClick={saveTopicPreferences} 
                disabled={loading}
                size="sm"
              >
                {loading ? 'שומר...' : 'שמור העדפות'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
