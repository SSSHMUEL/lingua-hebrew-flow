import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechRecognition, fuzzyMatch } from '@/hooks/use-speech-recognition';
import {
    Volume2,
    Trophy,
    Brain,
    ArrowRight,
    Shuffle,
    RotateCcw,
    Mic,
    MicOff,
    History as HistoryIcon,
    Zap,
    Eye,
    EyeOff,
    ArrowLeft
} from 'lucide-react';

// --- Types ---

interface VocabularyWord {
    id: string;
    user_word_id?: string;
    english_word: string;
    hebrew_translation: string;
    category: string;
    example_sentence: string;
    pronunciation?: string;
    status?: string;
}

type ChallengeType =
    | 'multiple-choice'
    | 'flash-reaction'
    | 'context-completion'
    | 'word-assembly'
    | 'true-false'
    | 'listening-match'
    | 'speech-challenge'
    | 'mix';

type ViewMode = 'study' | 'challenge' | 'feedback' | 'summary';
type FeedbackStatus = 'success' | 'error' | null;

// --- Helper Functions ---

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- Styles for Animations ---
const AnimationStyles = () => (
    <style>{`
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
    .animate-shake { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
    
    @keyframes flash-green {
      0% { background-color: rgba(34, 197, 94, 0); }
      50% { background-color: rgba(34, 197, 94, 0.2); }
      100% { background-color: rgba(34, 197, 94, 0); }
    }
    .animate-flash-green { animation: flash-green 0.6s ease-out; }
    
    @keyframes flash-red {
      0% { background-color: rgba(239, 68, 68, 0); }
      50% { background-color: rgba(239, 68, 68, 0.2); }
      100% { background-color: rgba(239, 68, 68, 0); }
    }
    .animate-flash-red { animation: flash-red 0.6s ease-out; }

    @keyframes progress-fill {
      from { width: 0%; }
      to { width: 100%; }
    }
    .animate-progress-fill { animation: progress-fill 5s linear forwards; }
  `}</style>
);

const FlashReactionView: React.FC<{ hebrewWord: string; onHide: () => void; isHebrew: boolean }> = ({ hebrewWord, onHide, isHebrew }) => {
    const [visible, setVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState(2);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setVisible(false);
                    onHide();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onHide]);

    return (
        <div className="h-40 flex items-center justify-center relative">
            {visible ? (
                <div className="animate-in zoom-in duration-300 text-center">
                    <Eye className="w-8 h-8 mx-auto text-primary mb-2 animate-pulse" />
                    <h2 className="text-5xl font-black text-white">{hebrewWord}</h2>
                    <p className="text-xs text-muted-foreground mt-2 font-mono uppercase">{isHebrew ? `מסתיר בעוד ${timeLeft}` : `HIDING IN ${timeLeft}s`}</p>
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-50 duration-300">
                    <EyeOff className="w-12 h-12 text-white/20 mx-auto" />
                    <p className="text-muted-foreground mt-4 font-black">{isHebrew ? 'איזו מילה זו באנגלית?' : 'WHICH ENGLISH WORD?'}</p>
                </div>
            )}
        </div>
    );
};

const PracticeMode: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { type } = useParams<{ type: string }>();
    const { language, isRTL } = useLanguage();
    const isHebrew = language === 'he';

    const [loading, setLoading] = useState(true);
    const [lessonQueue, setLessonQueue] = useState<VocabularyWord[]>([]);
    const [targetLessonSize, setTargetLessonSize] = useState(10);
    const [distractors, setDistractors] = useState<VocabularyWord[]>([]);
    const [completedWords, setCompletedWords] = useState<VocabularyWord[]>([]);

    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [viewMode, setViewMode] = useState<ViewMode>('study');
    const [challengeType, setChallengeType] = useState<ChallengeType>('multiple-choice');
    const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);

    const [options, setOptions] = useState<string[]>([]);
    const [assembledLetters, setAssembledLetters] = useState<{ char: string, id: number }[]>([]);
    const [targetLetters, setTargetLetters] = useState<string[]>([]);
    const [availableLetters, setAvailableLetters] = useState<{ char: string, id: number }[]>([]);
    const [showFlashText, setShowFlashText] = useState(true);
    const [contextInput, setContextInput] = useState<string | null>(null);
    const [trueFalseStatement, setTrueFalseStatement] = useState<{ text: string, isTrue: boolean } | null>(null);

    const { isListening, startListening, stopListening, transcript, resetTranscript, isSupported } = useSpeechRecognition();

    const currentWord = lessonQueue[currentWordIndex];

    const triggerRefill = useCallback(async () => {
        if (!user) return;
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('english_level, interest_topics, interests')
                .eq('user_id', user.id)
                .single();
            const userLevel = profile?.english_level || 'beginner';
            const userInterests = (profile as any)?.interest_topics || (profile as any)?.interests || [];
            const userCategory = Array.isArray(userInterests) ? userInterests.join(',') : userInterests;

            await (supabase as any).rpc('maintain_minimum_words', {
                p_user_id: user.id, p_level: userLevel, p_category: userCategory, p_min_count: 20
            });
        } catch (err) {
            console.error("Refill process failed:", err);
        }
    }, [user]);

    const loadData = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            await triggerRefill();
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            const { data: userWordsData, error } = await supabase.from('user_words')
                .select(`
          id,
          status,
          vocabulary_words!user_words_word_id_fkey!inner (
            id,
            english_word,
            hebrew_translation,
            category,
            example_sentence,
            pronunciation,
            priority
          )
        `)
                .eq('user_id', user.id)
                .or(`status.in.(new,queued),and(status.eq.learned,or(last_practiced_at.lt.${sevenDaysAgo},last_practiced_at.is.null))`)
                .order('priority', { foreignTable: 'vocabulary_words', ascending: false })
                .limit(10);

            if (error) throw error;

            const batch = (userWordsData || []).map(item => ({
                ...(item.vocabulary_words as any),
                user_word_id: item.id,
                status: item.status
            })) as VocabularyWord[];

            const { data: distData } = await supabase.from('vocabulary_words').select('*').limit(30);

            setLessonQueue(batch);
            setTargetLessonSize(batch.length);
            setDistractors(distData || []);
            setCurrentWordIndex(0);
            setViewMode(batch.length > 0 ? 'study' : 'summary');
        } catch (err) {
            console.error(err);
            toast({ title: isHebrew ? "שגיאה" : "Error", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [user, isHebrew]);

    useEffect(() => { loadData(); }, [loadData]);

    useEffect(() => {
        if (challengeType === 'speech-challenge' && viewMode === 'challenge' && transcript && currentWord && !feedbackStatus) {
            if (fuzzyMatch(transcript, currentWord.english_word)) {
                handleAnswer(currentWord.english_word);
                stopListening();
            }
        }
    }, [transcript, challengeType, viewMode, currentWord, feedbackStatus]);

    const speakWord = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = 'en-US';
            utt.rate = 0.9;
            window.speechSynthesis.speak(utt);
        }
    };

    const startChallenge = () => {
        if (!currentWord) return;

        let selectedType: ChallengeType = (type && type !== 'mix') ? (type as ChallengeType) : 'multiple-choice';

        if (type === 'mix' || !type) {
            let types: ChallengeType[] = ['multiple-choice', 'flash-reaction', 'context-completion', 'word-assembly', 'true-false', 'listening-match'];
            if (isSupported) types.push('speech-challenge');
            if (!currentWord.example_sentence) types = types.filter(t => t !== 'context-completion');
            selectedType = types[Math.floor(Math.random() * types.length)];
        }

        setChallengeType(selectedType);
        const otherWords = [...distractors, ...lessonQueue].filter(w => w.id !== currentWord.id);
        const uniqueOthers = Array.from(new Set(otherWords.map(w => JSON.stringify(w)))).map(s => JSON.parse(s));

        if (selectedType === 'multiple-choice' || selectedType === 'listening-match') {
            const correct = currentWord.hebrew_translation;
            const dists = shuffleArray(uniqueOthers).slice(0, 3).map((w: any) => w.hebrew_translation);
            setOptions(shuffleArray([correct, ...dists]));
            if (selectedType === 'listening-match') speakWord(currentWord.english_word);
        } else if (selectedType === 'flash-reaction') {
            setOptions(shuffleArray([currentWord.english_word, shuffleArray(uniqueOthers)[0]?.english_word || '...']));
            setShowFlashText(true);
        } else if (selectedType === 'context-completion') {
            setOptions(shuffleArray([currentWord.english_word, ...shuffleArray(uniqueOthers).slice(0, 2).map((w: any) => w.english_word)]));
            setContextInput(null);
        } else if (selectedType === 'word-assembly') {
            const word = currentWord.english_word.toUpperCase();
            setTargetLetters(word.split(''));
            setAvailableLetters(shuffleArray(word.split('').map((char, i) => ({ char, id: i }))));
            setAssembledLetters([]);
        } else if (selectedType === 'true-false') {
            const isTrue = Math.random() > 0.5;
            const trans = isTrue ? currentWord.hebrew_translation : shuffleArray(uniqueOthers)[0]?.hebrew_translation || '...';
            setTrueFalseStatement({ text: `${currentWord.english_word} = ${trans}`, isTrue });
            setOptions(['נכון', 'לא נכון']);
        } else if (selectedType === 'speech-challenge') {
            resetTranscript();
            startListening();
        }

        setViewMode('challenge');
        setFeedbackStatus(null);
    };

    const handleAnswer = (answer: string | boolean) => {
        if (!currentWord || feedbackStatus) return;
        let isCorrect = false;

        if (challengeType === 'multiple-choice' || challengeType === 'listening-match') isCorrect = answer === currentWord.hebrew_translation;
        else if (challengeType === 'flash-reaction' || challengeType === 'context-completion') isCorrect = answer === currentWord.english_word;
        else if (challengeType === 'true-false') isCorrect = (answer === 'נכון') === trueFalseStatement?.isTrue;
        else if (challengeType === 'speech-challenge') isCorrect = (answer as string).toLowerCase().includes(currentWord.english_word.toLowerCase());

        setFeedbackStatus(isCorrect ? 'success' : 'error');
        if (isCorrect) setTimeout(handleSuccess, 1200);
        else setTimeout(handleFailure, 1500);
    };

    const handleLetterClick = (charObj: { char: string, id: number }) => {
        if (feedbackStatus) return;
        const newAvailable = availableLetters.filter(l => l.id !== charObj.id);
        const newAssembled = [...assembledLetters, charObj];
        setAvailableLetters(newAvailable);
        setAssembledLetters(newAssembled);

        if (newAssembled.length === currentWord.english_word.length) {
            if (newAssembled.map(l => l.char).join('') === currentWord.english_word.toUpperCase()) {
                setFeedbackStatus('success');
                setTimeout(handleSuccess, 1200);
            } else {
                setFeedbackStatus('error');
                setTimeout(() => {
                    setAvailableLetters(shuffleArray(currentWord.english_word.toUpperCase().split('').map((char, i) => ({ char, id: i }))));
                    setAssembledLetters([]);
                    setFeedbackStatus(null);
                }, 1000);
            }
        }
    };

    const handleSuccess = () => {
        setCompletedWords(prev => [...prev.filter(w => w.id !== currentWord.id), currentWord]);
        if (completedWords.length + 1 >= targetLessonSize) finish();
        else {
            setCurrentWordIndex(prev => prev + 1);
            setViewMode('study');
        }
    };

    const handleFailure = () => {
        setLessonQueue(prev => [...prev, currentWord]);
        setCurrentWordIndex(prev => prev + 1);
        setViewMode('study');
    };

    const finish = async () => {
        setViewMode('summary');
        try {
            const ids = Array.from(new Set([...completedWords.map(w => w.user_word_id), currentWord.user_word_id]));
            await supabase.from('user_words').update({ last_practiced_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any).in('id', ids);
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Brain className="h-12 w-12 text-primary animate-pulse" /></div>;

    if (viewMode === 'summary') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
                <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
                <h1 className="text-4xl font-black">{isHebrew ? 'האימון הושלם!' : 'Practice Complete!'}</h1>
                <p className="text-xl text-muted-foreground">{isHebrew ? `תרגלת ${targetLessonSize} מילים בהצלחה!` : `Successfully practiced ${targetLessonSize} words!`}</p>
                <Button onClick={() => navigate('/practice')} className="glow-primary mt-4">{isHebrew ? 'חזרה למרכז התרגול' : 'Back to Practice'}</Button>
            </div>
        );
    }

    const progress = (completedWords.length / targetLessonSize) * 100;

    return (
        <div className={`min-h-screen p-4 flex flex-col max-w-md mx-auto relative ${feedbackStatus === 'success' ? 'animate-flash-green' : feedbackStatus === 'error' ? 'animate-flash-red' : ''}`}>
            <AnimationStyles />
            <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/practice')} className="w-fit p-0 h-auto text-xs text-muted-foreground mb-1">
                            <ArrowLeft className="h-3 w-3 mr-1" /> {isHebrew ? 'חזרה' : 'Back'}
                        </Button>
                        <span className="text-lg font-black">{completedWords.length} / {targetLessonSize}</span>
                    </div>
                    <Badge className="bg-primary/20 text-primary">{type?.replace('-', ' ').toUpperCase() || 'PRACTICE'}</Badge>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {viewMode === 'study' && currentWord && (
                <Card className="flex-1 glass-card flex flex-col animate-in slide-in-from-right duration-300">
                    <CardHeader className="text-center pt-10">
                        <Badge className="mx-auto mb-4">{currentWord.category}</Badge>
                        <CardTitle className="text-6xl font-black mb-4">{currentWord.english_word}</CardTitle>
                        <Button variant="ghost" onClick={() => speakWord(currentWord.english_word)} className="text-primary gap-2">
                            <Volume2 className="h-6 w-6" /> {isHebrew ? 'הגייה' : 'Pronunciation'}
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center space-y-6 p-6">
                        <div className="w-full p-6 bg-white/5 rounded-2xl text-center">
                            <p className="text-3xl font-bold">{currentWord.hebrew_translation}</p>
                        </div>
                        <div className="w-full p-6 bg-white/5 rounded-2xl text-center italic text-gray-300">
                            "{currentWord.example_sentence}"
                        </div>
                        <Button onClick={startChallenge} className="w-full h-14 mt-auto text-xl font-black glow-primary">
                            {isHebrew ? 'המשך לתרגול' : 'CONTINUE'} <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {viewMode === 'challenge' && (
                <Card className={`flex-1 glass-card flex flex-col p-6 space-y-8 ${feedbackStatus === 'error' ? 'animate-shake' : ''}`}>
                    <div className="text-center">
                        {challengeType === 'flash-reaction' && <FlashReactionView hebrewWord={currentWord.hebrew_translation} onHide={() => setShowFlashText(false)} isHebrew={isHebrew} />}

                        {challengeType === 'context-completion' && (
                            <div className="space-y-6">
                                <div className="text-2xl font-medium leading-relaxed" dir="ltr">
                                    {currentWord.example_sentence.split(new RegExp(`(${currentWord.english_word})`, 'gi')).map((part, i) => (
                                        <span key={i} className={part.toLowerCase() === currentWord.english_word.toLowerCase() ? (feedbackStatus === 'success' ? 'text-green-400 font-bold border-b-2 border-green-500' : 'text-transparent border-b-2 border-white/30') : ''}>
                                            {part.toLowerCase() === currentWord.english_word.toLowerCase() ? (feedbackStatus === 'success' ? part : '_______') : part}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-muted-foreground font-bold">{currentWord.hebrew_translation}</p>
                            </div>
                        )}

                        {challengeType !== 'flash-reaction' && challengeType !== 'context-completion' && <h2 className="text-4xl font-black mb-6">{challengeType === 'listening-match' ? <Volume2 className="h-12 w-12 mx-auto" /> : currentWord.english_word}</h2>}

                        {challengeType === 'true-false' && trueFalseStatement && (
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-6">
                                <p className="text-2xl font-bold">{trueFalseStatement.text}</p>
                            </div>
                        )}

                        {challengeType === 'speech-challenge' && (
                            <div className="flex flex-col items-center gap-4">
                                <button onClick={() => !isListening && startListening()} className={`h-24 w-24 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5'}`}>
                                    {isListening ? <Mic className="h-10 w-10" /> : <MicOff className="h-10 w-10" />}
                                </button>
                                <p className="text-sm opacity-60">{transcript || (isHebrew ? 'דבר כעת...' : 'Speak now...')}</p>
                            </div>
                        )}

                        {challengeType === 'word-assembly' && (
                            <div className="space-y-8">
                                <div className="flex justify-center gap-2 min-h-[3rem]" dir="ltr">
                                    {assembledLetters.map((l, i) => <div key={i} className="w-10 h-12 bg-primary/20 border border-primary/40 text-primary rounded flex items-center justify-center text-xl font-bold">{l.char}</div>)}
                                    {Array.from({ length: Math.max(0, currentWord.english_word.length - assembledLetters.length) }).map((_, i) => <div key={i} className="w-10 h-12 bg-black/20 border border-white/5 rounded" />)}
                                </div>
                                <div className="flex flex-wrap justify-center gap-2" dir="ltr">
                                    {availableLetters.map((l) => <Button key={l.id} onClick={() => handleLetterClick(l)} variant="outline" className="w-10 h-12 text-lg font-bold">{l.char}</Button>)}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 mt-auto">
                        {(challengeType === 'multiple-choice' || challengeType === 'flash-reaction' || challengeType === 'true-false' || challengeType === 'listening-match' || challengeType === 'context-completion') && options.map((opt, i) => (
                            <Button key={i} onClick={() => handleAnswer(opt)} disabled={!!feedbackStatus} className={`h-16 text-xl font-bold glass-button ${feedbackStatus && opt === currentWord.hebrew_translation ? 'bg-green-500/20 border-green-500 text-green-400' : ''}`}>
                                {opt}
                            </Button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PracticeMode;
