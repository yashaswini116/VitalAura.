'use server';
/**
 * @fileOverview An AI agent that analyzes meal descriptions to estimate nutritional content.
 *
 * - analyzeNutrition - A function that handles the nutrition analysis process.
 * - NutritionAnalyzerInput - The input type for the analyzeNutrition function.
 * - NutritionAnalyzerOutput - The return type for the analyzeNutrition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionAnalyzerInputSchema = z.object({
  mealDescription: z
    .string()
    .describe('A detailed description of the meal or food item for nutrition analysis.'),
});
export type NutritionAnalyzerInput = z.infer<typeof NutritionAnalyzerInputSchema>;

const NutritionAnalyzerOutputSchema = z.object({
  calories: z.number().describe('Estimated total calories in kcal.'),
  protein: z.number().describe('Estimated protein content in grams.'),
  carbs: z.number().describe('Estimated carbohydrate content in grams.'),
  fat: z.number().describe('Estimated fat content in grams.'),
});
export type NutritionAnalyzerOutput = z.infer<typeof NutritionAnalyzerOutputSchema>;

export async function analyzeNutrition(input: NutritionAnalyzerInput): Promise<NutritionAnalyzerOutput> {
  return nutritionAnalyzerFlow(input);
}

const nutritionAnalyzerPrompt = ai.definePrompt({
  name: 'nutritionAnalyzerPrompt',
  input: {schema: NutritionAnalyzerInputSchema},
  output: {schema: NutritionAnalyzerOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a highly accurate nutritionist AI. Your task is to analyze the provided meal description and estimate its nutritional breakdown, specifically calories, protein, carbohydrates, and fat. Provide these values in grams for macros and kcal for calories.

Respond strictly in JSON format, adhering to the output schema.

Meal Description: {{{mealDescription}}}

Disclaimer: This is AI-generated nutritional information and should be used for estimation purposes only.`,
  config: {
    temperature: 0.7,
  },
});

const nutritionAnalyzerFlow = ai.defineFlow(
  {
    name: 'nutritionAnalyzerFlow',
    inputSchema: NutritionAnalyzerInputSchema,
    outputSchema: NutritionAnalyzerOutputSchema,
  },
  async input => {
    const {output} = await nutritionAnalyzerPrompt(input);
    return output!;
  }
);
