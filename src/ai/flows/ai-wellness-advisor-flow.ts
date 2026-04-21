'use server';
/**
 * @fileOverview An AI wellness advisor that provides personalized health advice.
 * Standardized model names to googleai/gemini-1.5-flash for reliability.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiWellnessAdvisorInputSchema = z.object({
  question: z.string().describe('The user\'s wellness question or health concern.'),
  mode: z.enum(['Ayurveda', 'Modern']).describe('The desired wellness approach.').default('Modern'),
  doshaType: z.string().optional().describe('User\'s Dosha type for Ayurveda.'),
});
export type AiWellnessAdvisorInput = z.infer<typeof AiWellnessAdvisorInputSchema>;

const AiWellnessAdvisorOutputSchema = z.object({
  mode: z.enum(['Ayurveda', 'Modern']),
  ayurvedaResponse: z.object({
    doshaAnalysis: z.string().optional(),
    herbs: z.array(z.object({
      name: z.string(),
      benefits: z.string(),
      preparation: z.string().optional(),
    })).optional(),
    yogaAsanas: z.array(z.object({
      name: z.string(),
      description: z.string().optional(),
    })).optional(),
    dinacharya: z.string().optional(),
  }).optional(),
  modernResponse: z.object({
    explanation: z.string().optional(),
    ingredients: z.array(z.object({
      name: z.string(),
      description: z.string(),
    })).optional(),
    lifestyleModifications: z.string().optional(),
    foods: z.string().optional(),
  }).optional(),
  disclaimer: z.string(),
});
export type AiWellnessAdvisorOutput = z.infer<typeof AiWellnessAdvisorOutputSchema>;

const wellnessAdvisorPrompt = ai.definePrompt({
  name: 'wellnessAdvisorPrompt',
  input: { schema: AiWellnessAdvisorInputSchema },
  output: { schema: AiWellnessAdvisorOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  config: {
    temperature: 0.7,
    maxOutputTokens: 1500,
  },
  prompt: `You are an expert wellness advisor. Provide high-quality, actionable advice based on the user's question and selected mode.

User Question: {{{question}}}
Approach: {{{mode}}}
{{#if doshaType}}User Dosha: {{{doshaType}}}{{/if}}

Instructions:
1. Ayurveda mode: Provide Dosha balance, herbal remedies, Yoga/Pranayama, and Dinacharya tips.
2. Modern mode: Provide science-backed explanations, supplements, lifestyle modifications, and diet advice.
3. Always provide a medically responsible disclaimer.
4. Respond strictly in valid JSON format.`,
});

export async function aiWellnessAdvisor(input: AiWellnessAdvisorInput): Promise<AiWellnessAdvisorOutput> {
  console.log(`[AI Flow] Consulting Vital Advisor: ${input.question}`);
  
  try {
    const { output } = await wellnessAdvisorPrompt(input);
    if (!output) throw new Error('AI service returned an empty response.');
    return output;
  } catch (error: any) {
    console.warn("AI SERVICE FALLBACK (Quota/Error):", error.message);
    
    return {
      mode: input.mode,
      modernResponse: {
        explanation: "Based on general wellness protocols, consistency is vital for health optimization and recovery.",
        lifestyleModifications: "Prioritize 8 hours of deep sleep, 4 liters of water, and 30 minutes of natural movement today.",
        foods: "Focus on a nutrient-dense diet: 40% fiber, 30% lean protein, 30% healthy fats."
      },
      ayurvedaResponse: {
        doshaAnalysis: "Balance your internal fire by adhering to Dinacharya (daily routine) principles.",
        dinacharya: "Wake with the sun, practice 5 minutes of mindful breathing, and favor warm, cooked meals."
      },
      disclaimer: "ADVISOR NOTE: This is a static wellness protocol due to service limits. Consult your physician for specific medical concerns."
    } as AiWellnessAdvisorOutput;
  }
}
