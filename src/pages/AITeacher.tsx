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
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  BookOpen,
  RefreshCw
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

// Topic ID to display name mapping
const TOPIC_NAMES: Record<string, { he: string; en: string }> = {
  travel: { he: '✈️ נסיעות', en: '✈️ Travel' },
  business: { he: '💼 עסקים', en: '💼 Business' },
  technology: { he: '💻 טכנולוגיה', en: '💻 Technology' },
  health: { he: '🏥 בריאות', en: '🏥 Health' },
  food: { he: '🍕 אוכל', en: '🍕 Food' },
  entertainment: { he: '🎬 בידור', en: '🎬 Entertainment' },
  sports: { he: '⚽ ספורט', en: '⚽ Sports' },
  education: { he: '📚 חינוך', en: '📚 Education' },
};

export const AITeacher: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const isHebrew = language === 'he';
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadUserData();
  }, [user, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserData = async () => {
    if (!user) return;
    setIsInitializing(true);

    try {
      // Load learned words and user topics in parallel
      const [wordsResult, topicsResult] = await Promise.all([
        loadLearnedWords(),
        loadUserTopics()
      ]);

      // Auto-start conversation after data is loaded
      if (!hasInitialized.current && (wordsResult.length > 0 || topicsResult.length > 0)) {
        hasInitialized.current = true;
        setTimeout(() => {
          startIntroduction(wordsResult, topicsResult);
        }, 500);
      } else if (!hasInitialized.current) {
        hasInitialized.current = true;
        setIsInitializing(false);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsInitializing(false);
    }
  };

  const loadLearnedWords = async (): Promise<LearnedWord[]> => {
    if (!user) return [];

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
        .limit(30);

      if (newSchemaData && newSchemaData.length > 0) {
        const words: LearnedWord[] = newSchemaData.map((item: any) => {
          const word1 = item.word_translations?.words;
          const word2 = item.word_translations?.words2;
          const hebrewWord = word1?.word_text || '';
          const englishWord = word2?.word_text || '';
          return { hebrew: hebrewWord, english: englishWord };
        }).filter((w: LearnedWord) => w.hebrew && w.english);
        
        setLearnedWords(words);
        return words;
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
        .limit(30);

      if (oldSchemaData && oldSchemaData.length > 0) {
        const words: LearnedWord[] = oldSchemaData.map((item: any) => ({
          hebrew: item.vocabulary_words?.hebrew_translation || '',
          english: item.vocabulary_words?.english_word || ''
        })).filter((w: LearnedWord) => w.hebrew && w.english);
        
        setLearnedWords(words);
        return words;
      }

      return [];
    } catch (error) {
      console.error('Error loading learned words:', error);
      return [];
    }
  };

  const loadUserTopics = async (): Promise<string[]> => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('user_topic_preferences')
        .select('topic_id')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const topics = data.map(item => {
          const topicInfo = TOPIC_NAMES[item.topic_id];
          return topicInfo ? (isHebrew ? topicInfo.he : topicInfo.en) : item.topic_id;
        });
        setUserTopics(topics);
        return topics;
      }

      return [];
    } catch (error) {
      console.error('Error loading user topics:', error);
      return [];
    }
  };

  const streamChat = useCallback(async ({
    messages,
    words,
    topics,
    isIntroduction = false,
    onDelta,
    onDone,
  }: {
    messages: Message[];
    words: LearnedWord[];
    topics: string[];
    isIntroduction?: boolean;
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
        learnedWords: words,
        userTopics: topics,
        isIntroduction
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
  }, [isHebrew]);

  const startIntroduction = async (words: LearnedWord[], topics: string[]) => {
    setIsLoading(true);
    setIsInitializing(false);

    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [{ role: "assistant", content: assistantContent }];
      });
    };

    try {
      // Send empty messages array with introduction flag
      await streamChat({
        messages: [{ role: 'user', content: 'היי, בוא נתחיל!' }],
        words,
        topics,
        isIntroduction: true,
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (error) {
      console.error('Introduction error:', error);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: error instanceof Error ? error.message : (isHebrew ? 'לא ניתן להתחיל שיחה' : 'Could not start conversation'),
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
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
        words: learnedWords,
        topics: userTopics,
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
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

  const handleNewConversation = () => {
    setMessages([]);
    hasInitialized.current = false;
    loadUserData();
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
            <p className="text-muted-foreground">
              {isHebrew
                ? 'שוחח עם המורה הוירטואלי שלך ותרגל את המילים שלמדת'
                : 'Chat with your virtual teacher and practice the words you learned'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {learnedWords.length > 0 && (
                <Badge variant="secondary">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {isHebrew ? `${learnedWords.length} מילים` : `${learnedWords.length} words`}
                </Badge>
              )}
              {userTopics.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {userTopics.slice(0, 2).join(', ')}
                  {userTopics.length > 2 && ` +${userTopics.length - 2}`}
                </Badge>
              )}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNewConversation}
                  className="text-xs h-6 px-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {isHebrew ? 'שיחה חדשה' : 'New Chat'}
                </Button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <Card className="mb-4 glass-card border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4">
                {isInitializing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Loader2 className="h-12 w-12 mb-4 animate-spin text-primary" />
                    <p className="text-lg font-medium">
                      {isHebrew ? 'טוען את הנתונים שלך...' : 'Loading your data...'}
                    </p>
                    <p className="text-sm mt-2">
                      {isHebrew ? 'מכין את המורה האישי שלך' : 'Preparing your personal teacher'}
                    </p>
                  </div>
                ) : messages.length === 0 && !isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                    <Bot className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {isHebrew ? 'שלום! אני המורה שלך לאנגלית 👋' : 'Hello! I\'m your English teacher 👋'}
                    </p>
                    <p className="text-sm mt-2">
                      {learnedWords.length === 0 
                        ? (isHebrew ? 'לך ללמוד קודם כמה מילים ואז חזור אלי!' : 'Go learn some words first, then come back!')
                        : (isHebrew ? 'מתחיל שיחה...' : 'Starting conversation...')}
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? (isRTL ? 'flex-row' : 'flex-row-reverse') : (isRTL ? 'flex-row-reverse' : 'flex-row')}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`flex-1 max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-sm' 
                          : 'bg-muted rounded-bl-sm'
                      }`}>
                        <div className={`prose prose-sm max-w-none ${message.role === 'user' ? 'prose-invert' : ''}`}>
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'user') && (
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
              <div className="flex gap-3">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isHebrew ? 'כתוב הודעה...' : 'Type a message...'}
                  className="min-h-[50px] max-h-[150px] resize-none bg-background/50"
                  disabled={isLoading || isInitializing}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading || isInitializing}
                  className="h-auto px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {isHebrew 
                  ? 'לחץ Enter לשליחה, Shift+Enter לשורה חדשה'
                  : 'Press Enter to send, Shift+Enter for new line'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
