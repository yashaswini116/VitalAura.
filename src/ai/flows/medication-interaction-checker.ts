'use server';
/**
 * @fileOverview A Genkit flow for checking potential medication interactions.
 *
 * - checkMedicationInteractions - A function that handles checking for medication interactions.
 * - MedicationInteractionCheckerInput - The input type for the checkMedicationInteractions function.
 * - MedicationInteractionCheckerOutput - The return type for the checkMedicationInteractions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MedicationInteractionCheckerInputSchema = z.object({
  medications: z.array(z.string()).describe('A list of medication names to check for interactions.'),
});
export type MedicationInteractionCheckerInput = z.infer<typeof MedicationInteractionCheckerInputSchema>;

const InteractionSchema = z.object({
  medication1: z.string().describe('The name of the first medication involved in the interaction.'),
  medication2: z.string().describe('The name of the second medication involved in the interaction.'),
  severity: z.enum(['Mild', 'Moderate', 'Severe']).describe('The severity of the interaction.'),
  description: z.string().describe('A description of the potential interaction and its effects.'),
  recommendation: z.string().describe('Recommendation for how to handle this interaction (e.g., "Consult your doctor", "Monitor for symptoms", "Avoid concurrent use").'),
});

const MedicationInteractionCheckerOutputSchema = z.object({
  hasInteractions: z.boolean().describe('True if any significant medication interactions were found, otherwise false.'),
  warningMessage: z.string().describe('A summary message about the medication interactions found or a message stating no significant interactions were detected.'),
  interactions: z.array(InteractionSchema).describe('A list of detailed descriptions for each identified medication interaction.').optional(),
  disclaimer: z.string().describe('Standard medical disclaimer.').default('This is AI-generated health information, not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions.'),
});
export type MedicationInteractionCheckerOutput = z.infer<typeof MedicationInteractionCheckerOutputSchema>;

const medicationInteractionPrompt = ai.definePrompt({
  name: 'medicationInteractionPrompt',
  input: { schema: MedicationInteractionCheckerInputSchema },
  output: { schema: MedicationInteractionCheckerOutputSchema },
  config: { maxOutputTokens: 2000, temperature: 0.3 },
  prompt: `You are an expert clinical pharmacist and medical professional specializing in drug interactions.

Your task is to analyze a list of medications and identify any potential interactions.

Patient's Medications:
{{#each medications}}
- {{{this}}}
{{/each}}

Analyze the provided medications for any potential drug-drug interactions. For each interaction found, describe the severity, the nature of the interaction, and a clear recommendation. If no significant interactions are found, provide a warningMessage stating so and set hasInteractions to false.

Important:
- Always prioritize patient safety.
- Your response must be in JSON format matching the specified schema.
- The 'disclaimer' field should always contain: "This is AI-generated health information, not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions."`,
});

const medicationInteractionCheckerFlow = ai.defineFlow(
  {
    name: 'medicationInteractionCheckerFlow',
    inputSchema: MedicationInteractionCheckerInputSchema,
    outputSchema: MedicationInteractionCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await medicationInteractionPrompt(input);
    return output!;
  }
);

export async function checkMedicationInteractions(input: MedicationInteractionCheckerInput): Promise<MedicationInteractionCheckerOutput> {
  return medicationInteractionCheckerFlow(input);
}
