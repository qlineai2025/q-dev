
"use client";

import type { ComponentProps } from 'react';
import { useEffect, useRef } from 'react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';

interface PrompterViewProps {
  onPanelClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  isAssistMode?: boolean;
}

export default function PrompterView({ onPanelClick, isAssistMode = false }: PrompterViewProps) {
  const { 
    script, 
    fontSize, 
    horizontalMargin, 
    verticalMargin,
    isPlaying,
    scrollSpeed, 
    activeLine,
    isPrompterDarkMode,
    prompterTextBrightness,
    isFlippedVertical,
    isFlippedHorizontal,
  } = useApp();
  const prompterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const scriptLines = script.split('\n');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const prompterElement = prompterRef.current;

    if (isPlaying && prompterElement) {
      interval = setInterval(() => {
        prompterElement.scrollBy({ top: 1, behavior: 'auto' });
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

  const prompterTextColor = isAssistMode || isPrompterDarkMode ? 'text-white/90' : 'text-primary';

  return (
      <div
        id="prompter-main-view"
        ref={prompterRef}
        onClick={onPanelClick}
        className={cn(
          "h-full w-full overflow-y-scroll scroll-smooth text-center",
           isAssistMode ? "bg-black" : "rounded-md border",
          !isAssistMode && (isPrompterDarkMode ? 'bg-black' : 'bg-background')
        )}
        style={{
          paddingLeft: `${horizontalMargin}%`,
          paddingRight: `${horizontalMargin}%`,
          paddingTop: `${verticalMargin}vh`,
          paddingBottom: `${verticalMargin}vh`,
        }}
      >
        <div className={cn(
          "flex min-h-full flex-col",
           isFlippedVertical && 'transform-gpu scale-y-[-1]'
        )}>
            <div
              className={cn(isFlippedHorizontal && 'transform-gpu scale-x-[-1]')}
            >
              {scriptLines.map((line, index) => (
                <p
                  key={index}
                  ref={(el) => (lineRefs.current[index] = el)}
                  className={cn(
                    'w-full break-words',
                    prompterTextColor,
                    index === activeLine - 1 && '!text-accent'
                  )}
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.5,
                    filter: `brightness(${prompterTextBrightness}%)`,
                    minHeight: '1em', // Prevents empty lines from collapsing
                  }}
                >
                  {line || ' '}
                </p>
              ))}
            </div>
        </div>
      </div>
  )
}
