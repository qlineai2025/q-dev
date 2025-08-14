
"use client";

import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
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
  Settings2,
  Check,
} from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Slider } from '@/components/ui/slider';
import AuthButton from '@/components/q/auth-button';
import { useVoiceControl } from '@/hooks/use-voice-control';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { IconButton } from '../ui/icon-button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  } = useApp();

  const { toast } = useToast();
  const { startListening, stopListening, error, audioDeviceId, setAudioDeviceId } = useVoiceControl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);

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

  const handleAudioSettingsClick = async () => {
    if (!isAudioSettingsOpen) {
      try {
        // Request permissions and get devices
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
        setAudioDevices(audioInputDevices);
      } catch (err) {
        console.error("Error getting audio devices:", err);
        toast({
            variant: "destructive",
            title: "Audio Permissions Error",
            description: "Could not access audio devices. Please grant microphone permissions in your browser settings.",
        });
        return;
      }
    }
    setIsAudioSettingsOpen(!isAudioSettingsOpen);
  };
  
  const handleDeviceSelect = (deviceId: string) => {
    setAudioDeviceId(deviceId);
    setIsAudioSettingsOpen(false);
    toast({
        title: "Audio Device Changed",
        description: "Your microphone has been updated.",
    });
  }

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

        <div className="my-2 flex items-center justify-center">
            <Button
                variant={isListening ? "destructive" : "default"}
                onClick={handleListenToggle}
                className="rounded-r-none bg-primary/90 hover:bg-primary/80"
            >
                {isListening ? (
                    <MicOff className="h-5 w-5" />
                ) : (
                    <Mic className="h-5 w-5" />
                )}
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="default"
              className="flex-1 justify-center rounded-none bg-primary/90 hover:bg-primary/80"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
             <Popover open={isAudioSettingsOpen} onOpenChange={setIsAudioSettingsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                        variant="default" 
                        size="icon" 
                        className="rounded-l-none bg-primary/90 hover:bg-primary/80"
                        onClick={handleAudioSettingsClick}
                    >
                        <Settings2 className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                    <div className="flex flex-col gap-1">
                        {audioDevices.length > 0 ? (
                            audioDevices.map(device => (
                                <Button
                                    key={device.deviceId}
                                    variant="ghost"
                                    className="w-full justify-start gap-2"
                                    onClick={() => handleDeviceSelect(device.deviceId)}
                                >
                                    <div className="w-4">
                                        {audioDeviceId === device.deviceId && <Check className="h-4 w-4" />}
                                    </div>
                                    <span className="truncate flex-1 text-left">
                                        {device.label || `Microphone ${audioDevices.indexOf(device) + 1}`}
                                    </span>
                                </Button>
                            ))
                        ) : (
                            <p className="p-2 text-sm text-muted-foreground">No audio devices found.</p>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
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
              orientation === 'vertical' ? 'flex-col-reverse justify-between h-full' : ''
            )}>
              <Slider 
                defaultValue={[value]} 
                value={[value]}
                orientation={orientation}
                className={cn(
                  orientation === 'vertical' ? 'w-2 flex-1' : 'flex-1'
                )}
                {...props} 
              />
              <div className="flex items-center justify-center h-8 w-8">{icon}</div>
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
