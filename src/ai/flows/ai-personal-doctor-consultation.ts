'use server';
/**
 * @fileOverview An AI personal doctor for symptom analysis and health recommendations.
 * Standardized to use googleai/gemini-1.5-flash with robust structured fallbacks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIPersonalDoctorConsultationInputSchema = z.object({
  symptomDescription: z
    .string()
    .describe(
      "The user's detailed description of their symptoms. This can be free text or a summary of structured input."
    ),
  patientProfile: z.object({
    name: z.string().describe('The full name of the patient.'),
    age: z.number().int().positive().describe('The age of the patient in years.'),
    gender: z.string().describe('The gender of the patient.'),
    heightCm: z.number().positive().describe('The height of the patient in centimeters.'),
    weightKg: z.number().positive().describe('The weight of the patient in kilograms.'),
    bmi: z.number().describe('The Body Mass Index (BMI) of the patient.'),
    bloodGroup: z.string().describe('The blood group of the patient.'),
    allergies: z
      .array(z.string())
      .describe('A list of known allergies for the patient.')
      .default([]),
    chronicConditions: z
      .array(z.string())
      .describe('A list of chronic conditions the patient has.')
      .default([]),
    currentMedications: z
      .array(z.string())
      .describe('A list of medications the patient is currently taking.')
      .default([]),
  }),
});
export type AIPersonalDoctorConsultationInput = z.infer<
  typeof AIPersonalDoctorConsultationInputSchema
>;

const MedicationSchema = z.object({
  name: z.string().describe('Name of the medication.'),
  dosage: z.string().describe('Dosage of the medication, e.g., "650mg".'),
  frequency: z.string().describe('Frequency of the medication, e.g., "every 6 hours".'),
  duration: z.string().describe('Duration for taking the medication, e.g., "max 3 days".'),
  notes: z.string().optional().describe('Any additional notes for the medication.'),
});

const DiagnosisSchema = z.object({
  condition: z.string().describe('Probable medical condition.'),
  explanation: z.string().describe('Brief explanation of the condition.'),
});

const DietRecommendationSchema = z.object({
  eat: z.array(z.string()).describe('List of foods/items to eat/include in diet.'),
  avoid: z.array(z.string()).describe('List of foods/items to avoid in diet.'),
});

const AIPersonalDoctorConsultationOutputSchema = z.object({
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'EMERGENCY']).describe('The assessed risk level.'),
  diagnosis: z
    .array(DiagnosisSchema)
    .describe('Probable condition(s) with a brief explanation.'),
  immediateActions: z
    .array(z.string())
    .describe('List of immediate actions to take right now.'),
  medications: z
    .array(MedicationSchema)
    .describe('List of over-the-counter (OTC) medications recommended for LOW risk scenarios.')
    .default([]),
  homeRemedies: z
    .array(z.string())
    .describe('List of home care instructions or remedies.'),
  diet: DietRecommendationSchema.describe('Dietary recommendations.'),
  redFlags: z
    .array(z.string())
    .describe('Symptoms that would escalate to a higher risk level and require immediate attention.'),
  specialistType: z
    .string()
    .optional()
    .describe('Which type of doctor or specialist to see if needed.'),
  followUp: z
    .string()
    .optional()
    .describe('When to seek care if symptoms are not improving.'),
  disclaimer: z.string().describe(
    'Crucial disclaimer that this is AI-generated health information and not a substitute for professional medical advice.'
  ),
});
export type AIPersonalDoctorConsultationOutput = z.infer<
  typeof AIPersonalDoctorConsultationOutputSchema
>;

const aiPersonalDoctorConsultationPrompt = ai.definePrompt({
  name: 'aiPersonalDoctorConsultationPrompt',
  input: { schema: AIPersonalDoctorConsultationInputSchema },
  output: { schema: AIPersonalDoctorConsultationOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  config: {
    temperature: 0.3,
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
  prompt: `You are a board-certified physician with 20 years of experience. Your task is to analyze patient symptoms and provide a structured medical assessment. Always prioritize patient safety and recommend seeking in-person care when appropriate. Never replace emergency services. If the symptoms indicate an emergency, clearly state EMERGENCY and instruct the user to call emergency services.

Patient Profile:
Name: {{{patientProfile.name}}}
Age: {{{patientProfile.age}}}
Gender: {{{patientProfile.gender}}}
Height: {{{patientProfile.heightCm}}} cm
Weight: {{{patientProfile.weightKg}}} kg
BMI: {{{patientProfile.bmi}}}
Blood Group: {{{patientProfile.bloodGroup}}}
Allergies: {{{patientProfile.allergies}}}
Chronic Conditions: {{{patientProfile.chronicConditions}}}
Current Medications: {{{patientProfile.currentMedications}}}

Patient's Symptoms: {{{symptomDescription}}}

Based on the patient's profile and described symptoms, provide a detailed medical assessment in JSON format according to the following schema. Ensure the disclaimer field is always populated exactly as instructed.`,
});

export async function aiPersonalDoctorConsultation(
  input: AIPersonalDoctorConsultationInput
): Promise<AIPersonalDoctorConsultationOutput> {
  console.log(`[AI Flow] Dr. Vital is analyzing: ${input.symptomDescription}`);
  
  try {
    const { output } = await aiPersonalDoctorConsultationPrompt(input);
    if (!output) throw new Error('AI Doctor returned empty response.');
    return output;
  } catch (error: any) {
    console.warn("DOCTOR AI FALLBACK (Quota/Error):", error.message);
    
    // Return a structured fallback that matches the requested UI cards
    return {
      riskLevel: 'MODERATE',
      diagnosis: [
        { 
          condition: "Symptomatic Health Assessment", 
          explanation: "Based on your description, this could be related to digestive stress or a seasonal illness. Since the AI service is currently busy, we have provided a general care protocol below." 
        }
      ],
      immediateActions: [
        "Rest in a comfortable position and monitor your temperature.",
        "Sip small amounts of clear fluids (water, electrolytes) to stay hydrated.",
        "Avoid heavy activity until your symptoms improve."
      ],
      medications: [
        { 
          name: "Consult Local Pharmacist", 
          dosage: "N/A", 
          frequency: "N/A", 
          duration: "N/A", 
          notes: "Ask for appropriate over-the-counter options for your specific discomfort." 
        }
      ],
      homeRemedies: ["Apply a warm compress if experiencing muscle or abdominal cramps.", "Practice 5 minutes of deep belly breathing."],
      diet: { 
        eat: ["Plain crackers", "Rice", "Bananas", "Applesauce"], 
        avoid: ["Caffeine", "Spicy food", "Dairy products", "Fried foods"] 
      },
      redFlags: ["Severe sharp pain that persists", "Inability to keep down fluids", "Fever over 101.5°F", "Shortness of breath"],
      specialistType: "General Physician",
      followUp: "If symptoms do not improve within 12-24 hours.",
      disclaimer: "ADVISOR NOTE: This is a static medical protocol due to service limits. This is NOT a professional medical diagnosis. Always consult a real doctor for medical decisions."
    } as AIPersonalDoctorConsultationOutput;
  }
}
