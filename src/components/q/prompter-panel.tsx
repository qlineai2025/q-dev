
"use client";

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Contrast, FlipVertical, FlipHorizontal, Rewind } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';
import IconButton from '@/components/q/icon-button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from '../ui/slider';
import { useToast } from '@/hooks/use-toast';

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
    setActiveLine,
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
  } = useApp();
  const prompterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isBrightnessPopoverOpen, setIsBrightnessPopoverOpen] = useState(false);
  const { toast } = useToast();
  
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
    // Only toggle play/pause if the click is on the background, not on buttons or popovers
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[role="dialog"]') || (e.target as HTMLElement).closest('[role="tooltip"]')) {
      return;
    }
    setIsPlaying(!isPlaying);
  };
  
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    longPressTimer.current = setTimeout(() => {
      setIsBrightnessPopoverOpen(true);
      longPressTimer.current = undefined;
    }, 500);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
      // Only toggle dark mode on a short click
      setIsPrompterDarkMode(prev => !prev);
    }
  };

  const handleRewind = () => {
    setActiveLine(1);
    toast({
      title: "Rewind",
      description: "Returned to the beginning of the script.",
    });
  };

  const iconButtonClassName = cn(
    'text-primary/70 hover:text-primary',
    isPrompterDarkMode && 'text-white/70 hover:text-white'
  );


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
          "h-full cursor-pointer overflow-y-scroll rounded-md border scroll-smooth text-center",
          isPrompterDarkMode ? 'bg-black' : 'bg-background',
        )}
        style={{
          paddingLeft: `${horizontalMargin}%`,
          paddingRight: `${horizontalMargin}%`,
          paddingTop: `${verticalMargin}vh`,
          paddingBottom: `${verticalMargin}vh`,
          filter: !isPrompterDarkMode ? `brightness(${prompterTextBrightness}%)` : 'none',
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
                    'transition-colors duration-300',
                     isPrompterDarkMode ? 'text-white/70' : 'text-primary',
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
        <IconButton
          tooltip="Rewind to Top"
          onClick={(e) => {
            e.stopPropagation();
            handleRewind();
          }}
          className={iconButtonClassName}
        >
          <Rewind className="h-5 w-5" />
        </IconButton>
        <Popover open={isBrightnessPopoverOpen} onOpenChange={setIsBrightnessPopoverOpen}>
          <PopoverTrigger asChild>
            <div
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              role="button"
              aria-label="Brightness and color mode control"
              className="contents"
            >
              <IconButton
                tooltip="Click: Toggle Dark Mode, Long-press: Brightness"
                className={iconButtonClassName}
              >
                <Contrast className="h-5 w-5" />
              </IconButton>
            </div>
          </PopoverTrigger>
          <PopoverContent 
            side="left" 
            align="center" 
            className="w-auto border-none bg-transparent shadow-none p-4"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
             onInteractOutside={(e) => {
              if ((e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
                e.preventDefault();
              }
            }}
          >
            <div className="h-32">
              <Slider
                value={[prompterTextBrightness]}
                onValueChange={(value) => setPrompterTextBrightness(value[0])}
                min={20}
                max={100}
                step={5}
                orientation="vertical"
                className="[&>span]:bg-white/20 [&>span>span]:bg-white"
              />
            </div>
          </PopoverContent>
        </Popover>
        <IconButton
          tooltip="Flip Horizontal"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlippedHorizontal(!isFlippedHorizontal);
          }}
          className={iconButtonClassName}
        >
          <FlipHorizontal className="h-5 w-5" />
        </IconButton>
         <IconButton
          tooltip="Flip Vertically"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlippedVertical(!isFlippedVertical);
          }}
          className={iconButtonClassName}
        >
          <FlipVertical className="h-5 w-5" />
        </IconButton>
        <IconButton
          tooltip={isPrompterFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={(e) => {
            e.stopPropagation();
            setIsPrompterFullscreen(!isPrompterFullscreen)}
          }
           className={iconButtonClassName}
        >
          {isPrompterFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </IconButton>
      </div>
    </main>
  );
}
