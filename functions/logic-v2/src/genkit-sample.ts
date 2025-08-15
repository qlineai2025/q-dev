// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {googleAI, geminiFlash} from "@genkit-ai/googleai";

// Cloud Functions for Firebase supports Genkit natively.
import {onCallGenkit} from "@genkit-ai/firebase/functions";

// Genkit models generally depend on an API key. APIs should be stored in Cloud
// Secret Manager so that access to these sensitive values can be controlled.
import {defineSecret} from "firebase-functions/v2/params";
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

const ai = genkit({
  plugins: [
    googleAI(),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (subject, {sendChunk}) => {
    const prompt = `Suggest an item for a ${subject} themed restaurant`;
    const {response, stream} = await ai.generateStream({
      model: geminiFlash,
      prompt: prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }
    return (await response).text;
  }
);

export const menuSuggestion = onCallGenkit({
  secrets: [apiKey],
}, menuSuggestionFlow);
