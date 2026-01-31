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
  Headphones,
  StopCircle,
  Play,
  Pause,
  Coffee
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
  { he: '☕ מילים יום-יומיות', en: 'Daily Words' },
  { he: '🛒 קניות בסופר', en: 'Shopping at the supermarket' },
  { he: '✈️ נסיעה לחו"ל', en: 'Traveling abroad' },
  { he: '🍕 הזמנת אוכל במסעדה', en: 'Ordering food at a restaurant' },
  { he: '🏥 ביקור אצל רופא', en: 'Visiting the doctor' },
  { he: '💼 ראיון עבודה', en: 'Job interview' },
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

  // Separated voices
  const [englishVoice, setEnglishVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [hebrewVoice, setHebrewVoice] = useState<SpeechSynthesisVoice | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load voices and pick nice ones
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Find nice English Voice
      const eng = voices.find(v => v.name.includes("Google US English"))
        || voices.find(v => v.name.includes("Zira"))
        || voices.find(v => v.name.includes("Samantha"))
        || voices.find(v => v.lang.startsWith("en-US"))
        || voices.find(v => v.lang.startsWith("en"));
      setEnglishVoice(eng || null);

      // Find Hebrew Voice - Prioritize Google Hebrew if available
      const heb = voices.find(v => v.name.includes("Google") && (v.lang.includes("he") || v.lang.includes("iw")))
        || voices.find(v => v.lang.includes("he") || v.lang.includes("iw"))
        || voices.find(v => v.name.toLowerCase().includes("hebrew"));
      setHebrewVoice(heb || null);
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
    } else {
      // Clean up speech when leaving conversation mode
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [mode]);

  const loadLearnedWords = async () => {
    if (!user) return;

    try {
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

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    if (!isSpeechEnabled && mode !== 'conversation') return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Detect Language - Simple heuristic
    // If more than 50% of the first 50 chars are English, treat as English.
    // Otherwise Hebrew.
    const sample = text.substring(0, 50);
    const englishChars = (sample.match(/[A-Za-z]/g) || []).length;
    const hebrewChars = (sample.match(/[\u0590-\u05FF]/g) || []).length;

    // Default to English if predominantly English, otherwise Hebrew
    const isEnglishText = englishChars >= hebrewChars;

    if (isEnglishText) {
      utterance.lang = 'en-US';
      if (englishVoice) utterance.voice = englishVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
    } else {
      utterance.lang = 'he-IL';
      if (hebrewVoice) utterance.voice = hebrewVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
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
          if (isSpeechEnabled || mode === 'conversation') {
            speakText(assistantContent);
          }
        },
      });
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: isHebrew ? 'אירעה שגיאה בחיבור' : 'Connection error occurred',
        variant: 'destructive',
      });
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
    <div className="min-h-screen relative py-8 overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px] bg-accent/15" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px] bg-primary/15" />
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
                {mode === 'conversation'
                  ? (isHebrew ? 'מצב שיחה קולית - דבר בחופשיות' : 'Voice Conversation Mode - Speak freely')
                  : (isHebrew ? 'מצב צ\'אט - תרגול בכתיבה' : 'Chat Mode - Practice writing')}
              </p>
            </div>

            <div className="glass-card p-1 rounded-full flex items-center bg-black/20 border-white/5 self-start md:self-center">
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
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {messages.length === 0 && renderTopicSuggestions()}

                <Card className="glass-card border-white/10 overflow-hidden h-[60vh] flex flex-col shadow-2xl">
                  <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
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
                            <div className={`flex-1 max-w-[85%] rounded-2xl px-6 py-4 shadow-md backdrop-blur-sm ${message.role === 'user'
                              ? 'bg-primary/20 border border-primary/20 text-white rounded-br-sm'
                              : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                              }`}>
                              <div className={`prose prose-sm prose-invert max-w-none`}>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              {message.role === 'assistant' && (
                                <div className="mt-3 flex justify-end gap-2">
                                  {isSpeaking ? (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                      onClick={stopSpeaking}
                                    >
                                      <StopCircle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                      onClick={() => speakText(message.content)}
                                    >
                                      <Volume2 className="h-4 w-4 text-gray-400" />
                                    </Button>
                                  )}
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
              /* CONVERSATION MODE UI - Clean & Pleasant */
              <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">

                {/* Visualizer / Avatar */}
                <div className="relative mb-16">
                  {/* Main Circle */}
                  <div className={`w-56 h-56 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 ${isSpeaking
                      ? 'bg-gradient-to-br from-accent to-orange-600 shadow-[0_0_80px_rgba(255,100,0,0.5)] scale-110'
                      : (isListening
                        ? 'bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_80px_rgba(59,130,246,0.5)] scale-105'
                        : 'bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 shadow-2xl')
                    }`}>
                    {isSpeaking ? (
                      <div className="text-white flex flex-col items-center">
                        <Volume2 className="h-20 w-20 mb-2 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase opacity-80">{isHebrew ? 'מדבר' : 'SPEAKING'}</span>
                      </div>
                    ) : isListening ? (
                      <div className="text-white flex flex-col items-center">
                        <Mic className="h-20 w-20 mb-2 animate-pulse" />
                        <span className="text-xs font-bold tracking-widest uppercase opacity-80">{isHebrew ? 'מקשיב' : 'LISTENING'}</span>
                      </div>
                    ) : (
                      <div className="text-white/50 flex flex-col items-center">
                        <Bot className="h-24 w-24 mb-2 stroke-[1]" />
                      </div>
                    )}
                  </div>

                  {/* Animated Rings */}
                  {isSpeaking && (
                    <>
                      <div className="absolute inset-[-10px] rounded-full border border-accent/30 animate-[spin_4s_linear_infinite]" />
                      <div className="absolute inset-[-25px] rounded-full border border-accent/10 animate-[spin_8s_linear_infinite_reverse]" />
                      <div className="absolute inset-[-50px] rounded-full bg-accent/5 blur-3xl animate-pulse" />
                    </>
                  )}
                  {isListening && (
                    <>
                      <div className="absolute inset-[-10px] rounded-full border border-primary/30 animate-[spin_4s_linear_infinite]" />
                      <div className="absolute inset-[-25px] rounded-full border border-primary/10 animate-[spin_8s_linear_infinite_reverse]" />
                      <div className="absolute inset-[-50px] rounded-full bg-primary/5 blur-3xl animate-pulse" />
                    </>
                  )}
                </div>

                {/* Main Controls */}
                <div className="flex items-center gap-8 mb-12">
                  {/* Listening Control */}
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    className={`h-24 w-24 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 ${isListening
                        ? 'bg-white text-primary border-4 border-primary'
                        : (isSpeaking ? 'bg-black/20 text-gray-500 border border-white/10' : 'bg-primary text-white border-none shadow-[0_0_40px_rgba(59,130,246,0.3)]')
                      }`}
                    disabled={isLoading || isSpeaking}
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-10 w-10" />}
                  </Button>

                  {/* Stop Speaking Control */}
                  {isSpeaking && (
                    <Button
                      onClick={stopSpeaking}
                      className="h-24 w-24 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-in zoom-in duration-300"
                    >
                      <div className="flex flex-col items-center">
                        <Pause className="h-10 w-10 fill-current" />
                        <span className="text-[10px] uppercase font-bold mt-1">{isHebrew ? 'עצור' : 'PAUSE'}</span>
                      </div>
                    </Button>
                  )}
                </div>

                {/* Subtitles / Preview */}
                <div className="max-w-xl w-full text-center px-4 min-h-[100px] flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex items-center gap-3 text-muted-foreground animate-pulse">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-lg">{isHebrew ? 'מעבד תשובה...' : 'Processing response...'}</span>
                    </div>
                  ) : (
                    messages.length > 0 && (
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-500 hover:bg-black/50">
                        <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
                          "{messages[messages.length - 1].content}"
                        </p>
                      </div>
                    )
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
