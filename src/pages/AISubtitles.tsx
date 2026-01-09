import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, Sparkles, Loader2, Play, Pause } from 'lucide-react';

interface Subtitle {
  timestamp: string;
  text: string;
}

export const AISubtitles: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isRTL, t } = useLanguage();
  const isHebrew = language === 'he';

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
          title: isHebrew ? 'שגיאה' : 'Error',
          description: isHebrew ? 'אנא בחר קובץ וידאו' : 'Please select a video file',
          variant: 'destructive',
        });
        return;
      }

      // Limit file size to 50MB
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: isHebrew ? 'שגיאה' : 'Error',
          description: isHebrew ? 'גודל הקובץ חייב להיות פחות מ-50MB' : 'File size must be less than 50MB',
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
          title: isHebrew ? 'שגיאה' : 'Error',
          description: isHebrew ? 'אנא בחר קובץ כתוביות (SRT או VTT)' : 'Please select a subtitle file (SRT or VTT)',
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
          title: isHebrew ? 'הצלחה' : 'Success',
          description: isHebrew ? 'הכתוביות נטענו בהצלחה!' : 'Subtitles loaded successfully!',
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
      // Upload video to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${videoFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('video-uploads')
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(isHebrew ? 'לא ניתן להעלות את הקובץ' : 'Could not upload file');
      }

      console.log('Video uploaded successfully:', fileName);

      // Call Edge Function with the file path
      const { data, error } = await supabase.functions.invoke('transcribeVideo', {
        body: {
          videoPath: fileName,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Process subtitles with learned words replacement
      const processedSubs = await replaceLearnedWords(data.subtitles);
      setSubtitles(processedSubs);

      toast({
        title: isHebrew ? 'הצלחה' : 'Success',
        description: isHebrew
          ? `הכתוביות נוצרו בהצלחה! נשארו לך ${data.remainingUsage} תמלולים היום`
          : `Subtitles generated successfully! You have ${data.remainingUsage} transcriptions left today`,
      });

      // Clean up the uploaded file
      await supabase.storage
        .from('video-uploads')
        .remove([fileName]);

    } catch (error: any) {
      console.error('Error generating subtitles:', error);
      toast({
        title: isHebrew ? 'שגיאה' : 'Error',
        description: error.message || (isHebrew ? 'לא ניתן ליצור כתוביות' : 'Could not generate subtitles'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen relative py-8" style={{ background: 'var(--gradient-hero)' }}>
      {/* Fixed background effect - Orange glow on right, Cyan on left */}
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8" />
              {isHebrew ? 'בינה מלאכותית - כתוביות' : 'AI Subtitles'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isHebrew
                ? 'העלה סרטון וקבל כתוביות בעברית עם המילים שלמדת באנגלית'
                : 'Upload a video and get Hebrew subtitles with your learned words in English'}
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">{isHebrew ? 'העלאת סרטון' : 'Upload Video'}</CardTitle>
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
                aria-label={isHebrew ? "בחר קובץ וידאו מהמחשב" : "Select video file from computer"}
              >
                <Upload className={`h-6 w-6 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <span className="truncate max-w-[300px]">
                  {videoFile ? videoFile.name : (isHebrew ? 'בחר קובץ וידאו' : 'Select Video File')}
                </span>
              </Button>

              {videoFile && (
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerateSubtitles}
                    className="w-full h-12 text-lg"
                    disabled={loading}
                    aria-label={isHebrew ? "ייצור כתוביות אוטומטי באמצעות בינה מלאכותית" : "Generate automatic subtitles using AI"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                        {isHebrew ? 'מייצר כתוביות עם AI...' : 'Generating subtitles with AI...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isHebrew ? 'צור כתוביות עם AI' : 'Generate Subtitles with AI'}
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">{isHebrew ? 'או' : 'OR'}</div>

                  <Button
                    onClick={() => subtitleInputRef.current?.click()}
                    variant="outline"
                    className="w-full h-12 text-lg"
                    disabled={loading}
                    aria-label={isHebrew ? "העלה קובץ כתוביות בפורמט SRT או VTT" : "Upload subtitle file in SRT or VTT format"}
                  >
                    <Upload className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isHebrew ? 'העלה קובץ כתוביות (SRT/VTT)' : 'Upload Subtitle File (SRT/VTT)'}
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
                    controls
                    controlsList="nodownload"
                  />

                  {currentSubtitle && (
                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg text-center max-w-[90%] pointer-events-none">
                      <p className="text-lg font-medium">{currentSubtitle}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subtitles List */}
          {subtitles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">{isHebrew ? 'כתוביות' : 'Subtitles'} ({subtitles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subtitles.map((subtitle, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${currentSubtitle === subtitle.text
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/30'
                        }`}
                    >
                      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <span className="font-mono text-sm text-muted-foreground min-w-[60px]">
                          {subtitle.timestamp}
                        </span>
                        <p className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{subtitle.text}</p>
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
              <h3 className="font-semibold text-lg mb-2 text-center">{isHebrew ? 'איך זה עובד?' : 'How It Works?'}</h3>
              <ul className={`space-y-2 text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew ? 'העלה סרטון (עד 50MB)' : 'Upload a video (up to 50MB)'}</span>
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew
                    ? <strong>אופציה 1: </strong>
                    : <strong>Option 1: </strong>}
                    {isHebrew ? 'צור כתוביות עם AI - תמלול אוטומטי מהיר באמצעות Groq' : 'Generate AI Subtitles - Fast automatic transcription via Groq'}</span>
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew
                    ? <strong>אופציה 2: </strong>
                    : <strong>Option 2: </strong>}
                    {isHebrew ? 'העלה קובץ כתוביות קיים (SRT/VTT)' : 'Upload an existing subtitle file (SRT/VTT)'}</span>
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew ? 'המילים שכבר למדת יוצגו באנגלית בכתוביות' : 'Words you\'ve learned will appear in English within the subtitles'}</span>
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew ? 'זה עוזר לך לתרגל את המילים בהקשר אמיתי' : 'This helps you practice words in a real context'}</span>
                </li>
                <li className={`flex items-start gap-2 ${isRTL ? '' : 'flex-row-reverse'}`}>
                  <span className="text-primary">•</span>
                  <span>{isHebrew
                    ? <strong>מגבלה: </strong>
                    : <strong>Limit: </strong>}
                    {isHebrew ? '5 תמלולים ליום למשתמש' : '5 transcriptions per day per user'}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div >
  );
};

export default AISubtitles;

