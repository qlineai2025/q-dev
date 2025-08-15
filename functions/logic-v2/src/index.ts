import {defineSecret} from 'firebase-functions/v2/params';
import {setGlobalOptions} from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as z from 'zod';

import {
  configureGenkit,
  onCallGenkit,
} from '@genkit-ai/firebase/functions';
import {googleAI, geminiFlash} from '@genkit-ai/googleai';
import * as logger from 'firebase-functions/logger';


// For cost control, you can set the maximum number of containers.
setGlobalOptions({maxInstances: 10});

// 1. Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

// 2. Define the secret. The name must match the one you set in the CLI.
const genkitApiKey = defineSecret('GENKIT_API_KEY');

// 3. Define the input and output schemas for our Genkit flow
const IndexScriptInputSchema = z.object({
  scriptId: z.string().describe('A unique identifier for the script.'),
  text: z.string().describe('The raw script content to be indexed.'),
});

const SegmentSchema = z.object({
  id: z.string().describe('A unique identifier for the segment.'),
  text: z.string().describe('The text content of the segment.'),
});

const IndexScriptOutputSchema = z.array(SegmentSchema);

// 4. Configure Genkit and the Gemini model.
configureGenkit({
  plugins: [googleAI({apiKey: genkitApiKey})],
});


// 5. Define the Genkit flow for script indexing
const indexScriptFlow = configureGenkit.defineFlow(
  {
    name: 'indexScriptFlow',
    inputSchema: IndexScriptInputSchema,
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    // Define the Genkit prompt for script indexing
    const prompt = `You are a script indexing service. Your task is to take the provided script text and break it down into logical segments (like sentences or short paragraphs).

    Return the result as a JSON array of objects. Each object must have two properties:
    1. "id": A unique string identifier for the segment (e.g., "seg-0", "seg-1").
    2. "text": The actual text content of the segment.

    Here is the script text:
    {{{text}}}
    `;

    // Call the Gemini API to get the indexed script
    const {response} = await geminiFlash.generate({
      prompt: prompt.replace('{{{text}}}', input.text),
      config: {
        temperature: 1,
      },
    });

    const indexedContent = JSON.parse(response.text());

    if (!indexedContent) {
      return {success: false, message: 'Failed to index script.'};
    }

    // Store the result in Firestore
    const docRef = db.collection('indexedScripts').doc(input.scriptId);
    await docRef.set({
      scriptId: input.scriptId,
      indexedContent: indexedContent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, message: `Script ${input.scriptId} indexed successfully.`};
  }
);


// 6. Expose the flow as an HTTP-callable function, secured by default
export const indexScript = onCallGenkit({}, indexScriptFlow);