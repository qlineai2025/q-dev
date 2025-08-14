"use client";

import { useEffect, useRef } from 'react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookText, Clapperboard } from 'lucide-react';
import IndexedScriptView from './indexed-script-view';

export default function PrompterPanel() {
  const { script, fontSize, margin, isPlaying, scrollSpeed, activeLine, indexedScript } = useApp();
  const prompterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const scriptLines = script.split('\n');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const prompterElement = prompterRef.current;

    if (isPlaying && prompterElement) {
      interval = setInterval(() => {
        prompterElement.scrollBy({ top: 1, behavior: 'smooth' });
      }, 120 - scrollSpeed); // Adjust timing based on speed
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, scrollSpeed]);
  
  useEffect(() => {
    if (activeLine !== null && lineRefs.current[activeLine - 1]) {
      lineRefs.current[activeLine - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLine]);


  return (
    <main className="flex-1 overflow-hidden bg-background p-4">
        <Tabs defaultValue="prompter" className="flex h-full flex-col">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompter">
                    <Clapperboard className="mr-2 h-4 w-4" />
                    Prompter
                </TabsTrigger>
                <TabsTrigger value="index" disabled={!indexedScript}>
                    <BookText className="mr-2 h-4 w-4" />
                    Index
                </TabsTrigger>
            </TabsList>
            <TabsContent value="prompter" className="flex-1 mt-2 overflow-hidden rounded-md border">
                <div
                    ref={prompterRef}
                    className="h-full overflow-y-scroll scroll-smooth"
                    style={{
                    paddingLeft: `${margin}%`,
                    paddingRight: `${margin}%`,
                    }}
                >
                    <div className="flex min-h-full flex-col justify-center">
                        <div className="py-[50vh]">
                        {scriptLines.map((line, index) => (
                            <p
                            key={index}
                            ref={(el) => (lineRefs.current[index] = el)}
                            className={cn(
                                'transition-colors duration-300',
                                activeLine === index + 1 ? 'text-accent' : 'text-primary'
                            )}
                            style={{
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.5,
                                marginBottom: `${fontSize * 0.5}px`,
                            }}
                            >
                            {line || '\u00A0'}{/* Non-breaking space for empty lines */}
                            </p>
                        ))}
                        </div>
                    </div>
                </div>
            </TabsContent>
             <TabsContent value="index" className="flex-1 mt-2 overflow-hidden rounded-md border">
                {indexedScript ? (
                    <IndexedScriptView indexedScript={indexedScript} />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                        <BookText className="h-12 w-12 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">Index Your Script</h3>
                        <p className="text-sm">Use the "Index with AI" button in the script editor to generate a clickable summary.</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    </main>
  );
}
