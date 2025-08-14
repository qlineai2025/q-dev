"use client";

import { useEffect, useRef } from 'react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';

export default function PrompterPanel() {
  const { script, fontSize, horizontalMargin, verticalMargin, isPlaying, scrollSpeed, activeLine } = useApp();
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
      <div
        ref={prompterRef}
        className="h-full overflow-y-scroll rounded-md border scroll-smooth"
        style={{
          paddingLeft: `${horizontalMargin}%`,
          paddingRight: `${horizontalMargin}%`,
        }}
    >
        <div className="flex min-h-full flex-col justify-center">
            <div style={{
              paddingTop: `${verticalMargin}vh`,
              paddingBottom: `${verticalMargin}vh`,
            }}>
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
    </main>
  );
}
