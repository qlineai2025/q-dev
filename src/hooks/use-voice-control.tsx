
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from './use-app';
import { voiceCommandScriptEditing } from '@/ai/flows/voice-command-script-editing';
import { voiceToText } from '@/ai/flows/voice-to-text';
import { useToast } from './use-toast';

let SpeechRecognition: any;
if (typeof window !== 'undefined') {
    SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
}

const EDIT_KEYWORDS = ['insert', 'delete', 'replace', 'change', 'edit', 'add', 'remove', 'update'];

export const useVoiceControl = () => {
  const { 
    script, setScript, 
    setIsPlaying, 
    setActiveLine, 
    scrollSpeed, setScrollSpeed,
    setIsListening
  } = useApp();
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const { toast } = useToast();

  const handleCommand = useCallback(async (command: string) => {
    const lowerCaseCommand = command.toLowerCase().trim();

    if (lowerCaseCommand.startsWith('jump to line')) {
      const parts = lowerCaseCommand.split(' ');
      const lineNumberStr = parts[parts.length - 1];
      const lineNumber = parseInt(lineNumberStr, 10);
      if (!isNaN(lineNumber)) {
        setActiveLine(lineNumber);
        toast({ title: "Command Executed", description: `Jumping to line ${lineNumber}` });
      } else {
        toast({ variant: 'destructive', title: "Command Not Understood", description: `Could not parse line number from "${lineNumberStr}".` });
      }
      return;
    }
    
    const isEditingCommand = EDIT_KEYWORDS.some(keyword => lowerCaseCommand.startsWith(keyword));
    if (isEditingCommand) {
      try {
        const result = await voiceCommandScriptEditing({ script, voiceCommand: command });
        if (result.commandExecuted) {
          setScript(result.editedScript);
          toast({ title: "Script Edited", description: result.explanation });
        } else {
           toast({ variant: 'destructive', title: "Edit Command Failed", description: result.explanation });
        }
      } catch (e) {
        console.error("Error processing script editing command:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not edit script via voice." });
      }
      return;
    }

    try {
        const result = await voiceToText({ voiceCommand: command, currentSpeed: scrollSpeed });
        let commandExecuted = true;
        switch (result.action) {
            case 'start':
                setIsPlaying(true);
                break;
            case 'stop':
                setIsPlaying(false);
                break;
            case 'increaseSpeed':
            case 'decreaseSpeed':
                setScrollSpeed(result.newSpeed);
                break;
            case 'noAction':
                commandExecuted = false;
                toast({ variant: 'destructive', title: "Command Not Understood", description: result.explanation });
                break;
        }
        if (commandExecuted) {
          toast({ title: "Command Executed", description: result.explanation });
        }
    } catch(e) {
        console.error("Error processing prompter control command:", e);
        toast({ variant: 'destructive', title: "Error", description: "Could not control prompter via voice." });
    }

  }, [script, setScript, scrollSpeed, setScrollSpeed, setIsPlaying, setActiveLine, toast]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript;
      handleCommand(command);
    };

    recognition.onerror = (event: any) => {
       if (event.error !== 'aborted') {
            setError(`Speech recognition error: ${event.error}`);
       }
    };
    
    recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
    setError(null);
  }, [handleCommand, setIsListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);
  
  useEffect(() => {
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    }
  }, []);

  return { startListening, stopListening, error };
};
