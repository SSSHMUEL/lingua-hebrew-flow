import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import {
  Send,
  User,
  Loader2,
  Sparkles,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Headphones,
  StopCircle,
  Pause,
  Coffee,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LearnedWord {
  hebrew: string;
  english: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-teacher`;

const TOPIC_SUGGESTIONS = [
  { he: '☕ מילים יום-יומיות', en: 'Daily Words' },
  { he: '🛒 קניות בסופר', en: 'Shopping at the supermarket' },
  { he: '✈️ נסיעה לחו"ל', en: 'Traveling abroad' },
  { he: '🍕 הזמנת אוכל במסעדה', en: 'Ordering food at a restaurant' },
  { he: '🏥 ביקור אצל רופא', en: 'Visiting the doctor' },
  { he: '💼 ראיון עבודה', en: 'Job interview' },
];

// Helper to remove emojis for TTS
const cleanForSpeech = (text: string) => {
  let processed = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  processed = processed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '');
  return processed.replace(/\s+/g, ' ').trim();
};

export const AITeacher: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Voice & UI State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [englishVoice, setEnglishVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [hebrewVoice, setHebrewVoice] = useState<SpeechSynthesisVoice | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const eng = voices.find(v => v.name.includes("Natural") && v.lang.startsWith("en"))
        || voices.find(v => v.name.includes("Google US English"))
        || voices.find(v => v.lang.startsWith("en-US"));

      const heb = voices.find(v => v.name.includes("Google") && (v.lang.includes("he") || v.lang.includes("iw")))
        || voices.find(v => v.lang.includes("he") || v.lang.includes("iw"));

      setEnglishVoice(eng || null);
      setHebrewVoice(heb || null);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => window.speechSynthesis.cancel();
  }, []);

  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition({
    onResult: (text) => setInput(text)
  });

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    loadLearnedWords();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isVoiceActive]);

  const loadLearnedWords = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('user_learned_words').select('word_translations(words(word_text))').eq('user_id', user.id).limit(50);
      // Fallback or data parsing... (Simplified for UI focused task)
    } catch (e) { }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const cleanText = cleanForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const isEnglish = (cleanText.match(/[A-Za-z]/g) || []).length >= (cleanText.match(/[\u0590-\u05FF]/g) || []).length;

    if (isEnglish) {
      utterance.lang = 'en-US';
      if (englishVoice) utterance.voice = englishVoice;
      utterance.rate = 0.9;
    } else {
      utterance.lang = 'he-IL';
      if (hebrewVoice) utterance.voice = hebrewVoice;
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const textToSend = input.trim();
    if (isListening) stopListening();

    const userMsg: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = "";
    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg], learnedWords, topic: selectedTopic }),
      });

      if (!resp.body) return;
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                  }
                  return [...prev, { role: 'assistant', content: assistantContent }];
                });
              }
            } catch (e) { }
          }
        }
      }
      if (isVoiceActive) speakText(assistantContent);
    } catch (e) { toast({ title: "Error", variant: "destructive" }); }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative py-4 md:py-8 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 h-[calc(100vh-80px)] max-w-5xl">
        <div className="flex flex-col h-full gap-4">

          {/* Header */}
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-none mb-1">TalkFix AI</h1>
                <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-accent/30 text-accent bg-accent/5">
                  {isHebrew ? 'מורה פרטי' : 'Private Tutor'}
                </Badge>
              </div>
            </div>

            <Button
              variant={isVoiceActive ? "default" : "outline"}
              onClick={() => {
                setIsVoiceActive(!isVoiceActive);
                if (isSpeaking) window.speechSynthesis.cancel();
              }}
              className={`rounded-full gap-2 transition-all duration-500 ${isVoiceActive ? 'bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20' : 'bg-white/5 border-white/10'}`}
            >
              <Headphones className="h-4 w-4" />
              <span className="hidden sm:inline">{isVoiceActive ? (isHebrew ? 'מצב שיחה פעיל' : 'Voice Mode ON') : (isHebrew ? 'לעבור לשיחה' : 'Switch to Voice')}</span>
            </Button>
          </div>

          {/* Combined Chat & Voice Area */}
          <Card className="flex-1 glass-card border-white/10 overflow-hidden flex flex-col relative shadow-2xl">

            {/* Topic Suggestions - Show if empty */}
            {messages.length === 0 && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-accent/20 animate-bounce-slow">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{isHebrew ? 'היי! במה נתרגל היום?' : 'Hi! What shall we practice?'}</h2>
                <p className="text-gray-400 mb-8 max-w-md text-center">{isHebrew ? 'אני כאן לעזור לך לשפר את האנגלית בכיף. בחר נושא או פשוט תתחיל לכתוב.' : 'I\'m here to help you improve your English. Pick a topic or just start typing.'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl px-4">
                  {TOPIC_SUGGESTIONS.map((t, i) => (
                    <Button key={i} variant="outline" className="bg-white/5 border-white/10 hover:bg-accent/10 hover:border-accent/40 text-sm justify-start gap-3 h-auto py-3 px-4 rounded-xl transition-all duration-300" onClick={() => startWithTopic(t.he)}>
                      <span className="text-xl">{t.he.split(' ')[0]}</span>
                      <span className="font-medium text-white/90">{isHebrew ? t.he.substring(t.he.indexOf(' ') + 1) : t.en}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 md:gap-4 group ${m.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${m.role === 'user' ? 'bg-gradient-to-br from-primary to-blue-600 border border-white/20' : 'bg-gradient-to-br from-accent to-orange-500 border border-white/20'}`}>
                    {m.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white" />}
                  </div>
                  <div className={`flex-1 max-w-[85%] rounded-[1.5rem] px-5 py-3 md:px-6 md:py-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-300 ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'}`}>
                    <div className="prose prose-sm prose-invert max-w-none leading-relaxed">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                    {m.role === 'assistant' && (
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10" onClick={() => speakText(m.content)}>
                          <Volume2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-500 border border-white/20 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/15 rounded-2xl rounded-bl-none px-6 py-4 flex items-center gap-2 backdrop-blur-md">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    <span className="text-sm text-gray-400 font-medium">{isHebrew ? 'כותב תשובה...' : 'Thinking...'}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </CardContent>

            {/* Voice Overlay (Integrated) */}
            {isVoiceActive && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-30 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col items-center gap-4 border-accent/20">

                  {/* Visualizer Circles */}
                  <div className="relative w-24 h-24">
                    <div className={`absolute inset-0 rounded-full bg-accent/20 animate-ping ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute inset-0 rounded-full bg-primary/20 animate-ping ${isListening ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'bg-accent shadow-[0_0_30px_rgba(255,100,0,0.4)] scale-110' : isListening ? 'bg-primary shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-110' : 'bg-white/10 border border-white/10'}`}>
                      {isSpeaking ? <Volume2 className="h-10 w-10 text-white animate-pulse" /> : isListening ? <Mic className="h-10 w-10 text-white animate-pulse" /> : <Sparkles className="h-10 w-10 text-white/50" />}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-white font-bold text-lg mb-1">{isSpeaking ? (isHebrew ? 'המורה מדבר...' : 'Teacher is speaking...') : isListening ? (isHebrew ? 'מקשיב לך...' : 'Listening...') : (isHebrew ? 'מוכן לשיחה' : 'Ready to talk')}</p>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">{isHebrew ? 'דבר בחופשיות' : 'Speak freely'}</p>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className={`h-16 w-16 rounded-full shadow-2xl transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`} onClick={isListening ? stopListening : startListening}>
                      {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-8 w-8" />}
                    </Button>
                    {isSpeaking && (
                      <Button size="lg" className="h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md" onClick={() => window.speechSynthesis.cancel()}>
                        <Pause className="h-6 w-6 text-white" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-10 w-10 absolute top-4 right-4 rounded-full hover:bg-white/10" onClick={() => setIsVoiceActive(false)}>
                      <X className="h-4 w-4 text-white/50" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 md:p-6 bg-black/40 backdrop-blur-2xl border-t border-white/10">
              <div className="flex gap-3 md:gap-4 items-end max-w-4xl mx-auto w-full">
                <div className="flex-1 relative group">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder={isListening ? (isHebrew ? 'מקשיב לך...' : 'Listening...') : (isHebrew ? 'כתבו פה למורה...' : 'Type here...')}
                    className="min-h-[60px] max-h-[200px] w-full py-4 px-6 resize-none bg-white/5 border-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/30 text-base rounded-[1.5rem] shadow-inner transition-all duration-300 pr-12"
                    disabled={isLoading}
                  />
                  {!isVoiceActive && (
                    <button onClick={isListening ? stopListening : startListening} className={`absolute right-4 bottom-4 h-8 w-8 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-[60px] w-[60px] rounded-2xl flex-shrink-0 bg-gradient-to-br from-accent to-orange-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 ml-0.5" />}
                </Button>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
