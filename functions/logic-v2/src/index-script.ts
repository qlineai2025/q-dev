import { genkit, z } from 'genkit';
import { onCall, HttpsOptions } from 'firebase-functions/v2/https';
import { onCallGenkit } from '@genkit-ai/firebase/functions';
import { googleAI } from '@genkit-ai/googleai';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define the input schema for the indexScript function
const IndexScriptInputSchema = z.object({
  scriptId: z.string().describe('A unique identifier for the script.'),
  text: z.string().describe('The raw script content to be indexed.'),
});

// Define the output schema for the indexing prompt
const SegmentSchema = z.object({
  id: z.string().describe('A unique identifier for the segment.'),
  text: z.string().describe('The text content of the segment.'),
});

const IndexScriptOutputSchema = z.array(SegmentSchema);

// Configure Genkit with the Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
});

// Define the Genkit prompt for script indexing
const scriptIndexerPrompt = ai.definePrompt({
    name: 'scriptIndexerPrompt',
    input: { schema: z.object({ text: z.string() }) },
    output: { schema: IndexScriptOutputSchema },
    model: 'googleai/gemini-2.5-flash-preview-05-20',
    prompt: `You are a script indexing service. Your task is to take the provided script text and break it down into logical segments (like sentences or short paragraphs).

    Return the result as a JSON array of objects. Each object must have two properties:
    1. "id": A unique string identifier for the segment (e.g., "seg-0", "seg-1").
    2. "text": The actual text content of the segment.

    Here is the script text:
    {{{text}}}
    `,
});

// Define the Genkit flow
const indexScriptFlow = ai.defineFlow(
  {
    name: 'indexScriptFlow',
    inputSchema: IndexScriptInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    // Call the Gemini API to get the indexed script
    const { output } = await scriptIndexerPrompt({ text: input.text });

    if (!output) {
      return { success: false, message: 'Failed to index script.' };
    }

    // Store the result in Firestore
    const docRef = db.collection('indexedScripts').doc(input.scriptId);
    await docRef.set({
      scriptId: input.scriptId,
      indexedContent: output,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: `Script ${input.scriptId} indexed successfully.` };
  }
);

// Expose the flow as an HTTP-callable function, secured by default
export const indexScript = onCallGenkit({}, indexScriptFlow);
