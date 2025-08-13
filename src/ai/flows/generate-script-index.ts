'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a script index with timestamps, enhancing the teleprompter's automatic scrolling feature.
 *
 * - generateScriptIndex - A function that takes a script as input and returns an index of the script with estimated timestamps.
 * - GenerateScriptIndexInput - The input type for the generateScriptIndex function.
 * - GenerateScriptIndexOutput - The return type for the generateScriptIndex function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScriptIndexInputSchema = z.object({
  script: z
    .string()
    .describe('The script to be indexed.'),
  estimatedWordsPerMinute: z.number().describe('The estimated words per minute the user will speak.'),
});

export type GenerateScriptIndexInput = z.infer<typeof GenerateScriptIndexInputSchema>;

const GenerateScriptIndexOutputSchema = z.array(
  z.object({
    lineNumber: z.number().describe('The line number in the script.'),
    summary: z.string().describe('A short summary of the content of the line.'),
    estimatedTime: z.number().describe('Estimated time in seconds when this line should be spoken.'),
  })
);

export type GenerateScriptIndexOutput = z.infer<typeof GenerateScriptIndexOutputSchema>;

export async function generateScriptIndex(input: GenerateScriptIndexInput): Promise<GenerateScriptIndexOutput> {
  return generateScriptIndexFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateScriptIndexPrompt',
  input: {schema: GenerateScriptIndexInputSchema},
  output: {schema: GenerateScriptIndexOutputSchema},
  prompt: `You are an expert script indexer. You will receive a script as input and will return a JSON array with line number, summary of each line, and estimated time in seconds when that line should be spoken, based on the estimated words per minute.

Script: {{{script}}}
Estimated Words Per Minute: {{{estimatedWordsPerMinute}}}

Example:
[{
  "lineNumber": 1,
  "summary": "Introduction to the topic.",
  "estimatedTime": 0
},
{
  "lineNumber": 2,
  "summary": "Explaining the first point.",
  "estimatedTime": 15
}]

Ensure the estimatedTime is cumulative.
`, 
});

const generateScriptIndexFlow = ai.defineFlow(
  {
    name: 'generateScriptIndexFlow',
    inputSchema: GenerateScriptIndexInputSchema,
    outputSchema: GenerateScriptIndexOutputSchema,
  },
  async input => {
    const scriptLines = input.script.split('\n');
    const lineSummaries: {lineNumber: number; summary: string; estimatedTime: number}[] = [];
    let cumulativeTime = 0;

    for (let i = 0; i < scriptLines.length; i++) {
      const line = scriptLines[i];
      const lineNumber = i + 1;

      // Estimate the time it will take to speak this line
      const wordCount = line.split(' ').length;
      const estimatedTimeForLine = (wordCount / input.estimatedWordsPerMinute) * 60; // Convert minutes to seconds
      cumulativeTime += estimatedTimeForLine;

      const {output} = await prompt({
        ...input,
        script: `Line ${lineNumber}: ${line}`,
      });

      lineSummaries.push({
        lineNumber: lineNumber,
        summary: output ? output[0].summary : `Line ${lineNumber}: ${line}`,
        estimatedTime: cumulativeTime, // Cumulative time for each line
      });
    }

    return lineSummaries;
  }
);
