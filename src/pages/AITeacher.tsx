import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Keyboard
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
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

const cleanForSpeech = (text: string) => {
  let processed = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
  processed = processed.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').replace(/_/g, '');
  return processed.replace(/\s+/g, ' ').trim();
};

// Component to render text with highlighting
const HighlightableText: React.FC<{ text: string; readingIndex: number; isActive: boolean }> = ({ text, readingIndex, isActive }) => {
  if (!isActive) return <ReactMarkdown className="prose prose-sm prose-invert max-w-none leading-relaxed">{text}</ReactMarkdown>;

  // A very simplified approach to highlight based on charIndex
  // Standard Markdown renderer makes char-based highlighting hard.
  // We'll show the markdown but add an overlay/indicator if needed, 
  // or just render as plain text for the "active" message to ensure perfect syncing.
  return (
    <div className="relative">
      <div className="prose prose-sm prose-invert max-w-none leading-relaxed opacity-30">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      <div className="absolute top-0 left-0 prose prose-sm prose-invert max-w-none leading-relaxed select-none pointer-events-none text-accent font-bold">
        {/* This is a visual trick: we show the markdown version dimmed, 
            and a highlighted version could go here. For now, we'll keep it simple 
            and just show a reading status or keep markdown. */}
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      {isActive && <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-pulse" style={{ width: `${Math.min(100, (readingIndex / text.length) * 100)}%` }} />
      </div>}
    </div>
  );
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

  // States
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [readingMessageId, setReadingMessageId] = useState<string | null>(null);
  const [readingCharIndex, setReadingCharIndex] = useState(0);

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
  }, [messages, mode]);

  const loadLearnedWords = async () => {
    if (!user) return;
    try {
      // Logic for words...
    } catch (e) { }
  };

  const speakText = (text: string, messageId: string) => {
    window.speechSynthesis.cancel();
    const cleanText = cleanForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    setReadingMessageId(messageId);
    setReadingCharIndex(0);

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

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setReadingCharIndex(event.charIndex);
      }
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setReadingMessageId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setReadingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input.trim();
    if (!textToSend || isLoading) return;

    if (isListening) stopListening();

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })), learnedWords, topic: selectedTopic }),
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
          if (line.startsWith('data: ') && line.slice(6).trim() !== '[DONE]') {
            try {
              const data = JSON.parse(line.trim().slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'assistant' && last.id === assistantId) {
                    return [...prev.slice(0, -1), { ...last, content: assistantContent }];
                  }
                  return [...prev, { id: assistantId, role: 'assistant', content: assistantContent }];
                });
              }
            } catch (e) { }
          }
        }
      }
      if (mode === 'voice') speakText(assistantContent, assistantId);
    } catch (e) { toast({ title: "Error", variant: "destructive" }); }
    setIsLoading(false);
  };

  const startWithTopic = (topic: string) => {
    setSelectedTopic(topic);
    const text = isHebrew ? `היי! בוא נתרגל אנגלית על הנושא: ${topic}` : `Hi! Let's practice English about: ${topic}`;
    handleSend(text);
  };

  return (
    <div className="min-h-screen relative py-4 md:py-8 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 h-[calc(100vh-80px)] max-w-5xl">
        <div className="flex flex-col h-full gap-4">

          {/* Header */}
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-xl border border-white/10 p-4 rounded-[1.5rem] shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent  to-orange-500 flex items-center justify-center shadow-lg shadow-accent/20">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-none mb-1">TalkFix Teacher</h1>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline" className="border-white/10 bg-white/5 text-white/60 text-[10px] hidden sm:flex">
                PRO AI
              </Badge>
            </div>
          </div>

          {/* Combined Experience */}
          <Card className="flex-1 glass-card border-white/10 overflow-hidden flex flex-col relative shadow-2xl">

            {/* Topic Suggestions Landing */}
            {messages.length === 0 && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-700">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-accent/20 animate-bounce-slow">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">{isHebrew ? 'היי! במה נתרגל היום?' : 'Hi! What shall we practice?'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl mt-8">
                  {TOPIC_SUGGESTIONS.map((t, i) => (
                    <Button key={i} variant="outline" className="bg-white/5 border-white/10 hover:bg-accent/10 hover:border-accent/40 text-sm justify-start gap-3 h-auto py-4 px-5 rounded-2xl transition-all duration-300 transform hover:scale-105" onClick={() => startWithTopic(t.he)}>
                      <span className="text-2xl">{t.he.split(' ')[0]}</span>
                      <span className="font-bold text-white/90">{isHebrew ? t.he.substring(t.he.indexOf(' ') + 1) : t.en}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
              {messages.map((m, i) => (
                <div key={m.id} className={`flex gap-4 group ${m.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}>
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-6 ${m.role === 'user' ? 'bg-gradient-to-br from-primary to-blue-600 border border-white/20' : 'bg-gradient-to-br from-accent to-orange-500 border border-white/20'}`}>
                    {m.role === 'user' ? <User className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
                  </div>
                  <div className={`flex-1 max-w-[85%] rounded-[2rem] px-6 py-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 text-white rounded-br-none' : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'}`}>

                    <HighlightableText
                      text={m.content}
                      readingIndex={readingCharIndex}
                      isActive={readingMessageId === m.id}
                    />

                    {m.role === 'assistant' && (
                      <div className="mt-4 flex justify-end gap-2 pt-2 border-t border-white/5">
                        <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-full transition-all ${readingMessageId === m.id ? 'bg-accent/20 text-accent rotate-12' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => readingMessageId === m.id ? window.speechSynthesis.cancel() : speakText(m.content, m.id)}>
                          {readingMessageId === m.id ? <StopCircle className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-gray-400" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-orange-500 border border-white/20 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/15 rounded-[2rem] rounded-bl-none px-8 py-5 flex items-center gap-4 backdrop-blur-md">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-8" />
            </CardContent>

            {/* Combined Control Bar */}
            <div className="p-4 md:p-8 bg-black/40 backdrop-blur-3xl border-t border-white/10">
              <div className="max-w-4xl mx-auto space-y-4">

                {/* Visual Feedback for Voice */}
                {mode === 'voice' && (
                  <div className="flex items-center justify-center py-2 animate-in fade-in duration-300">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10">
                      <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-accent animate-pulse scale-125' : isListening ? 'bg-primary animate-pulse scale-125' : 'bg-gray-600'}`} />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {isSpeaking ? (isHebrew ? 'המורה מדבר' : 'Teacher speaking') : isListening ? (isHebrew ? 'מקשיב לך...' : 'Listening to you') : (isHebrew ? 'מצב שיחה פעיל' : 'Voice Mode active')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 md:gap-5 items-end">
                  {/* Mode Toggle Button */}
                  <Button
                    onClick={() => {
                      setMode(mode === 'chat' ? 'voice' : 'chat');
                      if (isSpeaking) window.speechSynthesis.cancel();
                    }}
                    className={`h-[60px] w-[60px] rounded-2xl flex-shrink-0 transition-all duration-500 p-0 ${mode === 'voice' ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
                  >
                    {mode === 'chat' ? <MessageSquare className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
                  </Button>

                  <div className="flex-1 relative group">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder={isListening ? (isHebrew ? 'מקשיב לך...' : 'Listening...') : (isHebrew ? 'כתוב הודעה למורה...' : 'Type here...')}
                      className="min-h-[60px] max-h-[200px] w-full py-4 px-6 md:px-8 resize-none bg-white/5 border-white/10 focus:border-accent/40 focus:ring-1 focus:ring-accent/20 text-base rounded-[1.8rem] shadow-inner transition-all duration-300 pr-14"
                      disabled={isLoading}
                    />

                    {/* Integrated Mic Button */}
                    <button
                      onClick={isListening ? stopListening : startListening}
                      className={`absolute right-4 bottom-4 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                  </div>

                  <Button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="h-[60px] w-[60px] rounded-2xl flex-shrink-0 bg-gradient-to-br from-primary to-blue-600 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
                  >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 ml-0.5" />}
                  </Button>
                </div>
              </div>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
