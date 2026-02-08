import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Sparkles,
    Lightbulb,
    ArrowRight,
    Trophy,
    History,
    Info
} from 'lucide-react';

interface UserInflection {
    user_word_id: string;
    user_id: string;
    status: string;
    flexi_practiced_at?: string;
    word_id: string;
    root_word: string;
    root_translation: string;
    example_sentence: string;
    inflected_word: string;
    inflected_translation: string;
    grammar_note: string;
}

const FlexiWord: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isRTL } = useLanguage();

    const [inflections, setInflections] = useState<UserInflection[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ practiced: 0, total: 0 });
    const [showHint, setShowHint] = useState(false);

    const current = inflections[currentIndex];

    useEffect(() => {
        document.title = isRTL ? 'FlexiWord - אימון הטיות | TALK FIX' : 'FlexiWord - Inflection Practice | TALK FIX';
    }, [isRTL]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);

        // Fetch user inflections from the view
        const { data, error } = await supabase
            .from('v_user_inflections' as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'learned');

        if (error) {
            console.error('Error fetching inflections:', error);
            toast({
                title: isRTL ? 'שגיאה' : 'Error',
                description: isRTL ? 'טעינת הנתונים נכשלה' : 'Failed to load data',
                variant: 'destructive'
            });
        } else {
            const fetchedInflections = (data as unknown) as UserInflection[];
            const shuffled = [...fetchedInflections].sort(() => Math.random() - 0.5);
            setInflections(shuffled);

            const totalUniqueWords = new Set(fetchedInflections.map(i => i.user_word_id)).size;
            const practicedUniqueWords = new Set(fetchedInflections.filter(i => i.flexi_practiced_at).map(i => i.user_word_id)).size;

            setStats({
                practiced: practicedUniqueWords,
                total: totalUniqueWords
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        fetchData();
    }, [user]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!current || showFeedback) return;

        const isCorrect = userInput.trim().toLowerCase() === current.inflected_word.toLowerCase();

        if (isCorrect) {
            setShowFeedback('correct');
            // Update DB
            await supabase.from('user_words').update({
                flexi_practiced_at: new Date().toISOString(),
                flexi_correct_count: (current as any).flexi_correct_count + 1 || 1,
                updated_at: new Date().toISOString()
            } as any).eq('id', current.user_word_id);

            // Update local stats if this was a first-time practice for this word
            if (!current.flexi_practiced_at) {
                setStats(s => ({ ...s, practiced: s.practiced + 1 }));
            }
        } else {
            setShowFeedback('incorrect');
        }
    };

    const nextQuestion = () => {
        setShowFeedback(null);
        setUserInput('');
        setShowHint(false);
        if (currentIndex < inflections.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            // Finished all or maybe just restart/fetch more
            toast({
                title: isRTL ? 'כל הכבוד!' : 'Well done!',
                description: isRTL ? 'סיימת את כל ההטיות הזמינות' : 'You have completed all available inflections'
            });
            navigate('/practice');
        }
    };

    const blankedSentence = useMemo(() => {
        if (!current) return '';

        // Try replacing inflected word first (longer usually)
        const inflectedRegex = new RegExp(`\\b${current.inflected_word}\\b`, 'gi');
        let newSentence = current.example_sentence.replace(inflectedRegex, '________');

        // If not found or if we want to be safe, also try root word
        if (newSentence === current.example_sentence) {
            const rootRegex = new RegExp(`\\b${current.root_word}\\b`, 'gi');
            newSentence = current.example_sentence.replace(rootRegex, '________');
        }

        // Fallback: If still not found, try a more aggressive match or just return as is
        return newSentence;
    }, [current]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (inflections.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full glass-card border-white/10 text-center p-8">
                    <Info className="w-16 h-16 text-primary mx-auto mb-6 opacity-50" />
                    <h2 className="text-2xl font-bold mb-4">{isRTL ? 'אין מספיק מילים' : 'Not enough words'}</h2>
                    <p className="text-muted-foreground mb-8">
                        {isRTL
                            ? 'כדי לתרגל ב-FlexiWord, עליך לאסוף קודם מילים בזמן הגלישה ולהגיע לרמת שליטה בסיסית בהן.'
                            : 'To practice in FlexiWord, you need to first collect words while browsing and reach a basic level of mastery.'}
                    </p>
                    <Button onClick={() => navigate('/learn')} className="w-full glow-primary">
                        {isRTL ? 'עבור ללמידה' : 'Go to Learning'}
                    </Button>
                </Card>
            </div>
        );
    }

    const progressPercentage = stats.total > 0 ? (stats.practiced / stats.total) * 100 : 0;

    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Premium Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10"
                    style={{ background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)' }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10 transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => navigate('/practice')} className="hover:bg-white/5">
                        <ArrowLeft className={`h-5 w-5 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                        {isRTL ? 'חזרה' : 'Back'}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        <span className="font-black text-xl tracking-tight">FlexiWord</span>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="mb-10 space-y-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                {isRTL ? 'התקדמות אימון הטיות' : 'Inflection Mastery'}
                            </h3>
                            <p className="text-2xl font-black text-foreground">
                                {isRTL ? `מילים שאספת וכבר תרגלת` : `Words Collected & Practiced`}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-primary">{stats.practiced}</span>
                            <span className="text-muted-foreground font-bold"> / {stats.total}</span>
                        </div>
                    </div>
                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Exercise Card */}
                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden transition-all duration-500">
                    <CardHeader className="pb-2 border-b border-white/5 bg-white/5">
                        <div className="flex justify-between items-center">
                            <Badge variant="outline" className="border-primary/30 text-primary py-1 px-3">
                                {current.grammar_note}
                            </Badge>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                <History className="h-4 w-4" />
                                {currentIndex + 1} / {inflections.length}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-10 pb-8 px-8 space-y-10">
                        {/* Root Word Display */}
                        <div className="text-center space-y-2">
                            <span className="text-sm text-muted-foreground font-bold uppercase tracking-[0.2em]">
                                {isRTL ? 'מילת שורש' : 'Root Word'}
                            </span>
                            <h2 className="text-5xl font-black tracking-tight text-white">
                                {current.root_word}
                            </h2>
                            <p className="text-xl text-primary/80 font-medium">
                                {current.root_translation}
                            </p>
                        </div>

                        {/* Sentence Cloze */}
                        <div className="bg-white/5 rounded-2xl p-8 border border-white/10 relative group">
                            <div className="absolute -top-3 left-6 px-3 py-1 bg-background border border-white/10 rounded-full text-[10px] font-bold text-muted-foreground tracking-tighter uppercase">
                                {isRTL ? 'הקשר משפט' : 'Sentence Context'}
                            </div>
                            <p className="text-2xl font-medium leading-relaxed text-center text-white/90 italic">
                                "{blankedSentence}"
                            </p>
                        </div>

                        {/* Input Area */}
                        <div className="space-y-6">
                            <form onSubmit={handleSubmit} className="relative">
                                <Input
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder={isRTL ? 'הקלד את ההטיה הנכונה...' : 'Type the correct inflection...'}
                                    className={`h-16 text-2xl text-center bg-white/5 border-2 transition-all duration-300 ${showFeedback === 'correct' ? 'border-green-500 ring-4 ring-green-500/20' :
                                        showFeedback === 'incorrect' ? 'border-red-500 ring-4 ring-red-500/20' :
                                            'border-white/10 focus:border-primary/50'
                                        }`}
                                    disabled={!!showFeedback}
                                    autoFocus
                                />
                                {showFeedback === 'correct' && (
                                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-green-500 animate-in zoom-in duration-300" />
                                )}
                                {showFeedback === 'incorrect' && (
                                    <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 text-red-500 animate-in zoom-in duration-300" />
                                )}
                            </form>

                            {/* Feedback & Actions */}
                            {!showFeedback ? (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSubmit}
                                        className="flex-1 h-14 text-lg font-bold glow-primary"
                                    >
                                        {isRTL ? 'בדיקה' : 'Check'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowHint(!showHint)}
                                        className="h-14 px-6 border-white/10 hover:bg-white/5"
                                    >
                                        <Lightbulb className={`h-5 w-5 ${showHint ? 'text-yellow-400 fill-yellow-400' : ''}`} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom duration-500 space-y-6">
                                    <div className={`p-4 rounded-xl text-center font-bold text-lg ${showFeedback === 'correct' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {showFeedback === 'correct'
                                            ? (isRTL ? 'מצוין! זו התשובה הנכונה.' : 'Excellent! That is correct.')
                                            : (isRTL ? `לא בדיוק. התשובה היא: ${current.inflected_word}` : `Not quite. The answer is: ${current.inflected_word}`)}
                                    </div>
                                    <Button
                                        onClick={nextQuestion}
                                        className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 group"
                                    >
                                        {isRTL ? 'לשאלה הבאה' : 'Next Question'}
                                        <ArrowRight className={`h-5 w-5 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
                                    </Button>
                                </div>
                            )}

                            {/* Hint Display */}
                            {showHint && !showFeedback && (
                                <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-xl animate-in slide-in-from-top duration-300">
                                    <div className="flex items-start gap-3">
                                        <Lightbulb className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-yellow-400 uppercase mb-1">
                                                {isRTL ? 'רמז בעברית' : 'Hebrew Hint'}
                                            </p>
                                            <p className="text-lg font-medium text-white/90">
                                                {current.inflected_translation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Motivation Stat */}
                <div className="mt-8 flex justify-center gap-8 text-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                    <div>
                        <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                        <span className="block text-xs font-bold uppercase tracking-tighter">Level</span>
                        <span className="text-lg font-black">{Math.floor(stats.practiced / 5) + 1}</span>
                    </div>
                    <div className="w-px h-10 bg-white/10 self-center" />
                    <div>
                        <Sparkles className="h-5 w-5 text-primary mx-auto mb-1" />
                        <span className="block text-xs font-bold uppercase tracking-tighter">Streak</span>
                        <span className="text-lg font-black">0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlexiWord;
