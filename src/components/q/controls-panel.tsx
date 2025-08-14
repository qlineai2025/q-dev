
"use client";

import { useEffect, useRef } from 'react';
import {
  Type,
  Play,
  Pause,
  Mic,
  MicOff,
  MoveHorizontal,
  MoveVertical,
  Timer,
  FileUp,
  Rewind,
} from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Slider } from '@/components/ui/slider';
import IconButton from '@/components/q/icon-button';
import AuthButton from '@/components/q/auth-button';
import { useVoiceControl } from '@/hooks/use-voice-control';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ControlsPanel() {
  const {
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    horizontalMargin,
    setHorizontalMargin,
    verticalMargin,
    setVerticalMargin,
    isPlaying,
    setIsPlaying,
    isListening,
    setIsListening,
    setScript,
    setActiveLine,
  } = useApp();

  const { toast } = useToast();
  const { startListening, stopListening, error } = useVoiceControl();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Voice Control Error',
        description: error,
      });
      setIsListening(false);
    }
  }, [error, toast, setIsListening]);
  
  const handleListenToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: 'Voice commands are now active.',
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScript(text);
        toast({
          title: "File Imported",
          description: "The script has been loaded into the editor.",
        });
      };
      reader.readAsText(file);
    }
  };

  const handleRewind = () => {
    setActiveLine(1);
    toast({
      title: "Rewind",
      description: "Returned to the beginning of the script.",
    });
  };

  return (
    <aside className="w-full border-border bg-background p-4 shadow-lg lg:h-full lg:w-[200px] lg:border-r">
      <div className="flex h-full flex-col">
        <div className="flex w-full items-center rounded-md border">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.md"
          />
          <Button
            variant="ghost"
            className="flex-1 justify-start rounded-r-none border-r"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <AuthButton />
        </div>

        <div className="my-2 flex items-center justify-center rounded-md border">
            <IconButton
              tooltip="Rewind to Top"
              onClick={handleRewind}
              className="rounded-r-none border-r"
            >
              <Rewind className="h-5 w-5" />
            </IconButton>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="ghost"
              className="flex-1 justify-start rounded-none border-r"
            >
              {isPlaying ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <IconButton
              tooltip={isListening ? 'Stop Listening' : 'Use Voice Commands'}
              onClick={handleListenToggle}
              className={cn(
                'rounded-l-none',
                 isListening ? 'bg-destructive/80 text-destructive-foreground hover:bg-destructive' : ''
              )}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </IconButton>
        </div>
        <div className="flex flex-1 items-center justify-center gap-4 px-2 pt-4">
          <ControlSlider
            label="Font Size"
            icon={<Type className="h-5 w-5" />}
            value={fontSize}
            onValueChange={(val) => setFontSize(val[0])}
            min={12}
            max={200}
            step={1}
            orientation="vertical"
          />
          <ControlSlider
            label="Scroll Speed"
            icon={<Timer className="h-5 w-5" />}
            value={scrollSpeed}
            onValueChange={(val) => setScrollSpeed(val[0])}
            min={1}
            max={100}
            step={1}
            orientation="vertical"
          />
          <ControlSlider
            label="Horizontal Margin"
            icon={<MoveHorizontal className="h-5 w-5" />}
            value={horizontalMargin}
            onValueChange={(val) => setHorizontalMargin(val[0])}
            min={0}
            max={45}
            step={1}
            orientation="vertical"
          />
          <ControlSlider
            label="Vertical Margin"
            icon={<MoveVertical className="h-5 w-5" />}
            value={verticalMargin}
            onValueChange={(val) => setVerticalMargin(val[0])}
            min={0}
            max={50}
            step={1}
            orientation="vertical"
          />
        </div>
      </div>
    </aside>
  );
}

interface ControlSliderProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  orientation?: "horizontal" | "vertical";
}

function ControlSlider({ label, icon, value, orientation = "horizontal", ...props }: ControlSliderProps) {
  return (
    <div className={cn(
      "grid gap-3",
      orientation === 'vertical' ? 'flex-1 flex flex-col items-center justify-center h-full' : ''
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium text-muted-foreground",
                orientation === 'vertical' ? 'flex-col h-full' : ''
              )}>
                {icon}
                <Slider 
                  defaultValue={[value]} 
                  value={[value]}
                  orientation={orientation}
                  className={cn(
                    orientation === 'vertical' ? 'w-2 flex-1' : 'flex-1'
                  )}
                  {...props} 
                />
              </div>
          </TooltipTrigger>
          <TooltipContent side={orientation === 'vertical' ? 'right' : 'bottom'}>
            <p>{label}: {value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
