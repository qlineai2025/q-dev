
"use client";

import { useEffect, useRef } from 'react';
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
import { Label } from '../ui/label';
import { Button } from '@/components/ui/button';

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
                    filter: `brightness(${prompterTextBrightness}%)`,
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
      <Popover>
          <PopoverTrigger asChild>
            <IconButton
              tooltip={isPrompterDarkMode ? "Light Mode" : "Dark Mode"}
              onClick={(e) => e.stopPropagation()}
              className={cn(isPrompterDarkMode && 'text-white hover:text-white')}
            >
              <Contrast className="h-5 w-5" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent 
            side="top" 
            align="end" 
            className="w-48 p-4"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className='space-y-2'>
                <Label htmlFor="brightness-slider">Brightness</Label>
                <Slider
                  id="brightness-slider"
                  value={[prompterTextBrightness]}
                  onValueChange={(value) => setPrompterTextBrightness(value[0])}
                  min={20}
                  max={100}
                  step={5}
                />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsPrompterDarkMode(!isPrompterDarkMode)}
              >
                {isPrompterDarkMode ? "Light Mode" : "Dark Mode"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <IconButton
          tooltip={isPrompterFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={(e) => {
            e.stopPropagation();
            setIsPrompterFullscreen(!isPrompterFullscreen)}
          }
           className={cn(isPrompterDarkMode && 'text-white hover:text-white')}
        >
          {isPrompterFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </IconButton>
      </div>
    </main>
  );
}
