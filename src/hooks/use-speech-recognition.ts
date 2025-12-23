import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition({ onResult, onError }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognitionAPI);
  }, []);

  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop all tracks after checking
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
      onError?.('Microphone permission denied. Please allow microphone access.');
      return false;
    }
  }, [onError]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      onError?.('Speech recognition is not supported in this browser.');
      return;
    }

    // Check microphone permission first
    const hasAccess = await checkMicrophonePermission();
    if (!hasAccess) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (finalTranscript) {
        onResult?.(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        onError?.('Microphone access denied. Please enable microphone permissions.');
      } else if (event.error !== 'aborted') {
        onError?.(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Error starting recognition:', error);
      onError?.('Failed to start speech recognition.');
    }
  }, [isSupported, checkMicrophonePermission, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
    resetTranscript,
    checkMicrophonePermission,
  };
}

// Fuzzy match function - ignores case and punctuation
export function fuzzyMatch(spoken: string, target: string): boolean {
  const normalize = (str: string) => 
    str.toLowerCase()
       .replace(/[^\w\s]/g, '') // Remove punctuation
       .replace(/\s+/g, ' ')    // Normalize whitespace
       .trim();

  const normalizedSpoken = normalize(spoken);
  const normalizedTarget = normalize(target);

  // Exact match after normalization
  if (normalizedSpoken === normalizedTarget) return true;

  // Check if spoken contains the target word
  if (normalizedSpoken.includes(normalizedTarget)) return true;

  // Check if target contains spoken (for partial matches)
  if (normalizedTarget.includes(normalizedSpoken) && normalizedSpoken.length >= normalizedTarget.length * 0.7) return true;

  // Levenshtein distance for typo tolerance (allow 1-2 character differences for short words)
  const distance = levenshteinDistance(normalizedSpoken, normalizedTarget);
  const maxDistance = Math.max(1, Math.floor(normalizedTarget.length * 0.2)); // Allow 20% error
  
  return distance <= maxDistance;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
