import { AppProvider } from '@/contexts/app-provider';
import ScriptEditorPanel from '@/components/q/script-editor-panel';
import PrompterPanel from '@/components/q/prompter-panel';
import ControlsPanel from '@/components/q/controls-panel';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex h-dvh w-full flex-col bg-background font-body">
        <div className="flex flex-1 overflow-hidden">
          <div className="flex w-full flex-col lg:flex-row">
            <ControlsPanel />
            <PrompterPanel />
          </div>
        </div>
        <ScriptEditorPanel />
      </div>
      <Toaster />
    </AppProvider>
  );
}
