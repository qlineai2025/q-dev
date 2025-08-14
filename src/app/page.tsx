
"use client";

import { AppProvider } from '@/contexts/app-provider';
import ScriptEditorPanel from '@/components/q/script-editor-panel';
import PrompterPanel from '@/components/q/prompter-panel';
import ControlsPanel from '@/components/q/controls-panel';
import { Toaster } from '@/components/ui/toaster';
import { AppStateContainer } from '@/contexts/app-state-container';
import { useApp } from '@/hooks/use-app';
import { cn } from '@/lib/utils';

function MainContent() {
  const { isScriptEditorExpanded, isPrompterFullscreen } = useApp();

  if (isPrompterFullscreen) {
    return <PrompterPanel />;
  }

  return (
    <div className="flex h-dvh w-full flex-col bg-background font-body">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full w-full flex-col lg:flex-row">
          <ControlsPanel />
          <PrompterPanel />
        </div>
      </div>
      <div
        className={cn(
          'flex-none transition-all duration-300 ease-in-out',
          isScriptEditorExpanded ? 'h-[40vh]' : 'h-[8vh]'
        )}
      >
        <ScriptEditorPanel />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <MainContent />
      <Toaster />
    </AppProvider>
  );
}
