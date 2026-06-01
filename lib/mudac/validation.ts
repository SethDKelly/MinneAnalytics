import { z } from "zod";

const judgeTypes = [
  "ACADEMIC",
  "INDUSTRY_BUSINESS",
  "INDUSTRY_TECHNICAL",
  "GENERAL",
] as const;

export const mudacJudgeRegistrationSchema = z.object({
  eventSlug: z.string().min(1),
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email is required").max(200),
  affiliation: z.string().max(200).optional(),
  judgeType: z.enum(judgeTypes),
  registrationCode: z.string().max(64).optional(),
  website: z.string().max(0).optional(),
});

export type MudacJudgeRegistrationInput = z.infer<typeof mudacJudgeRegistrationSchema>;

export const mudacScorecardSchema = z.object({
  token: z.string().min(1),
  presentationId: z.string().min(1),
  scores: z.array(
    z.object({
      criterionId: z.string().min(1),
      value: z.number(),
    })
  ),
  notes: z.string().max(2000).optional(),
  submit: z.boolean().optional(),
});

export type MudacScorecardInput = z.infer<typeof mudacScorecardSchema>;
