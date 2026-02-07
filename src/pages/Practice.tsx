import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FlipHorizontal2,
  HelpCircle,
  Sparkles,
  Zap,
  Mic,
  Headphones,
  CheckCircle2,
  BookOpen,
  LayoutGrid,
  History
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Practice: React.FC = () => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    document.title = isRTL ? 'מרכז התרגול | TALK FIX' : 'Practice Center | TALK FIX';
  }, [isRTL]);

  const practiceModes = [
    {
      id: 'mix',
      title: isRTL ? 'אימון חכם (מעורב)' : 'Smart Mix (Mixed)',
      description: isRTL ? 'השילוב המושלם של כל סוגי המשחקים לתרגול מקיף.' : 'The perfect mix of all game types for comprehensive practice.',
      icon: Sparkles,
      color: 'from-orange-500 to-yellow-500',
      path: '/practice/mix',
      premium: true
    },
    {
      id: 'flashcards',
      title: isRTL ? 'כרטיסיות אוצר מילים' : 'Vocabulary Flashcards',
      description: isRTL ? 'תרגול קלאסי של זיכרון מהיר אנגלית-עברית.' : 'Classic English-Hebrew memory practice.',
      icon: FlipHorizontal2,
      color: 'from-primary to-primary/60',
      path: '/flashcards'
    },
    {
      id: 'quiz',
      title: isRTL ? 'בוחן אמריקאי' : 'Multiple Choice Quiz',
      description: isRTL ? 'בחרו את התרגום הנכון מתוך 4 אפשרויות.' : 'Choose the correct translation from 4 options.',
      icon: HelpCircle,
      color: 'from-accent to-accent/60',
      path: '/quiz'
    },
    {
      id: 'flash-reaction',
      title: isRTL ? 'משחק הזיכרון המהיר' : 'Flash Reaction',
      description: isRTL ? 'זהו את המילה לפני שהיא נעלמת מהמסך!' : 'Identify the word before it disappears from the screen!',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      path: '/practice/flash-reaction'
    },
    {
      id: 'speech-challenge',
      title: isRTL ? 'מעבדת דיבור' : 'Speech Lab',
      description: isRTL ? 'שפרו את המבטא וההגייה שלכם עם זיהוי קולי.' : 'Improve your accent and pronunciation with voice recognition.',
      icon: Mic,
      color: 'from-red-500 to-orange-500',
      path: '/practice/speech-challenge'
    },
    {
      id: 'listening-match',
      title: isRTL ? 'הבנת הנשמע' : 'Listening Comprehension',
      description: isRTL ? 'הקשיבו למילה ובחרו את התרגום הנכון שלה.' : 'Listen to the word and choose its correct translation.',
      icon: Headphones,
      color: 'from-blue-500 to-cyan-500',
      path: '/practice/listening-match'
    },
    {
      id: 'context-completion',
      title: isRTL ? 'השלמת משפטים' : 'Context Master',
      description: isRTL ? 'תרגול המילה בתוך הקשר של משפט מלא.' : 'Practice the word within the context of a full sentence.',
      icon: BookOpen,
      color: 'from-green-500 to-emerald-500',
      path: '/practice/context-completion'
    },
    {
      id: 'true-false',
      title: isRTL ? 'אמת או שקר' : 'True or False',
      description: isRTL ? 'קבעו במהירות האם התרגום המוצג נכון או שגוי.' : 'Quickly determine if the shown translation is true or false.',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-blue-500',
      path: '/practice/true-false'
    },
    {
      id: 'word-assembly',
      title: isRTL ? 'הרכבת מילים' : 'Spelling Bee',
      description: isRTL ? 'הרכיבו את המילה באנגלית מהאותיות המבולבלות.' : 'Assemble the English word from scrambled letters.',
      icon: LayoutGrid,
      color: 'from-pink-500 to-rose-500',
      path: '/practice/word-assembly'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top duration-700">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1 hover:bg-primary/20 transition-all">
            <History className="h-3 w-3 mr-2" />
            {isRTL ? 'חזרה מרווחת וחיזוק' : 'Spaced Repetition & Core Mastery'}
          </Badge>
          <h1 className="text-5xl font-black text-foreground mb-4 tracking-tight">
            {isRTL ? 'מרכז התרגול' : 'Practice Center'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {isRTL ? 'בחרו את הדרך המועדפת עליכם לחזור על המילים ולשפר את השליטה בשפה.' : 'Choose your preferred way to review words and improve language mastery.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceModes.map((mode, idx) => (
            <Link key={mode.id} to={mode.path} className={`block group h-full ${mode.id === 'mix' ? 'md:col-span-2 lg:col-span-1' : ''}`}>
              <Card className="h-full glass-card border-white/5 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl overflow-hidden relative">
                {mode.premium && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-lg">PREMIUM</Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform`}>
                    <mode.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black">{mode.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {mode.description}
                  </p>
                  <div className="flex items-center text-primary font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                    {isRTL ? 'התחל אימון' : 'START PRACTICE'}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-1 rotate-180' : 'ml-1'}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;
