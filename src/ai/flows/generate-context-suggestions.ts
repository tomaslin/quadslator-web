'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate context suggestions for a given prompt.
 *
 * - generateContextSuggestions - A function that generates context suggestions based on a user prompt.
 * - GenerateContextSuggestionsInput - The input type for the generateContextSuggestions function.
 * - GenerateContextSuggestionsOutput - The return type for the generateContextSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateContextSuggestionsInputSchema = z.object({
  prompt: z.string().describe('The user-provided prompt for which context is needed.'),
});
export type GenerateContextSuggestionsInput = z.infer<typeof GenerateContextSuggestionsInputSchema>;

const GenerateContextSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested contexts relevant to the prompt.'),
});
export type GenerateContextSuggestionsOutput = z.infer<typeof GenerateContextSuggestionsOutputSchema>;

export async function generateContextSuggestions(
  input: GenerateContextSuggestionsInput
): Promise<GenerateContextSuggestionsOutput> {
  return generateContextSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateContextSuggestionsPrompt',
  input: {schema: GenerateContextSuggestionsInputSchema},
  output: {schema: GenerateContextSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to provide helpful context suggestions for improving translation quality.

  Given the following prompt, suggest three different contexts that could be relevant for translating the prompt more accurately. Respond with an array of strings.

  Prompt: {{{prompt}}}`,
});

const generateContextSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateContextSuggestionsFlow',
    inputSchema: GenerateContextSuggestionsInputSchema,
    outputSchema: GenerateContextSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
