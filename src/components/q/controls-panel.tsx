
"use client";

import { useEffect, useRef } from 'react';
import {
  Type,
  Play,
  Pause,
  Mic,
  MicOff,
  MoveHorizontal,
  Timer,
  FileUp
} from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import IconButton from '@/components/q/icon-button';
import AuthButton from '@/components/q/auth-button';
import { useVoiceControl } from '@/hooks/use-voice-control';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';

export default function ControlsPanel() {
  const {
    fontSize,
    setFontSize,
    scrollSpeed,
    setScrollSpeed,
    margin,
    setMargin,
    isPlaying,
    setIsPlaying,
    isListening,
    setIsListening,
    setScript,
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


  return (
    <aside className="w-full border-border bg-card p-4 shadow-lg lg:h-full lg:w-[320px] lg:border-r">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-end p-2">
            <AuthButton />
        </div>

        <div className="my-6 flex justify-center gap-4">
          <IconButton
            tooltip={isPlaying ? 'Pause' : 'Play'}
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-16 w-16 bg-primary/10 text-primary hover:bg-primary/20"
            size="lg"
            >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </IconButton>
          <IconButton
            tooltip={isListening ? 'Stop Listening' : 'Use Voice Commands'}
            onClick={handleListenToggle}
            size="lg"
            className={`h-16 w-16 text-foreground ${
              isListening ? 'bg-destructive/80 text-destructive-foreground hover:bg-destructive' : 'bg-secondary hover:bg-accent/50'
            }`}
          >
            {isListening ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </IconButton>
        </div>

        <div className="flex flex-1 flex-col gap-8 px-2">
          <ControlSlider
            label="Font Size"
            icon={<Type className="h-5 w-5" />}
            value={fontSize}
            onValueChange={(val) => setFontSize(val[0])}
            min={12}
            max={200}
            step={1}
          />
          <ControlSlider
            label="Scroll Speed"
            icon={<Timer className="h-5 w-5" />}
            value={scrollSpeed}
            onValueChange={(val) => setScrollSpeed(val[0])}
            min={1}
            max={100}
            step={1}
          />
          <ControlSlider
            label="Margins"
            icon={<MoveHorizontal className="h-5 w-5" />}
            value={margin}
            onValueChange={(val) => setMargin(val[0])}
            min={0}
            max={45}
            step={1}
          />
           <div className="mt-auto pt-8">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="mr-2 h-4 w-4" />
              Import from File
            </Button>
          </div>
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
}

function ControlSlider({ label, icon, value, ...props }: ControlSliderProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <Label>{label}</Label>
        <span className="ml-auto text-foreground font-mono text-base">{value}</span>
      </div>
      <Slider defaultValue={[value]} value={[value]} {...props} />
    </div>
  );
}
