'use server';

/**
 * @fileOverview This file defines a Genkit flow for automatically adjusting the scrolling speed of a teleprompter based on the user's speaking pace.
 *
 * - automaticScrollingAdjustment - A function that takes the current script, the user's spoken words, and the current scrolling speed as input, and returns an adjusted scrolling speed.
 * - AutomaticScrollingAdjustmentInput - The input type for the automaticScrollingAdjustment function.
 * - AutomaticScrollingAdjustmentOutput - The return type for the automaticScrollingAdjustment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticScrollingAdjustmentInputSchema = z.object({
  script: z.string().describe('The current script in the teleprompter.'),
  spokenWords: z.string().describe('The words spoken by the user.'),
  currentSpeed: z.number().describe('The current scrolling speed of the teleprompter.'),
});

export type AutomaticScrollingAdjustmentInput = z.infer<typeof AutomaticScrollingAdjustmentInputSchema>;

const AutomaticScrollingAdjustmentOutputSchema = z.object({
  adjustedSpeed: z.number().describe('The adjusted scrolling speed for the teleprompter.'),
  explanation: z.string().describe('Explanation of why the speed was adjusted.'),
});

export type AutomaticScrollingAdjustmentOutput = z.infer<typeof AutomaticScrollingAdjustmentOutputSchema>;

export async function automaticScrollingAdjustment(input: AutomaticScrollingAdjustmentInput): Promise<AutomaticScrollingAdjustmentOutput> {
  return automaticScrollingAdjustmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticScrollingAdjustmentPrompt',
  input: {schema: AutomaticScrollingAdjustmentInputSchema},
  output: {schema: AutomaticScrollingAdjustmentOutputSchema},
  prompt: `You are an AI teleprompter speed adjuster. You will receive the current script, the words spoken by the user, and the current scrolling speed.
Your task is to analyze the spoken words in relation to the script and determine if the scrolling speed needs to be adjusted.

Here is the current script:
{{script}}

Here are the words spoken by the user:
{{spokenWords}}

Here is the current scrolling speed:
{{currentSpeed}}

Consider the following:
- If the user is ahead of the script, increase the scrolling speed.
- If the user is behind the script, decrease the scrolling speed.
- If the user is at the correct pace, maintain the current scrolling speed.
- Make small adjustments to the speed.
- Do not increase/decrease the speed by more than 25% of the current speed.
`,
});

const automaticScrollingAdjustmentFlow = ai.defineFlow(
  {
    name: 'automaticScrollingAdjustmentFlow',
    inputSchema: AutomaticScrollingAdjustmentInputSchema,
    outputSchema: AutomaticScrollingAdjustmentOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error during scrolling speed adjustment:', e);
      return {
        adjustedSpeed: input.currentSpeed,
        explanation: 'An error occurred during scrolling speed adjustment.',
      };
    }
  }
);
