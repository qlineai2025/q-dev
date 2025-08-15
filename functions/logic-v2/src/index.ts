import {
  setGlobalOptions,
} from "firebase-functions";
import {defineSecret} from "firebase-functions/v2/params";
import {
  configureGenkit,
  onCallGenkit,
} from "@genkit-ai/firebase/functions";
import * as z from "zod";
import GoogleGenerativeAI from "@genkit-ai/googleai";
import * as logger from "firebase-functions/logger";

// Export the new indexScript function
export { indexScript } from './index-script';


// For cost control, you can set the maximum number of containers.
setGlobalOptions({maxInstances: 10});

// 1. Define the secret. The name must match the one you set in the CLI.
const genkitApiKey = defineSecret("GENKIT_API_KEY");

// 2. Configure Genkit with the API key from the secret.
// This block initializes Genkit and tells it to use
// the GoogleGenerativeAI plugin.
configureGenkit({
  plugins: [
    new GoogleGenerativeAI({
      apiKey: genkitApiKey,
    }),
  ],
});

// A simple example Genkit flow to demonstrate the setup is working.
const simpleFlow = configureGenkit.defineFlow(
  {
    name: "simpleFlow",
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt: string) => {
    logger.info(`Received prompt: ${prompt}`);
    return `Flow received: "${prompt}"`;
  }
);

// 3. Export the callable function with Genkit.
export const genkitSimpleFlow = onCallGenkit(
  {
    secrets: [genkitApiKey],
  },
  simpleFlow
);
