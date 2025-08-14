
"use client";

import { useState } from 'react';
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
import { AssistWindow } from './assist-window';
import PrompterView from './prompter-view';


export default function PrompterPanel() {
  const { 
    isPlaying, 
    setIsPlaying, 
    activeLine,
    setActiveLine,
    isPrompterFullscreen,
    setIsPrompterFullscreen,
    isFlippedVertical,
    setIsFlippedVertical,
    isFlippedHorizontal,
    setIsFlippedHorizontal,
    isAssistModeOn,
    setIsAssistModeOn,
  } = useApp();

  const [isBrightnessPopoverOpen, setIsBrightnessPopoverOpen] = useState(false);
  const { toast } = useToast();
  
  const handlePanelClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only toggle play/pause if the click is on the background, not on buttons or popovers
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
      return;
    }
    setIsPlaying(!isPlaying);
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
  
  const prompterContent = <PrompterView onPanelClick={handlePanelClick} />;

  return (
    <main 
      className={cn(
        "relative flex-1 p-4 bg-background",
        isPrompterFullscreen && 'h-dvh w-dvw p-8'
      )}
    >
      {prompterContent}
      
       {isAssistModeOn && (
        <AssistWindow onClose={() => setIsAssistModeOn(false)}>
            <PrompterView isAssistMode={true} />
        </AssistWindow>
      )}
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <IconButton
          tooltip="Rewind to Top"
          onClick={(e) => {
            e.stopPropagation();
            handleRewind();
          }}
          className="text-primary/70 hover:text-primary"
        >
          <Rewind className="h-5 w-5" />
        </IconButton>
        <Popover open={isBrightnessPopoverOpen} onOpenChange={setIsBrightnessPopoverOpen}>
          <PopoverTrigger asChild>
              <IconButton
                tooltip="Click: Toggle Dark Mode, Long-press: Brightness"
                className="text-primary/70 hover:text-primary"
              >
                <Contrast className="h-5 w-5" />
              </IconButton>
          </PopoverTrigger>
          <PopoverContent 
            side="left" 
            align="center" 
            className="w-auto border-none bg-transparent shadow-none p-4"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
             onInteractOutside={(e) => {
                e.preventDefault();
            }}
          >
          </PopoverContent>
        </Popover>
        <IconButton
          tooltip="Flip Horizontal"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlippedHorizontal(!isFlippedHorizontal);
          }}
          className="text-primary/70 hover:text-primary"
        >
          <FlipHorizontal className="h-5 w-5" />
        </IconButton>
         <IconButton
          tooltip="Flip Vertically"
          onClick={(e) => {
            e.stopPropagation();
            setIsFlippedVertical(!isFlippedVertical);
          }}
          className="text-primary/70 hover:text-primary"
        >
          <FlipVertical className="h-5 w-5" />
        </IconButton>
        <IconButton
          tooltip="Assist Mode"
          onClick={(e) => {
            e.stopPropagation();
            handleAssistModeToggle();
          }}
          className={cn("text-primary/70 hover:text-primary", isAssistModeOn && 'bg-accent text-accent-foreground')}
        >
          <ScreenShare className="h-5 w-5" />
        </IconButton>
        <IconButton
          tooltip={isPrompterFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={(e) => {
            e.stopPropagation();
            setIsPrompterFullscreen(!isPrompterFullscreen)}
          }
           className="text-primary/70 hover:text-primary"
        >
          {isPrompterFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </IconButton>
      </div>
    </main>
  );
}
