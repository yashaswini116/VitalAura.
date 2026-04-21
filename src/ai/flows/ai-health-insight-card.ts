'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHealthInsightInputSchema = z.object({
  healthDataSummary: z.string(),
});
export type GenerateHealthInsightInput = z.infer<typeof GenerateHealthInsightInputSchema>;

const GenerateHealthInsightOutputSchema = z.object({
  insight: z.string(),
});
export type GenerateHealthInsightOutput = z.infer<typeof GenerateHealthInsightOutputSchema>;

export async function generateHealthInsight(input: GenerateHealthInsightInput): Promise<GenerateHealthInsightOutput> {
  try {
    const { output } = await healthInsightPrompt(input);
    return output || { insight: "Your vitals look stable. Remember to stay hydrated and hit your step goals today!" };
  } catch (e) {
    return { insight: "Keep up your wellness routine! Consistency is the key to a high VitalScore." };
  }
}

const healthInsightPrompt = ai.definePrompt({
  name: 'healthInsightPrompt',
  input: { schema: GenerateHealthInsightInputSchema },
  output: { schema: GenerateHealthInsightOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `Generate a concise, actionable health insight based on this 7-day summary: {{{healthDataSummary}}}`,
});
