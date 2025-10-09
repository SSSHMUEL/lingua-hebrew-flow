import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Sparkles, Loader2, Play, Pause } from 'lucide-react';

interface Subtitle {
  timestamp: string;
  text: string;
}

export const AISubtitles: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (videoRef.current && subtitles.length > 0) {
      const video = videoRef.current;
      
      const updateSubtitle = () => {
        const currentTime = video.currentTime;
        
        // Find the current subtitle based on timestamp
        for (let i = subtitles.length - 1; i >= 0; i--) {
          const timeInSeconds = parseTimestamp(subtitles[i].timestamp);
          if (currentTime >= timeInSeconds) {
            setCurrentSubtitle(subtitles[i].text);
            break;
          }
        }
      };

      video.addEventListener('timeupdate', updateSubtitle);
      return () => video.removeEventListener('timeupdate', updateSubtitle);
    }
  }, [subtitles]);

  const parseTimestamp = (timestamp: string): number => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: 'שגיאה',
          description: 'אנא בחר קובץ וידאו',
          variant: 'destructive',
        });
        return;
      }

      // Limit file size to 50MB
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'שגיאה',
          description: 'גודל הקובץ חייב להיות פחות מ-50MB',
          variant: 'destructive',
        });
        return;
      }

      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setSubtitles([]);
      setCurrentSubtitle('');
    }
  };

  const handleSubtitleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.srt') && !file.name.endsWith('.vtt')) {
        toast({
          title: 'שגיאה',
          description: 'אנא בחר קובץ כתוביות (SRT או VTT)',
          variant: 'destructive',
        });
        return;
      }

      setSubtitleFile(file);
      
      // Parse subtitle file
      const text = await file.text();
      const parsedSubs = parseSubtitleFile(text);
      
      if (parsedSubs.length > 0) {
        // Replace learned words in subtitles
        const processedSubs = await replaceLearnedWords(parsedSubs);
        setSubtitles(processedSubs);
        
        toast({
          title: 'הצלחה',
          description: 'הכתוביות נטענו בהצלחה!',
        });
      }
    }
  };

  const parseSubtitleFile = (text: string): Subtitle[] => {
    const subtitles: Subtitle[] = [];
    const blocks = text.trim().split('\n\n');
    
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeLine = lines[1];
        const match = timeLine.match(/(\d{2}:\d{2}:\d{2})/);
        if (match) {
          const timestamp = match[1];
          const text = lines.slice(2).join(' ');
          subtitles.push({ timestamp, text });
        }
      }
    }
    
    return subtitles;
  };

  const replaceLearnedWords = async (subs: Subtitle[]): Promise<Subtitle[]> => {
    if (!user) return subs;

    try {
      const { data: learnedWords } = await supabase
        .from('learned_words')
        .select(`
          vocabulary_words (
            english_word,
            hebrew_translation
          )
        `)
        .eq('user_id', user.id);

      if (!learnedWords || learnedWords.length === 0) return subs;

      const wordMap = new Map<string, string>();
      learnedWords.forEach((lw: any) => {
        const word = lw.vocabulary_words;
        if (word?.hebrew_translation && word?.english_word) {
          wordMap.set(word.hebrew_translation, word.english_word);
        }
      });

      return subs.map(sub => {
        let text = sub.text;
        wordMap.forEach((english, hebrew) => {
          const regex = new RegExp(hebrew, 'g');
          text = text.replace(regex, english);
        });
        return { ...sub, text };
      });
    } catch (error) {
      console.error('Error replacing learned words:', error);
      return subs;
    }
  };

  const handleGenerateSubtitles = async () => {
    if (!videoFile || !user) return;

    setLoading(true);
    
    try {
      // Convert video to base64
      const reader = new FileReader();
      reader.readAsDataURL(videoFile);
      
      reader.onload = async () => {
        const base64Video = (reader.result as string).split(',')[1];
        
        try {
          const { data, error } = await supabase.functions.invoke('generate-subtitles', {
            body: {
              videoBase64: base64Video,
              userId: user.id,
            },
          });

          if (error) throw error;

          if (data.error) {
            throw new Error(data.error);
          }

          setSubtitles(data.subtitles);
          
          toast({
            title: 'הצלחה',
            description: 'הכתוביות נוצרו בהצלחה!',
          });
        } catch (error: any) {
          console.error('Error generating subtitles:', error);
          toast({
            title: 'שגיאה',
            description: error.message || 'לא ניתן ליצור כתוביות',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setLoading(false);
        toast({
          title: 'שגיאה',
          description: 'לא ניתן לקרוא את הקובץ',
          variant: 'destructive',
        });
      };
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה',
        variant: 'destructive',
      });
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8" />
              בינה מלאכותית - כתוביות
            </h1>
            <p className="text-muted-foreground text-lg">
              העלה סרטון וקבל כתוביות בעברית עם המילים שלמדת באנגלית
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">העלאת סרטון</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={subtitleInputRef}
                type="file"
                accept=".srt,.vtt"
                onChange={handleSubtitleFileChange}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full h-20 text-lg"
                disabled={loading}
              >
                <Upload className="h-6 w-6 ml-2" />
                {videoFile ? videoFile.name : 'בחר קובץ וידאו'}
              </Button>

              {videoFile && (
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerateSubtitles}
                    className="w-full h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                        מייצר כתוביות עם AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 ml-2" />
                        צור כתוביות עם AI
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground">או</div>
                  
                  <Button
                    onClick={() => subtitleInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-12 text-lg"
                    disabled={loading}
                  >
                    <Upload className="h-5 w-5 ml-2" />
                    העלה קובץ כתוביות (SRT/VTT)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Player */}
          {videoUrl && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full rounded-lg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {currentSubtitle && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center max-w-[90%]">
                      <p className="text-lg font-medium">{currentSubtitle}</p>
                    </div>
                  )}

                  <div className="flex justify-center gap-4 mt-4">
                    <Button onClick={togglePlayPause} size="lg">
                      {isPlaying ? (
                        <>
                          <Pause className="h-5 w-5 ml-2" />
                          השהה
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 ml-2" />
                          הפעל
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subtitles List */}
          {subtitles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">כתוביות ({subtitles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subtitles.map((subtitle, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        currentSubtitle === subtitle.text
                          ? 'bg-primary/10 border-primary'
                          : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm text-muted-foreground min-w-[60px]">
                          {subtitle.timestamp}
                        </span>
                        <p className="text-right flex-1">{subtitle.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2 text-center">איך זה עובד?</h3>
              <ul className="space-y-2 text-muted-foreground text-right">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>העלה סרטון (עד 50MB)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>אופציה 1:</strong> צור כתוביות עם AI - הבינה המלאכותית תייצר כתוביות בעברית</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>אופציה 2:</strong> העלה קובץ כתוביות קיים (SRT/VTT)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>המילים שכבר למדת יוצגו באנגלית בכתוביות</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>זה עוזר לך לתרגל את המילים בהקשר אמיתי</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AISubtitles;
