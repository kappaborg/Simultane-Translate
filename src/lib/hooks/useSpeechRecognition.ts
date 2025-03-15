import { SpeechRecognitionResult } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionProps {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  isFinal: boolean;
  confidence: number;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  browserSupportsSpeechRecognition: boolean;
}

// Define the SpeechRecognition type
type SpeechRecognitionType = {
  new (): SpeechRecognition;
};

// Define the SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Define the SpeechRecognitionEvent interface
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

export const useSpeechRecognition = ({
  language = 'en-US',
  continuous = true,
  interimResults = true,
  onResult,
  onError,
}: UseSpeechRecognitionProps = {}): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  
  const SpeechRecognitionRef = useRef<any>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Check if browser supports speech recognition - client-side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      SpeechRecognitionRef.current = (window as any).SpeechRecognition || 
        (window as any).webkitSpeechRecognition;
      setBrowserSupportsSpeechRecognition(!!SpeechRecognitionRef.current);
    }
  }, []);
  
  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      if (onError) onError('Browser does not support speech recognition');
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    if (SpeechRecognitionRef.current) {
      recognitionRef.current = new SpeechRecognitionRef.current();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = interimResults;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        const transcriptValue = result[0].transcript;
        const confidenceValue = result[0].confidence;
        const isFinalValue = result.isFinal;
        
        setTranscript(transcriptValue);
        setConfidence(confidenceValue);
        setIsFinal(isFinalValue);
        
        if (onResult) {
          onResult({
            transcript: transcriptValue,
            isFinal: isFinalValue,
            confidence: confidenceValue,
          });
        }
      };
      
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (onError) onError(event.error);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          // If we're still supposed to be listening, restart
          recognitionRef.current?.start();
        } else {
          setIsListening(false);
        }
      };
      
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [
    browserSupportsSpeechRecognition,
    continuous,
    interimResults,
    language,
    onError,
    onResult,
    isListening,
  ]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setIsFinal(false);
    setConfidence(0);
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);
  
  return {
    transcript,
    isListening,
    isFinal,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  };
}; 