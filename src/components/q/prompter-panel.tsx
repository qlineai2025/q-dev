
"use client";

import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, Contrast, FlipVertical, FlipHorizontal, Rewind, ScreenShare } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from '../ui/slider';
import { useToast } from '@/hooks/use-toast';
import { IconButton } from '../ui/button';
import { Textarea } from '../ui/textarea';


export default function PrompterPanel() {
  const { 
    script, 
    setScript,
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
    isAssistModeOn,
    setIsAssistModeOn,
  } = useApp();
  const prompterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const [isBrightnessPopoverOpen, setIsBrightnessPopoverOpen] = useState(false);
  const { toast } = useToast();
  const assistWindowRef = useRef<Window | null>(null);

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
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]') || (e.target as HTMLElement).closest('textarea')) {
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

  const handleAssistModeToggle = () => {
    setIsAssistModeOn(!isAssistModeOn);
  };

  useEffect(() => {
    if (isAssistModeOn) {
      const prompterNode = prompterRef.current;
      if (prompterNode) {
        const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=no,toolbar=no,location=no');
        if (newWindow) {
          assistWindowRef.current = newWindow;
          const newDocument = newWindow.document;
          newDocument.title = "Q_ Assist Mode";
          newDocument.body.style.margin = '0';
          newDocument.body.style.overflow = 'hidden';
          newDocument.body.innerHTML = prompterNode.outerHTML;

          // Copy styles
          const stylesheets = Array.from(document.styleSheets);
          stylesheets.forEach(stylesheet => {
            if (stylesheet.href) {
              const link = newDocument.createElement('link');
              link.rel = 'stylesheet';
              link.href = stylesheet.href;
              newDocument.head.appendChild(link);
            } else if (stylesheet.cssRules) {
                try {
                  const style = newDocument.createElement('style');
                  Array.from(stylesheet.cssRules).forEach(rule => {
                    style.appendChild(newDocument.createTextNode(rule.cssText));
                  });
                  newDocument.head.appendChild(style);
                } catch (e) {
                    console.warn('Could not copy some CSS rules:', e);
                }
            }
          });
          
          const prompterMirror = newDocument.getElementById(prompterNode.id);
          if (prompterMirror) {
            prompterMirror.style.width = '100vw';
            prompterMirror.style.height = '100vh';
          }
        }
      }
    } else {
      if (assistWindowRef.current && !assistWindowRef.current.closed) {
        assistWindowRef.current.close();
        assistWindowRef.current = null;
      }
    }

    return () => {
        if (assistWindowRef.current && !assistWindowRef.current.closed) {
            assistWindowRef.current.close();
        }
    }
  }, [isAssistModeOn]);

  useEffect(() => {
    if (isAssistModeOn && assistWindowRef.current && !assistWindowRef.current.closed) {
      const prompterNode = prompterRef.current;
      if (prompterNode) {
        const prompterMirror = assistWindowRef.current.document.getElementById(prompterNode.id);
        if (prompterMirror) {
            prompterMirror.innerHTML = prompterNode.innerHTML;
            prompterMirror.className = prompterNode.className;
            prompterMirror.style.cssText = prompterNode.style.cssText;
            prompterMirror.scrollTop = prompterNode.scrollTop;
            assistWindowRef.current.document.body.style.backgroundColor = isPrompterDarkMode ? 'black' : 'hsl(var(--background))';

        }
      }
    }
  }, [script, fontSize, horizontalMargin, verticalMargin, isPlaying, scrollSpeed, activeLine, isPrompterDarkMode, prompterTextBrightness, isFlippedVertical, isFlippedHorizontal, isPrompterFullscreen]);


  const iconButtonClassName = cn(
    'text-primary/70 hover:text-primary',
    isPrompterDarkMode ? 'text-white/70 hover:text-white' : 'text-primary/70 hover:text-primary'
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
        id="prompter-main-view"
        ref={prompterRef}
        className={cn(
          "h-full overflow-y-scroll rounded-md border scroll-smooth text-center",
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
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className={cn(
                'w-full resize-none border-0 bg-transparent text-center focus-visible:ring-0 focus-visible:ring-offset-0',
                isPrompterDarkMode ? 'text-white/70 placeholder:text-white/40' : 'text-primary placeholder:text-primary/40'
              )}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: 1.5,
                color: activeLine !== null ? 'hsl(var(--accent))' : undefined,
                filter: isPrompterDarkMode ? `brightness(${prompterTextBrightness}%)` : 'none',
                minHeight: '100%',
              }}
              placeholder="Your script will appear here..."
            />
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
              if (e.target !== prompterRef.current) {
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
          tooltip="Assist Mode"
          onClick={(e) => {
            e.stopPropagation();
            handleAssistModeToggle();
          }}
          className={cn(iconButtonClassName, isAssistModeOn && 'bg-accent text-accent-foreground')}
        >
          <ScreenShare className="h-5 w-5" />
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
