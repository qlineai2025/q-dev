'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently indexing a script.
 * 
 * - intelligentScriptIndexing - A function that takes a script as input and returns an index of the script.
 * - IntelligentScriptIndexingInput - The input type for the intelligentScriptIndexing function.
 * - IntelligentScriptIndexingOutput - The return type for the intelligentScriptIndexing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentScriptIndexingInputSchema = z.object({
  script: z
    .string()
    .describe('The script to be indexed.'),
});

export type IntelligentScriptIndexingInput = z.infer<typeof IntelligentScriptIndexingInputSchema>;

const IntelligentScriptIndexingOutputSchema = z.array(
  z.object({
    lineNumber: z.number().describe('The line number in the script.'),
    summary: z.string().describe('A short summary of the content of the line.'),
  })
);

export type IntelligentScriptIndexingOutput = z.infer<typeof IntelligentScriptIndexingOutputSchema>;

export async function intelligentScriptIndexing(input: IntelligentScriptIndexingInput): Promise<IntelligentScriptIndexingOutput> {
  return intelligentScriptIndexingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentScriptIndexingPrompt',
  input: {schema: IntelligentScriptIndexingInputSchema},
  output: {schema: IntelligentScriptIndexingOutputSchema},
  prompt: `You are an expert script indexer. You will receive a script as input and will return a JSON array with line number and summary of each line.\n\nScript: {{{script}}}`,
});

const intelligentScriptIndexingFlow = ai.defineFlow(
  {
    name: 'intelligentScriptIndexingFlow',
    inputSchema: IntelligentScriptIndexingInputSchema,
    outputSchema: IntelligentScriptIndexingOutputSchema,
  },
  async input => {
    const scriptLines = input.script.split('\n');
    const lineSummaries: {lineNumber: number; summary: string}[] = [];

    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i];
      const lineNumber = i + 1;

      const {output} = await prompt({
        script: `Line ${lineNumber}: ${line}`,
      });
      lineSummaries.push({
        lineNumber: lineNumber,
        summary: output ? output[0].summary : `Line ${lineNumber}: ${line}`,
      });
    }

    return lineSummaries;
  }
);
