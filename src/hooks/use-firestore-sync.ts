
"use client";

import { useEffect } from 'react';
import { useApp } from './use-app';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useDebounce } from './use-debounce';

export interface AppState {
    script: string;
    fontSize: number;
    scrollSpeed: number;
    horizontalMargin: number;
    verticalMargin: number;
    isPlaying: boolean;
    activeLine: number | null;
    isFlippedVertical: boolean;
    isFlippedHorizontal: boolean;
    isPrompterDarkMode: boolean;
    prompterTextBrightness: number;
    timestamp: any;
}

export const useFirestoreSync = () => {
    const appState = useApp();
    const { sessionId } = appState;

    const debouncedState = useDebounce(appState, 200);

    useEffect(() => {
        if (!sessionId || !debouncedState) return;

        const stateToSync: AppState = {
            script: debouncedState.script,
            fontSize: debouncedState.fontSize,
            scrollSpeed: debouncedState.scrollSpeed,
            horizontalMargin: debouncedState.horizontalMargin,
            verticalMargin: debouncedState.verticalMargin,
            isPlaying: debouncedState.isPlaying,
            activeLine: debouncedState.activeLine,
            isFlippedVertical: debouncedState.isFlippedVertical,
            isFlippedHorizontal: debouncedState.isFlippedHorizontal,
            isPrompterDarkMode: debouncedState.isPrompterDarkMode,
            prompterTextBrightness: debouncedState.prompterTextBrightness,
            timestamp: serverTimestamp(),
        };

        const sessionRef = doc(db, 'sessions', sessionId);
        
        // We use setDoc with merge:true to create the doc if it doesn't exist, and update it if it does.
        setDoc(sessionRef, stateToSync, { merge: true }).catch(error => {
            console.error("Error syncing state to Firestore:", error);
        });

    }, [debouncedState, sessionId]);
};
