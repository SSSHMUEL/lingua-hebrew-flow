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
  MessageSquare,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  VolumeX
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
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, [messages]);

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
    // Try to detect language or fallback to English if mostly English chars
    const isEnglish = /^[A-Za-z\s.,!?']+$/.test(text.substring(0, 50));
    utterance.lang = isEnglish ? 'en-US' : 'he-IL';
    utterance.rate = 0.9; // Slightly slower for clarity

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

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
          // Speak the full response if enabled
          if (isSpeechEnabled) {
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
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen relative py-8" style={{ background: 'var(--gradient-hero)' }}>
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/2 -translate-y-1/2 -right-[150px] w-[600px] h-[100vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(25 85% 45% / 0.3)' }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -left-[150px] w-[500px] h-[90vh] rounded-full blur-[180px]"
          style={{ background: 'hsl(190 85% 55% / 0.25)' }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8" />
              {isHebrew ? 'מורה AI' : 'AI Teacher'}
            </h1>
            <p className="text-muted-foreground mb-4">
              {isHebrew
                ? 'שוחח עם המורה הוירטואלי שלך ותרגל את המילים שלמדת'
                : 'Chat with your virtual teacher and practice the words you learned'}
            </p>

            <div className="flex items-center justify-center gap-2 mb-2">
              {learnedWords.length > 0 && (
                <Badge variant="secondary">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {isHebrew ? `${learnedWords.length} מילים נלמדו` : `${learnedWords.length} words learned`}
                </Badge>
              )}

              <Button
                variant={isSpeechEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleSpeech}
                className="h-6 text-xs gap-1"
              >
                {isSpeechEnabled
                  ? <><Volume2 className="h-3 w-3" /> {isHebrew ? 'הקראה פעילה' : 'Voice On'}</>
                  : <><VolumeX className="h-3 w-3" /> {isHebrew ? 'הקראה כבויה' : 'Voice Off'}</>
                }
              </Button>
            </div>
          </div>

          {/* Topic Suggestions - Show when no messages */}
          {messages.length === 0 && (
            <Card className="mb-6 glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {isHebrew ? 'בחר נושא לשיחה:' : 'Choose a topic to discuss:'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {TOPIC_SUGGESTIONS.map((topic, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-4 text-sm hover:bg-primary/10 hover:border-primary/50 transition-all text-wrap"
                      onClick={() => startWithTopic(topic.he)}
                    >
                      {isHebrew ? topic.he : topic.en}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Messages */}
          <Card className="mb-4 glass-card border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Bot className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {isHebrew ? 'שלום! אני המורה שלך לאנגלית 👋' : 'Hello! I\'m your English teacher 👋'}
                    </p>
                    <p className="text-sm mt-2">
                      {isHebrew
                        ? 'בחר נושא למעלה או התחל לכתוב כדי לתרגל'
                        : 'Choose a topic above or start typing to practice'}
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                        }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                        }`}>
                        <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                        {message.role === 'assistant' && (
                          <div className="mt-2 flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-50 hover:opacity-100"
                              onClick={() => speakText(message.content)}
                            >
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card className="glass-card border-white/10">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  className={`flex-shrink-0 h-12 w-12 rounded-full ${isListening ? 'animate-pulse' : ''}`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Textarea
                  ref={textareaRef}
                  value={isListening ? transcript : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? (isHebrew ? 'מקשיב לך...' : 'Listening...') : (isHebrew ? 'כתוב הודעה...' : 'Type a message...')}
                  className="min-h-[48px] max-h-[150px] resize-none bg-background/50 flex-1"
                  disabled={isLoading}
                />

                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && !transcript) || isLoading}
                  className="h-12 w-12 rounded-full flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-2">
                <span>{isHebrew ? 'לחץ על המיקרופון כדי לדבר' : 'Click the mic to speak'}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>{isHebrew ? 'Enter לשליחה' : 'Enter to send'}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
