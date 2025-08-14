import { AppProvider } from '@/contexts/app-provider';
import ScriptEditorPanel from '@/components/q/script-editor-panel';
import PrompterPanel from '@/components/q/prompter-panel';
import ControlsPanel from '@/components/q/controls-panel';
import { Toaster } from '@/components/ui/toaster';
import { AppStateContainer } from '@/contexts/app-state-container';

export default function Home() {
  return (
    <AppProvider>
      <AppStateContainer />
      <Toaster />
    </AppProvider>
  );
}
