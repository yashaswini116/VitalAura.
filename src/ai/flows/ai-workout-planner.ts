'use server';

/**
 * @fileOverview A Genkit flow for generating personalized 4-week workout plans.
 *
 * - generateWorkoutPlan - A function that handles the workout plan generation process.
 * - AiWorkoutPlannerInput - The input type for the generateWorkoutPlan function.
 * - AiWorkoutPlannerOutput - The return type for the generateWorkoutPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const WorkoutExerciseSchema = z.object({
  name: z.string().describe('Name of the exercise (e.g., "Push-ups", "Squats", "Downward Dog").'),
  sets: z.string().optional().describe('Number of sets (e.g., "3 sets", "AMRAP" - as many reps as possible).'),
  repsOrDuration: z.string().optional().describe('Number of repetitions or duration (e.g., "10-12 reps", "30 seconds", "Hold for 1 minute").'),
  notes: z.string().optional().describe('Any specific instructions or tips for the exercise (e.g., "Keep core tight", "Beginner modification: on knees").')
});

const DailyWorkoutSchema = z.object({
  day: z.string().max(20).describe('Day of the week (e.g., "Monday", "Rest Day").'),
  workoutName: z.string().optional().describe('Name or title of the workout for the day (e.g., "Full Body Strength", "Rest & Recovery").'),
  duration: z.string().optional().describe('Estimated duration of the workout (e.g., "45 minutes", "60 min").'),
  category: z.string().optional().describe('High-level category of the workout (e.g., "STRENGTH TRAINING", "YOGA & FLEXIBILITY").'),
  intensityLevel: z.string().optional().describe('Intensity level of the workout (e.g., "Low", "Moderate", "High").'),
  exercises: z.array(WorkoutExerciseSchema).optional().describe('Detailed list of exercises for the workout, including sets, reps/duration, and notes.'),
  videoLink: z.string().url().max(200).optional().describe('A suitable YouTube video link for the workout or specific exercises, if applicable. This link should demonstrate the workout or provide guidance.'),
  focus: z.string().optional().describe('Specific focus area for the workout (e.g., "Upper Body Strength", "Leg Day", "Mindful Flow").')
});

const WeeklyPlanSchema = z.object({
  week: z.number().int().min(1).max(4).describe('Week number (1 to 4) of the progressive plan.'),
  description: z.string().optional().describe('Brief description of the focus or goals for this specific week.'),
  plan: z.array(DailyWorkoutSchema).length(7).describe('The daily workout plan for the week, containing exactly 7 entries for each day of the week.')
});

const AiWorkoutPlannerInputSchema = z.object({
  primaryGoal: z.enum([
    'Weight Loss',
    'Muscle Gain',
    'Flexibility',
    'Endurance',
    'General Fitness'
  ]).describe('The primary fitness goal of the user.'),
  daysAvailablePerWeek: z.number().int().min(1).max(7).describe('The number of days per week the user is available to exercise.'),
  sessionDurationMinutes: z.number().int().min(10).max(120).describe('The preferred duration for each workout session in minutes.'),
  equipmentAvailable: z.enum([
    'None',
    'Dumbbells',
    'Full Gym',
    'Resistance Bands'
  ]).describe('The type of equipment the user has access to.'),
  fitnessLevel: z.enum([
    'Beginner',
    'Intermediate',
    'Advanced'
  ]).describe('The user\'s current fitness level.'),
  injuriesOrLimitations: z.string().optional().describe('Any known injuries or physical limitations the user might have, which should be considered when designing the plan.'),
  preferredWorkoutTypes: z.array(z.string()).max(5).describe('A list of preferred high-level workout categories from the user (e.g., "STRENGTH TRAINING", "YOGA & FLEXIBILITY", "CARDIO").')
});
export type AiWorkoutPlannerInput = z.infer<typeof AiWorkoutPlannerInputSchema>;

const AiWorkoutPlannerOutputSchema = z.object({
  title: z.string().describe('A catchy title for the generated 4-week workout plan (e.g., "Ignite Your Core: 4-Week Strength Journey").'),
  introduction: z.string().max(500).describe('A brief, encouraging introduction to the workout plan, tailored to the user\'s goals and fitness level.'),
  plan: z.array(WeeklyPlanSchema).length(4).describe('The complete 4-week progressive workout plan, with each week building on the last.'),
  disclaimer: z.string().max(1000).describe('A crucial medical disclaimer: "This AI-generated workout plan is for informational purposes only and is not a substitute for professional medical or fitness advice. Always consult a qualified healthcare professional or certified fitness trainer before starting any new exercise program, especially if you have existing health conditions or injuries. Listen to your body and stop if you feel pain."')
});
export type AiWorkoutPlannerOutput = z.infer<typeof AiWorkoutPlannerOutputSchema>;

export async function generateWorkoutPlan(input: AiWorkoutPlannerInput): Promise<AiWorkoutPlannerOutput> {
  return aiWorkoutPlannerFlow(input);
}

const aiWorkoutPlannerPrompt = ai.definePrompt({
  name: 'aiWorkoutPlannerPrompt',
  input: { schema: AiWorkoutPlannerInputSchema },
  output: { schema: AiWorkoutPlannerOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  config: {
    temperature: 0.7,
    maxOutputTokens: 2000
  },
  system: `You are a highly experienced and certified fitness trainer and exercise physiologist for the VitalAura application. Your goal is to create a personalized, safe, and effective 4-week progressive workout plan based on the user's input. The plan should be realistic, considering their fitness level, available equipment, and preferred workout types. Always prioritize safety, proper form, and gradual progression. If the user mentions injuries or limitations, provide appropriate modifications or suggest exercises that avoid aggravating those areas. Each week should progressively challenge the user by increasing intensity, volume, or complexity in a sustainable manner. For each day, include a workout or a rest day. Ensure each daily workout has a name, estimated duration, category, intensity level, and a detailed list of exercises with sets, reps/duration, and notes. Where possible, provide a suitable YouTube video link that demonstrates the workout or key exercises. Ensure the entire response is a JSON object matching the provided schema, including a comprehensive medical disclaimer at the end. Make sure the plan object for each week contains exactly 7 entries, one for each day of the week. For rest days, include "Rest Day" as workoutName and duration etc. as appropriate.`,
  prompt: `Generate a 4-week progressive workout plan for a user with the following details:
Primary Goal: {{{primaryGoal}}}
Days Available per Week: {{{daysAvailablePerWeek}}}
Session Duration: {{{sessionDurationMinutes}}} minutes
Equipment Available: {{{equipmentAvailable}}}
Fitness Level: {{{fitnessLevel}}}
Preferred Workout Types: {{#each preferredWorkoutTypes}} "{{{this}}}"{{#unless @last}},{{/unless}}{{/each}}.
{{#if injuriesOrLimitations}}Injuries/Limitations: {{{injuriesOrLimitations}}}.{{/if}}

The plan must consist of 4 weeks. Each week must contain 7 days, even if some are rest days.
For rest days, set 'workoutName' to "Rest Day" and 'focus' to "Active Recovery / Rest".

Provide concrete exercise names, sets, reps, and specific instructions.
For YouTube video links, provide general, suitable examples that demonstrate the workout type or common exercises for that workout (e.g., a "Full Body Strength Workout for Beginners" video, or a "Yoga for Flexibility" video). Do not generate fake URLs.

Example structure for a daily workout in the plan:
{
  "day": "Monday",
  "workoutName": "Upper Body Focus",
  "duration": "45 minutes",
  "category": "STRENGTH TRAINING",
  "intensityLevel": "Moderate",
  "exercises": [
    {
      "name": "Dumbbell Bench Press",
      "sets": "3 sets",
      "repsOrDuration": "8-12 reps",
      "notes": "Focus on controlled movement."
    },
    {
      "name": "Bicep Curls",
      "sets": "3 sets",
      "repsOrDuration": "10-15 reps",
      "notes": "Keep elbows tucked in."
    }
  ],
  "videoLink": "https://www.youtube.com/watch?v=someUpperBodyVideo",
  "focus": "Chest and Arms"
}

Remember to make the plan progressive over the 4 weeks.
`
});

const aiWorkoutPlannerFlow = ai.defineFlow(
  {
    name: 'aiWorkoutPlannerFlow',
    inputSchema: AiWorkoutPlannerInputSchema,
    outputSchema: AiWorkoutPlannerOutputSchema
  },
  async (input) => {
    const { output } = await aiWorkoutPlannerPrompt(input);
    return output!;
  }
);
