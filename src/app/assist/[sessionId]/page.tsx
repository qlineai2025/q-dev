
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppState } from '@/hooks/use-firestore-sync';
import PrompterView from '@/components/q/prompter-view';
import { cn } from '@/lib/utils';
import { AppProvider, AppContext } from '@/contexts/app-provider';


function AssistView() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const [state, setState] = useState<AppState | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const sessionRef = doc(db, 'sessions', sessionId);
        const unsubscribe = onSnapshot(sessionRef, (doc) => {
            if (doc.exists()) {
                setState(doc.data() as AppState);
            } else {
                console.error("Session document not found!");
            }
        });

        return () => unsubscribe();
    }, [sessionId]);

    if (!state) {
        return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading session...</div>;
    }
    
    // We can't pass the state directly to PrompterView as it uses the AppContext
    // So we wrap it in a dummy provider and set the values there.
    // A better approach would be to refactor PrompterView to accept props.
    const DummyProvider = ({ children }: { children: React.ReactNode}) => {
        const value = {
            ...state,
            // provide dummy setters
            setScript: () => {},
            setFontSize: () => {},
            setScrollSpeed: () => {},
            setHorizontalMargin: () => {},
            setVerticalMargin: () => {},
            setIsPlaying: () => {},
            setUser: () => {},
            setIndexedScript: () => {},
            setIsLoadingIndex: () => {},
            setIsListening: () => {},
            setActiveLine: () => {},
            setIsScriptEditorExpanded: () => {},
            setIsPrompterDarkMode: () => {},
            setIsPrompterFullscreen: () => {},
            setPrompterTextBrightness: () => {},
            setIsFlippedVertical: () => {},
            setIsFlippedHorizontal: () => {},
            setSessionId: () => {},
            setIsAssistModeOn: () => {},
        };
        return <AppContext.Provider value={value as any}>{children}</AppContext.Provider>
    }

    return (
        <DummyProvider>
             <div className={cn(
                "h-dvh w-dvw p-8",
                state.isPrompterDarkMode ? 'bg-black' : 'bg-background'
            )}>
                <PrompterView />
            </div>
        </DummyProvider>
    );
}


export default function AssistPage() {
    return (
        <AppProvider>
            <AssistView />
        </AppProvider>
    )
}
