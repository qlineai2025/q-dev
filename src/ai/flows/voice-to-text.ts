'use server';

/**
 * @fileOverview Implements voice command processing for teleprompter control.
 *
 * - voiceToText - A function that processes voice commands to control the teleprompter.
 * - VoiceToTextInput - The input type for the voiceToText function.
 * - VoiceToTextOutput - The return type for the VoiceToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceToTextInputSchema = z.object({
  voiceCommand: z.string().describe('The voice command issued by the user.'),
  currentSpeed: z.number().describe('The current scrolling speed of the teleprompter.'),
});
export type VoiceToTextInput = z.infer<typeof VoiceToTextInputSchema>;

const VoiceToTextOutputSchema = z.object({
  action: z.enum(['start', 'stop', 'increaseSpeed', 'decreaseSpeed', 'noAction']).describe('The action to be performed based on the voice command.'),
  newSpeed: z.number().describe('The new scrolling speed of the teleprompter.'),
  explanation: z.string().describe('Explanation of what the flow did and why.'),
});
export type VoiceToTextOutput = z.infer<typeof VoiceToTextOutputSchema>;

export async function voiceToText(input: VoiceToTextInput): Promise<VoiceToTextOutput> {
  return voiceToTextFlow(input);
}

const voiceToTextPrompt = ai.definePrompt({
  name: 'voiceToTextPrompt',
  input: {schema: VoiceToTextInputSchema},
  output: {schema: VoiceToTextOutputSchema},
  prompt: `You are an AI teleprompter control assistant. You receive a voice command and the current scrolling speed.
Your task is to determine the appropriate action to take based on the voice command.

Possible actions are:
- start: Start the teleprompter scrolling.
- stop: Stop the teleprompter scrolling.
- increaseSpeed: Increase the scrolling speed.
- decreaseSpeed: Decrease the scrolling speed.
- noAction: No action is required.

Here is the voice command:
{{voiceCommand}}

Here is the current scrolling speed:
{{currentSpeed}}

Respond in a JSON format with the action to take, the new scrolling speed, and a brief explanation.
`,
});

const voiceToTextFlow = ai.defineFlow(
  {
    name: 'voiceToTextFlow',
    inputSchema: VoiceToTextInputSchema,
    outputSchema: VoiceToTextOutputSchema,
  },
  async input => {
    try {
      const {output} = await voiceToTextPrompt(input);

      // Ensure the newSpeed is within reasonable bounds.
      const newSpeed = Math.max(0, Math.min(100, output!.newSpeed));

      return {
        action: output!.action,
        newSpeed: newSpeed,
        explanation: output!.explanation,
      };
    } catch (e) {
      console.error('Error processing voice command:', e);
      return {
        action: 'noAction',
        newSpeed: input.currentSpeed,
        explanation: 'An error occurred during voice command processing.',
      };
    }
  }
);
