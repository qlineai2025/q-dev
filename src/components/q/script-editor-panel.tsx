
"use client";

import { Bot, Loader2, ChevronsUpDown } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Textarea } from '@/components/ui/textarea';
import { intelligentScriptIndexing } from '@/ai/flows/intelligent-script-indexing';
import { useToast } from '@/hooks/use-toast';
import IconButton from '@/components/q/icon-button';

export default function ScriptEditorPanel() {
  const { script, setScript, setIndexedScript, isLoadingIndex, setIsLoadingIndex, isScriptEditorExpanded, setIsScriptEditorExpanded } = useApp();
  const { toast } = useToast();

  const handleIndexScript = async () => {
    if (!script.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Script",
        description: "Cannot index an empty script.",
      });
      return;
    }
    setIsLoadingIndex(true);
    try {
      const result = await intelligentScriptIndexing({ script });
      setIndexedScript(result);
      toast({
        title: "Script Indexed",
        description: `Successfully indexed ${result.length} lines. You can now use the Index tab on the prompter.`,
      });
    } catch (error) {
      console.error("Failed to index script:", error);
      toast({
        variant: "destructive",
        title: "Indexing Failed",
        description: "Could not index the script. Please try again.",
      });
    } finally {
      setIsLoadingIndex(false);
    }
  };

  return (
    <aside className="relative h-full w-full flex-col border-border bg-card shadow-lg lg:border-t">
       <div className="absolute right-2 top-2 z-10 flex gap-2">
          <IconButton 
            tooltip={isScriptEditorExpanded ? "Collapse" : "Expand"} 
            onClick={() => setIsScriptEditorExpanded(!isScriptEditorExpanded)}
            >
             <ChevronsUpDown className="h-5 w-5" />
          </IconButton>
          <IconButton tooltip="Index with AI" onClick={handleIndexScript} disabled={isLoadingIndex || !script.trim()}>
            {isLoadingIndex ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Bot className="h-5 w-5" />
            )}
          </IconButton>
        </div>
      <Textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Write or paste your script here..."
        className="h-full w-full resize-none rounded-none border-0 bg-transparent p-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </aside>
  );
}
