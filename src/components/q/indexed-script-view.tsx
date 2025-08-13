
"use client";

import type { IntelligentScriptIndexingOutput } from '@/ai/flows/intelligent-script-indexing';
import { useApp } from '@/hooks/use-app';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { List } from 'lucide-react';

interface IndexedScriptViewProps {
  indexedScript: IntelligentScriptIndexingOutput;
}

export default function IndexedScriptView({ indexedScript }: IndexedScriptViewProps) {
  const { setActiveLine, activeLine } = useApp();

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {indexedScript.map((item) => (
            <Button
              key={item.lineNumber}
              variant={activeLine === item.lineNumber ? "secondary" : "ghost"}
              className="h-auto w-full justify-start text-left"
              onClick={() => setActiveLine(item.lineNumber)}
            >
              <div className="flex items-start gap-3 py-2">
                <span className="font-mono text-xs text-muted-foreground w-6 text-right pt-0.5">
                  {item.lineNumber}
                </span>
                <p className="flex-1 text-sm text-foreground whitespace-normal leading-snug">
                  {item.summary}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
