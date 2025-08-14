
"use client";

import { useRef } from 'react';
import { Bot, FileUp, Loader2, BookText, Pencil } from 'lucide-react';
import { useApp } from '@/hooks/use-app';
import { Textarea } from '@/components/ui/textarea';
import Logo from '@/components/q/logo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { intelligentScriptIndexing } from '@/ai/flows/intelligent-script-indexing';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import IndexedScriptView from './indexed-script-view';

export default function ScriptEditorPanel() {
  const { script, setScript, indexedScript, setIndexedScript, isLoadingIndex, setIsLoadingIndex } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setScript(text);
      };
      reader.readAsText(file);
    }
  };

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
        description: `Successfully indexed ${result.length} lines. You can now use the Index tab.`,
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
    <aside className="flex h-[40vh] w-full flex-col border-border bg-card p-4 shadow-lg lg:h-auto lg:border-t">
      <div className="flex items-center justify-between p-2">
        <Logo />
      </div>

      <Tabs defaultValue="editor" className="mt-4 flex flex-1 flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">
            <Pencil className="mr-2 h-4 w-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="index" disabled={!indexedScript}>
            <BookText className="mr-2 h-4 w-4" />
            Index
          </TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="flex-1 mt-2 rounded-md border">
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write or paste your script here..."
            className="h-full w-full resize-none border-0 bg-transparent p-2 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </TabsContent>
        <TabsContent value="index" className="flex-1 mt-2 overflow-hidden rounded-md border">
          {indexedScript ? (
            <IndexedScriptView indexedScript={indexedScript} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <BookText className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Index Your Script</h3>
                <p className="text-sm">Click the "Index with AI" button below to generate a clickable summary of your script.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Separator className="my-4" />

      <div className="flex flex-col gap-2">
         <Button onClick={handleIndexScript} disabled={isLoadingIndex || !script.trim()}>
          {isLoadingIndex ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Bot className="mr-2 h-4 w-4" />
          )}
          Index with AI
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Import from File
        </Button>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Google Drive import coming soon
        </div>
      </div>
    </aside>
  );
}
