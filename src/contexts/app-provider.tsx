
"use client";

import type { User } from 'firebase/auth';
import type { ReactNode } from 'react';
import React, { createContext, useState, useMemo } from 'react';
import type { IntelligentScriptIndexingOutput } from '@/ai/flows/intelligent-script-indexing';

const initialScript = `This is a sample script to demonstrate the functionality. You can edit this text directly in the script editor panel on the left.

Use the controls on the right to adjust font size, margins, and scrolling speed.

You can also use voice commands to control the prompter. Click the microphone icon to start listening. Try saying "play", "pause", or "jump to line 1".

To import your own scripts, use the options at the bottom of the script editor.

Happy prompting!`;

interface AppContextType {
  script: string;
  setScript: (script: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  scrollSpeed: number;
  setScrollSpeed: (speed: number) => void;
  horizontalMargin: number;
  setHorizontalMargin: (margin: number) => void;
  verticalMargin: number;
  setVerticalMargin: (margin: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  indexedScript: IntelligentScriptIndexingOutput | null;
  setIndexedScript: (index: IntelligentScriptIndexingOutput | null) => void;
  isLoadingIndex: boolean;
  setIsLoadingIndex: (loading: boolean) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  activeLine: number | null;
  setActiveLine: (line: number | null) => void;
  isScriptEditorExpanded: boolean;
  setIsScriptEditorExpanded: (expanded: boolean) => void;
  isPrompterDarkMode: boolean;
  setIsPrompterDarkMode: (darkMode: boolean) => void;
  isPrompterFullscreen: boolean;
  setIsPrompterFullscreen: (fullscreen: boolean) => void;
  prompterTextBrightness: number;
  setPrompterTextBrightness: (brightness: number) => void;
  isFlippedVertical: boolean;
  setIsFlippedVertical: (flipped: boolean) => void;
  isFlippedHorizontal: boolean;
  setIsFlippedHorizontal: (flipped: boolean) => void;
  isAssistModeOn: boolean;
  setIsAssistModeOn: (isOn: boolean) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [script, setScript] = useState<string>(initialScript);
  const [fontSize, setFontSize] = useState<number>(64);
  const [scrollSpeed, setScrollSpeed] = useState<number>(50);
  const [horizontalMargin, setHorizontalMargin] = useState<number>(10);
  const [verticalMargin, setVerticalMargin] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [indexedScript, setIndexedScript] =
    useState<IntelligentScriptIndexingOutput | null>(null);
  const [isLoadingIndex, setIsLoadingIndex] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [isScriptEditorExpanded, setIsScriptEditorExpanded] = useState<boolean>(false);
  const [isPrompterDarkMode, setIsPrompterDarkMode] = useState<boolean>(true);
  const [isPrompterFullscreen, setIsPrompterFullscreen] = useState<boolean>(false);
  const [prompterTextBrightness, setPrompterTextBrightness] = useState<number>(100);
  const [isFlippedVertical, setIsFlippedVertical] = useState<boolean>(false);
  const [isFlippedHorizontal, setIsFlippedHorizontal] = useState<boolean>(false);
  const [isAssistModeOn, setIsAssistModeOn] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);


  const contextValue = useMemo(
    () => ({
      script,
      setScript,
      fontSize,
      setFontSize,
      scrollSpeed,
      setScrollSpeed,
      horizontalMargin,
      setHorizontalMargin,
      verticalMargin,
      setVerticalMargin,
      isPlaying,
      setIsPlaying,
      user,
      setUser,
      indexedScript,
      setIndexedScript,
      isLoadingIndex,
      setIsLoadingIndex,
      isListening,
      setIsListening,
      activeLine,
      setActiveLine,
      isScriptEditorExpanded,
      setIsScriptEditorExpanded,
      isPrompterDarkMode,
      setIsPrompterDarkMode,
      isPrompterFullscreen,
      setIsPrompterFullscreen,
      prompterTextBrightness,
      setPrompterTextBrightness,
      isFlippedVertical,
      setIsFlippedVertical,
      isFlippedHorizontal,
      setIsFlippedHorizontal,
      isAssistModeOn,
      setIsAssistModeOn,
      sessionId,
      setSessionId,
    }),
    [
      script,
      fontSize,
      scrollSpeed,
      horizontalMargin,
      verticalMargin,
      isPlaying,
      user,
      indexedScript,
      isLoadingIndex,
      isListening,
      activeLine,
      isScriptEditorExpanded,
      isPrompterDarkMode,
      isPrompterFullscreen,
      prompterTextBrightness,
      isFlippedVertical,
      isFlippedHorizontal,
      isAssistModeOn,
      sessionId,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}
