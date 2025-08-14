
"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Contrast } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';
import IconButton from './icon-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from '../ui/slider';

export default function PrompterPanel() {
  const { 
    script, 
    fontSize, 
    horizontalMargin, 
    verticalMargin, 
    isPlaying, 
    setIsPlaying, 
    scrollSpeed, 
    activeLine,
    isPrompterDarkMode,
    setIsPrompterDarkMode,
    isPrompterFullscreen,
    setIsPrompterFullscreen,
    prompterTextBrightness,
    setPrompterTextBrightness,
  } = useApp();
  const prompterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isBrightnessPopoverOpen, setIsBrightnessPopoverOpen] = useState(false);
  const isLongPress = useRef(false);


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
  
  const handlePanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle play/pause if the click is on the background, not on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleContrastInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isLongPress.current) {
        isLongPress.current = false;
        return;
    }
    setIsPrompterDarkMode(!isPrompterDarkMode);
  };
  
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsBrightnessPopoverOpen(true);
    }, 500);
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };


  return (
    <main 
      className={cn(
        "relative flex-1 p-4 bg-background",
        isPrompterFullscreen && 'h-dvh w-dvw p-8'
      )}
      onClick={handlePanelClick}
    >
      <div
        ref={prompterRef}
        className={cn(
          "h-full cursor-pointer overflow-y-scroll rounded-md border scroll-smooth",
          isPrompterDarkMode ? 'bg-black' : 'bg-background',
        )}
        style={{
          paddingLeft: `${horizontalMargin}%`,
          paddingRight: `${horizontalMargin}%`,
          filter: !isPrompterDarkMode ? `brightness(${prompterTextBrightness}%)` : 'none',
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
                     isPrompterDarkMode ? 'text-white' : 'text-primary'
                )}
                style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.5,
                    marginBottom: `${fontSize * 0.5}px`,
                    filter: isPrompterDarkMode ? `brightness(${prompterTextBrightness}%)` : 'none',
                    color: activeLine === index + 1 ? 'hsl(var(--accent))' : undefined,
                }}
                >
                {line || '\u00A0'}{/* Non-breaking space for empty lines */}
                </p>
            ))}
            </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <Popover open={isBrightnessPopoverOpen} onOpenChange={setIsBrightnessPopoverOpen}>
          <PopoverTrigger asChild>
            <IconButton
              tooltip="Click: Toggle Dark Mode, Long-press: Brightness"
              onClick={handleContrastInteraction}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
              className={cn(isPrompterDarkMode && 'text-white hover:text-white bg-transparent hover:bg-white/10')}
            >
              <Contrast className="h-5 w-5" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            className="w-48 p-4 border-none bg-black/50 backdrop-blur-sm"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
              <Slider
                value={[prompterTextBrightness]}
                onValueChange={(value) => setPrompterTextBrightness(value[0])}
                min={20}
                max={100}
                step={5}
                className="[&>span]:bg-white/20 [&>span>span]:bg-white"
              />
          </PopoverContent>
        </Popover>
        <IconButton
          tooltip={isPrompterFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={(e) => {
            e.stopPropagation();
            setIsPrompterFullscreen(!isPrompterFullscreen)}
          }
           className={cn(isPrompterDarkMode && 'text-white hover:text-white bg-transparent hover:bg-white/10')}
        >
          {isPrompterFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </IconButton>
      </div>
    </main>
  );
}
