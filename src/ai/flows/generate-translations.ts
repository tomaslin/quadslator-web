'use server';

/**
 * @fileOverview Generates four unique translations of a given prompt, considering the provided context.
 *
 * - generateUniqueTranslations - A function that handles the translation process.
 * - GenerateUniqueTranslationsInput - The input type for the generateUniqueTranslations function.
 * - GenerateUniqueTranslationsOutput - The return type for the generateUniqueTranslations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUniqueTranslationsInputSchema = z.object({
  prompt: z.string().describe('The text prompt to translate.'),
  context: z.string().describe('The context for the translation.'),
});
export type GenerateUniqueTranslationsInput = z.infer<
  typeof GenerateUniqueTranslationsInputSchema
>;

const GenerateUniqueTranslationsOutputSchema = z.object({
  translations: z
    .array(z.string())
    .length(4)
    .describe('An array of four unique translations.'),
});
export type GenerateUniqueTranslationsOutput = z.infer<
  typeof GenerateUniqueTranslationsOutputSchema
>;

export async function generateUniqueTranslations(
  input: GenerateUniqueTranslationsInput
): Promise<GenerateUniqueTranslationsOutput> {
  return generateUniqueTranslationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUniqueTranslationsPrompt',
  input: {schema: GenerateUniqueTranslationsInputSchema},
  output: {schema: GenerateUniqueTranslationsOutputSchema},
  prompt: `You are a translation expert. You will generate four unique translations of the given prompt, considering the provided context. Return the translations as a JSON array.

Prompt: {{{prompt}}}
Context: {{{context}}}`,
});

const generateUniqueTranslationsFlow = ai.defineFlow(
  {
    name: 'generateUniqueTranslationsFlow',
    inputSchema: GenerateUniqueTranslationsInputSchema,
    outputSchema: GenerateUniqueTranslationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
