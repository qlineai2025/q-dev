'use server';
/**
 * @fileOverview Implements voice command recognition for script editing.
 *
 * - voiceCommandScriptEditing - A function that handles voice commands for script editing.
 * - VoiceCommandScriptEditingInput - The input type for the voiceCommandScriptEditing function.
 * - VoiceCommandScriptEditingOutput - The return type for the voiceCommandScriptEditing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceCommandScriptEditingInputSchema = z.object({
  script: z.string().describe('The current script content.'),
  voiceCommand: z.string().describe('The voice command issued by the user.'),
});
export type VoiceCommandScriptEditingInput = z.infer<typeof VoiceCommandScriptEditingInputSchema>;

const VoiceCommandScriptEditingOutputSchema = z.object({
  editedScript: z.string().describe('The script content after applying the voice command.'),
  commandExecuted: z.boolean().describe('Whether the voice command was successfully executed.'),
  explanation: z.string().describe('Explanation of what the flow did and why.'),
});
export type VoiceCommandScriptEditingOutput = z.infer<typeof VoiceCommandScriptEditingOutputSchema>;

export async function voiceCommandScriptEditing(input: VoiceCommandScriptEditingInput): Promise<VoiceCommandScriptEditingOutput> {
  return voiceCommandScriptEditingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'voiceCommandScriptEditingPrompt',
  input: {schema: VoiceCommandScriptEditingInputSchema},
  output: {schema: VoiceCommandScriptEditingOutputSchema},
  prompt: `You are an AI script editor. You receive a script and a voice command.
Your task is to apply the voice command to the script and return the edited script.
If the command is not related to script editing, return the original script and set commandExecuted to false.

Here is the script:
{{script}}

Here is the voice command:
{{voiceCommand}}`,
});

const voiceCommandScriptEditingFlow = ai.defineFlow(
  {
    name: 'voiceCommandScriptEditingFlow',
    inputSchema: VoiceCommandScriptEditingInputSchema,
    outputSchema: VoiceCommandScriptEditingOutputSchema,
  },
  async input => {
    try {
      // Basic command processing logic (can be expanded with more sophisticated NLP techniques)
      let editedScript = input.script;
      let commandExecuted = false;
      let explanation = 'No command was executed.';

      if (input.voiceCommand.startsWith('insert')) {
        const insertionText = input.voiceCommand.substring(7).trim(); // Extract text after "insert"
        editedScript = insertionText + ' ' + input.script;
        commandExecuted = true;
        explanation = `Inserted "${insertionText}" at the beginning of the script.`;
      } else if (input.voiceCommand.startsWith('delete')) {
        editedScript = '';
        commandExecuted = true;
        explanation = 'Deleted the entire script.';
      } else if (input.voiceCommand.startsWith('replace')) {
          const parts = input.voiceCommand.substring(8).trim().split(" with ");

          if(parts.length === 2) {
            const textToReplace = parts[0].trim();
            const replacementText = parts[1].trim();

            editedScript = input.script.replace(textToReplace, replacementText);
            commandExecuted = true;
            explanation = `Replaced "${textToReplace}" with "${replacementText}".`;
          } else {
            explanation = "Invalid replace command format. Please use 'replace <text> with <replacement>'.";
          }
      }

      const {output} = await prompt(input);

      return {
        editedScript: editedScript,
        commandExecuted: commandExecuted,
        explanation: explanation,
      };
    } catch (e) {
      console.error('Error during script editing:', e);
      return {
        editedScript: input.script,
        commandExecuted: false,
        explanation: 'An error occurred during script editing.',
      };
    }
  }
);
