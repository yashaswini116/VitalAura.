
'use server';
/**
 * @fileOverview A Genkit flow for analyzing lab reports.
 *
 * - analyzeLabReport - A function that handles the lab report analysis process.
 * - AnalyzeLabReportInput - The input type for the analyzeLabReport function.
 * - AnalyzeLabReportOutput - The return type for the analyzeLabReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLabReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A lab report document (image or PDF page), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeLabReportInput = z.infer<typeof AnalyzeLabReportInputSchema>;

const LabParameterSchema = z.object({
  name: z.string().describe('The name of the lab parameter (e.g., "Hemoglobin").'),
  value: z.string().describe('The measured value for the parameter (e.g., "13.5").'),
  unit: z.string().optional().describe('The unit of measurement for the value (e.g., "g/dL", "%").'),
  referenceRange: z.string().describe('The normal reference range for the parameter (e.g., "12-15 g/dL" or "Negative").'),
  status: z.enum(['Normal', 'High', 'Low', 'Detected', 'Not Detected', 'Other']).describe('The status of the parameter relative to the reference range.'),
  explanation: z.string().describe('A plain language explanation of this parameter and what its status means.'),
});

const AnalyzeLabReportOutputSchema = z.object({
  overallSummary: z.string().describe('A comprehensive, plain-language summary of the entire lab report.'),
  parameters: z.array(LabParameterSchema).describe('An array of all identified lab parameters.'),
  disclaimer: z.string().describe('Always include a medical disclaimer.')
});
export type AnalyzeLabReportOutput = z.infer<typeof AnalyzeLabReportOutputSchema>;

export async function analyzeLabReport(input: AnalyzeLabReportInput): Promise<AnalyzeLabReportOutput> {
  return analyzeLabReportFlow(input);
}

const labReportAnalysisPrompt = ai.definePrompt({
  name: 'labReportAnalysisPrompt',
  input: {schema: AnalyzeLabReportInputSchema},
  output: {schema: AnalyzeLabReportOutputSchema},
  model: 'googleai/gemini-2.0-flash',
  config: {
    temperature: 0.2,
    maxOutputTokens: 2500,
  },
  prompt: `You are an expert medical lab analyst. Your task is to meticulously analyze the provided lab report image or document.

1.  **Extract All Parameters**: Identify every clinical test parameter mentioned.
2.  **Values & Ranges**: For each parameter, extract the measured value and its provided reference range.
3.  **Determine Status**: Classify as Normal, High, Low, Detected, or Not Detected based on the reference range.
4.  **Plain Language Explanation**: Briefly explain what each parameter means in simple terms.
5.  **Overall Summary**: Provide a high-level summary of the findings.

Always include the mandatory disclaimer: "This is AI-generated health information, not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions."

Here is the report:
{{media url=reportDataUri}}`,
});

const analyzeLabReportFlow = ai.defineFlow(
  {
    name: 'analyzeLabReportFlow',
    inputSchema: AnalyzeLabReportInputSchema,
    outputSchema: AnalyzeLabReportOutputSchema,
  },
  async (input) => {
    const {output} = await labReportAnalysisPrompt(input);
    if (!output) throw new Error('Lab report analysis failed.');
    return output;
  }
);
