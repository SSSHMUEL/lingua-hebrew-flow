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
  Bot,
  User,
  Loader2,
  Sparkles,
  BookOpen,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Headphones
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  { he: '🛒 קניות בסופר', en: 'Shopping at the supermarket' },
  { he: '✈️ נסיעה לחו"ל', en: 'Traveling abroad' },
  { he: '🍕 הזמנת אוכל במסעדה', en: 'Ordering food at a restaurant' },
  { he: '🏥 ביקור אצל רופא', en: 'Visiting the doctor' },
  { he: '💼 ראיון עבודה', en: 'Job interview' },
  { he: '🏠 חיפוש דירה', en: 'Apartment hunting' },
];

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

  // Modes: 'text' or 'conversation'
  const [mode, setMode] = useState<'text' | 'conversation'>('text');

  // Voice State
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load voices and pick a nice one
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Try to find a "nice" English voice
      // Priority: Google US English, Microsoft Zira, Samantha, or any English voice
      const preferred = voices.find(v => v.name.includes("Google US English"))
        || voices.find(v => v.name.includes("Zira"))
        || voices.find(v => v.name.includes("Samantha"))
        || voices.find(v => v.lang.startsWith("en-US"))
        || voices.find(v => v.lang.startsWith("en"));

      if (preferred) setSelectedVoice(preferred);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: (text) => {
      setInput(text);
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadLearnedWords();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mode]);

  // Automatically enable speech in conversation mode
  useEffect(() => {
    if (mode === 'conversation') {
      setIsSpeechEnabled(true);
    }
  }, [mode]);

  const loadLearnedWords = async () => {
    if (!user) return;

    try {
      // First try new schema
      const { data: newSchemaData } = await supabase
        .from('user_learned_words')
        .select(`
          translation_pair_id,
          word_translations!inner (
            word_id_1,
            word_id_2,
            words:word_id_1 (word_text, language_id),
            words2:word_id_2 (word_text, language_id)
          )
        `)
        .eq('user_id', user.id)
        .limit(50);

      if (newSchemaData && newSchemaData.length > 0) {
        const words: LearnedWord[] = newSchemaData.map((item: any) => {
          const word1 = item.word_translations?.words;
          const word2 = item.word_translations?.words2;
          const hebrewWord = word1?.word_text || '';
          const englishWord = word2?.word_text || '';
          return { hebrew: hebrewWord, english: englishWord };
        }).filter((w: LearnedWord) => w.hebrew && w.english);

        setLearnedWords(words);
        return;
      }

      // Fallback to old schema
      const { data: oldSchemaData } = await supabase
        .from('learned_words')
        .select(`
          vocabulary_word_id,
          vocabulary_words (
            hebrew_translation,
            english_word
          )
        `)
        .eq('user_id', user.id)
        .limit(50);

      if (oldSchemaData && oldSchemaData.length > 0) {
        const words: LearnedWord[] = oldSchemaData.map((item: any) => ({
          hebrew: item.vocabulary_words?.hebrew_translation || '',
          english: item.vocabulary_words?.english_word || ''
        })).filter((w: LearnedWord) => w.hebrew && w.english);

        setLearnedWords(words);
      }
    } catch (error) {
      console.error('Error loading learned words:', error);
    }
  };

  const speakText = (text: string) => {
    if (!isSpeechEnabled) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Use selected voice if available
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Try to detect language or fallback to English if mostly English chars
    const isEnglish = /^[A-Za-z\s.,!?']+$/.test(text.substring(0, 50));
    utterance.lang = isEnglish ? 'en-US' : 'he-IL';
    utterance.rate = 0.95; // Slightly slower for clarity, but not too slow
    utterance.pitch = 1.05; // Slightly higher pitch often sounds friendlier

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  const streamChat = useCallback(async ({
    messages,
    onDelta,
    onDone,
  }: {
    messages: Message[];
    onDelta: (deltaText: string) => void;
    onDone: () => void;
  }) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages,
        learnedWords,
        topic: selectedTopic
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error(isHebrew ? 'הגעת למגבלת הבקשות, נסה שוב מאוחר יותר' : 'Rate limit exceeded, try again later');
      }
      if (resp.status === 402) {
        throw new Error(isHebrew ? 'נדרש תשלום' : 'Payment required');
      }
      throw new Error(errorData.error || 'Failed to start stream');
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  }, [learnedWords, selectedTopic, isHebrew]);

  const handleSend = async () => {
    if ((!input.trim() && !transcript) || isLoading) return;

    const textToSend = input.trim() || transcript;

    // Stop listening if active
    if (isListening) {
      stopListening();
      resetTranscript();
    }

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistant,
        onDone: () => {
          setIsLoading(false);
          // Speak the full response if enabled or in conversation mode
          if (isSpeechEnabled || mode === 'conversation') {
            speakText(assistantContent);
          }
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: error instanceof Error ? error.message : (isHebrew ? 'לא ניתן לשלוח הודעה' : 'Could not send message'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startWithTopic = (topic: string) => {
    setSelectedTopic(topic);
    const greeting = isHebrew
      ? `היי! בוא נתרגל אנגלית על הנושא: ${topic}`
      : `Hi! Let's practice English about: ${topic}`;
    setInput(greeting);
    if (mode === 'text') {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  // UI Components helpers
  const renderTopicSuggestions = () => (
    <Card className="glass-card border-white/10 mb-6 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4 text-muted-foreground">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-medium">
            {isHebrew ? 'נושאים לשיחה:' : 'Conversation topics:'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {TOPIC_SUGGESTIONS.map((topic, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 text-sm justify-start hover:bg-primary/10 hover:border-primary/50 transition-all text-wrap border-white/5 bg-black/20"
              onClick={() => startWithTopic(topic.he)}
            >
              <span className="mr-2 text-lg inline-block">{topic.he.split(' ')[0]}</span>
              <span>{isHebrew ? topic.he.substring(topic.he.indexOf(' ') + 1) : topic.en}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen relative py-8" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.15)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(190 85% 55% / 0.15)' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header & Mode Switch */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mb-2 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-accent" />
                {isHebrew ? 'מורה AI' : 'AI Teacher'}
              </h1>
              <p className="text-muted-foreground">
                {isHebrew
                  ? 'שוחח עם המורה הוירטואלי שלך ותרגל את המילים שלמדת'
                  : 'Chat with your virtual teacher and practice learned words'}
              </p>
            </div>

            <div className="glass-card p-1 rounded-full flex items-center bg-black/20 border-white/5">
              <button
                onClick={() => setMode('text')}
                className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-medium ${mode === 'text'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-white'
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                {isHebrew ? 'צ׳אט' : 'Text'}
              </button>
              <button
                onClick={() => setMode('conversation')}
                className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 text-sm font-medium ${mode === 'conversation'
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-white'
                  }`}
              >
                <Headphones className="h-4 w-4" />
                {isHebrew ? 'שיחה' : 'Talk'}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative min-h-[500px]">
            {mode === 'text' ? (
              /* TEXT MODE DEFAULT UI */
              <div className="space-y-4">
                {messages.length === 0 && renderTopicSuggestions()}

                <Card className="glass-card border-white/10 overflow-hidden h-[60vh] flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-50">
                          <Bot className="h-20 w-20 mb-6 stroke-[1.5]" />
                          <p className="text-xl font-medium">
                            {isHebrew ? 'אני כאן בשבילך' : 'I\'m here to help'}
                          </p>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-4 ${message.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}
                          >
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${message.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-blue-600 text-white'
                                : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white border border-white/10'
                              }`}>
                              {message.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                            </div>
                            <div className={`flex-1 max-w-[85%] rounded-2xl px-6 py-4 shadow-md ${message.role === 'user'
                              ? 'bg-primary/20 border border-primary/20 text-white rounded-br-sm'
                              : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                              }`}>
                              <div className={`prose prose-sm prose-invert max-w-none`}>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              {message.role === 'assistant' && (
                                <div className="mt-3 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    onClick={() => speakText(message.content)}
                                  >
                                    <Volume2 className="h-4 w-4 text-gray-400" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-gray-400">{isHebrew ? 'חושב...' : 'Thinking...'}</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                      <div className="flex gap-3 relative">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={isHebrew ? 'הקלד הודעה...' : 'Type a message...'}
                          className="min-h-[50px] max-h-[150px] resize-none bg-white/5 border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-base pr-12 rounded-xl"
                          disabled={isLoading}
                        />
                        <Button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="h-[50px] w-[50px] rounded-xl flex-shrink-0 bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* CONVERSATION MODE UI */
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-300">
                <div className="relative mb-12">
                  {/* Avatar Circle with Pulse Effect */}
                  <div className={`w-48 h-48 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 ${isSpeaking
                      ? 'bg-gradient-to-br from-accent to-orange-600 shadow-[0_0_60px_rgba(255,100,0,0.4)] scale-110'
                      : (isListening
                        ? 'bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_60px_rgba(59,130,246,0.4)] scale-105'
                        : 'bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-white/10 shadow-2xl')
                    }`}>
                    {isSpeaking ? (
                      <Volume2 className="h-20 w-20 text-white animate-pulse" />
                    ) : isListening ? (
                      <Mic className="h-20 w-20 text-white animate-pulse" />
                    ) : (
                      <Bot className="h-20 w-20 text-white/80" />
                    )}
                  </div>

                  {/* Background Glow Rings */}
                  {isSpeaking && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-accent/30 animate-ping" />
                      <div className="absolute inset-[-20px] rounded-full border-2 border-accent/20 animate-pulse delay-75" />
                    </>
                  )}
                  {isListening && (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
                      <div className="absolute inset-[-20px] rounded-full border-2 border-primary/20 animate-pulse delay-75" />
                    </>
                  )}
                </div>

                {/* Status Text */}
                <div className="text-center mb-8 h-8">
                  {isSpeaking ? (
                    <span className="text-accent font-medium text-lg animate-pulse">
                      {isHebrew ? 'מורה מדבר...' : 'Teacher is speaking...'}
                    </span>
                  ) : isListening ? (
                    <span className="text-primary font-medium text-lg animate-pulse">
                      {isHebrew ? 'מקשיב לך...' : 'Listening to you...'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-lg">
                      {isHebrew ? 'לחץ לדבר' : 'Tap to speak'}
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  <Button
                    size="lg"
                    className={`h-20 w-20 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isListening
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                        : 'bg-white text-black hover:bg-gray-200'
                      }`}
                    onClick={isListening ? stopListening : startListening}
                  >
                    {isListening ? (
                      <MicOff className="h-8 w-8" />
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                </div>

                {/* Last Message Preview */}
                {messages.length > 0 && (
                  <div className="mt-12 max-w-lg w-full">
                    <div className="glass-card p-6 rounded-2xl border-white/5 bg-black/40">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        {messages[messages.length - 1].role === 'user' ? (isHebrew ? 'אתה' : 'You') : (isHebrew ? 'מורה' : 'Teacher')}
                      </h3>
                      <p className="text-lg text-white/90 leading-relaxed">
                        {messages[messages.length - 1].content}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
