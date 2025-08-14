
"use client";
import { useApp } from '@/hooks/use-app';
import ScriptEditorPanel from '@/components/q/script-editor-panel';
import PrompterPanel from '@/components/q/prompter-panel';
import ControlsPanel from '@/components/q/controls-panel';
import { cn } from '@/lib/utils';


export function AppStateContainer() {
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
        <div className={cn(
          "flex-none transition-all duration-300 ease-in-out",
          isScriptEditorExpanded ? "h-[40vh]" : "h-[8vh]"
        )}>
          <ScriptEditorPanel />
        </div>
      </div>
  )
}
