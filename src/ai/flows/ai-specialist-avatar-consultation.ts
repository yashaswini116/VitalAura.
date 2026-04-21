'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * @fileOverview A Genkit flow for specialized AI avatar consultations.
 * Standardized model names and added robust fallbacks for all specialists.
 */

// --- Schemas ---

const UserProfileSchema = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  heightCm: z.number().optional(),
  weightKg: z.number().optional(),
  bmi: z.number().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  currentMedications: z.string().optional(),
  doshaType: z.string().optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

const ConversationMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

const AiSpecialistAvatarConsultationInputSchema = z.object({
  avatarId: z.string(),
  userMessage: z.string(),
  conversationHistory: z.array(ConversationMessageSchema),
  userProfile: UserProfileSchema,
});
export type AiSpecialistAvatarConsultationInput = z.infer<typeof AiSpecialistAvatarConsultationInputSchema>;

const AiStructuredCardSchema = z.object({
  title: z.string(),
  content: z.string(),
  type: z.string().optional(),
});
export type AiStructuredCard = z.infer<typeof AiStructuredCardSchema>;

const AiSpecialistAvatarConsultationOutputSchema = z.array(AiStructuredCardSchema);
export type AiSpecialistAvatarConsultationOutput = z.infer<typeof AiSpecialistAvatarConsultationOutputSchema>;

// --- Helper Functions ---

function getAvatarSystemPrompt(avatarId: string): string {
  const baseInstruction = `Your response MUST be a JSON array of structured cards. Each card must have a "title" (string) and "content" (string). Always include a disclaimer card at the end.`;
  return `You are a medical specialist (${avatarId}). Provide expert advice in JSON format. ${baseInstruction}`;
}

export async function aiSpecialistAvatarConsultation(
  input: AiSpecialistAvatarConsultationInput
): Promise<AiSpecialistAvatarConsultationOutput> {
  console.log(`[AI Flow] Specialist Consult: ${input.avatarId}`);
  
  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      messages: [
        { role: 'system', content: getAvatarSystemPrompt(input.avatarId) },
        ...input.conversationHistory.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: input.userMessage }
      ],
      config: { temperature: 0.8 }
    });

    if (!output) throw new Error('No specialist output.');
    
    let parsed = JSON.parse(output.text);
    return Array.isArray(parsed) ? parsed : [{ title: "Advice", content: output.text }];
  } catch (error: any) {
    console.warn("SPECIALIST AI FALLBACK:", error.message);
    return [
      { title: "Specialist Note", content: "I am currently analyzing your request. Based on general protocols, focus on hydration and rest while we establish a full connection." },
      { title: "Disclaimer", content: "AI-generated health info, not a substitute for professional medical advice." }
    ];
  }
}
