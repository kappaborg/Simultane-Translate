import type { SpeechRecognitionResult } from '@/types';
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

// Define the SpeechRecognition constructor type
type SpeechRecognitionType = {
  new (): SpeechRecognition;
};

// Remove the local interface definitions since we're importing them from types/index.ts

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
      (recognitionRef.current as any).abort();
    }
    
    if (SpeechRecognitionRef.current) {
      recognitionRef.current = new SpeechRecognitionRef.current();
      (recognitionRef.current as any).continuous = continuous;
      (recognitionRef.current as any).interimResults = interimResults;
      (recognitionRef.current as any).lang = language;
      
      (recognitionRef.current as any).onresult = (event: any) => {
        const result = event.results[event.results.length - 1] as any;
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
      
      (recognitionRef.current as any).onerror = (event: SpeechRecognitionErrorEvent) => {
        if (onError) onError(event.error);
      };
      
      (recognitionRef.current as any).onend = () => {
        if (isListening) {
          // If we're still supposed to be listening, restart
          (recognitionRef.current as any)?.start();
        } else {
          setIsListening(false);
        }
      };
      
      (recognitionRef.current as any).start();
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
      (recognitionRef.current as any).stop();
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
        (recognitionRef.current as any).abort();
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