import { z } from "zod";
import { DEGREE_OPTIONS } from "./constants";
import { isValidScore } from "./scoring-scale";

const degreeEnum = z.enum(
  DEGREE_OPTIONS as unknown as [string, ...string[]]
);

const degreesSchema = z
  .array(degreeEnum)
  .min(1, "Select at least one degree option")
  .refine(
    (arr) => !(arr.includes("None") && arr.length > 1),
    "If None is selected, no other degrees may be selected"
  );

export const submissionSchema = z
  .object({
    conferenceSlug: z.string().min(1),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    degrees: degreesSchema,
    jobTitle: z.string().min(1).max(200),
    organization: z.string().min(1).max(200),
    title: z.string().min(1).max(300),
    abstract: z.string().min(50).max(8000),
    technicalLevel: z.coerce.number().int().min(1).max(5),
    bio: z.string().min(20).max(4000),
    email: z.string().email(),
    zipCode: z.string().min(3).max(20),
    phone: z.string().min(7).max(30),
    linkedinUrl: z.string().url().max(500),
    linkedinHasPhoto: z.coerce.boolean(),
    hasCoPresenter: z.coerce.boolean(),
    coPresenterName: z.string().max(200).optional(),
    coPresenterEmail: z.string().email().optional().or(z.literal("")),
    coPresenterDegrees: z.array(degreeEnum).optional(),
    coPresenterJobTitle: z.string().max(200).optional(),
    coPresenterOrganization: z.string().max(200).optional(),
    coPresenterBio: z.string().max(4000).optional(),
    coPresenterLinkedinUrl: z.string().url().max(500).optional().or(z.literal("")),
    coPresenterLinkedinHasPhoto: z.coerce.boolean().optional(),
    travelRestriction: z.string().max(1000).optional(),
    travelReimbursementRequired: z.coerce.boolean(),
    additionalInfo: z.string().max(4000).optional(),
    themeIds: z
      .array(z.string().min(1))
      .min(1, "Select at least one theme")
      .max(3, "Select at most three themes"),
  })
  .superRefine((data, ctx) => {
    if (!data.hasCoPresenter) return;
    const required = [
      ["coPresenterName", "Co-presenter name"],
      ["coPresenterEmail", "Co-presenter email"],
      ["coPresenterJobTitle", "Co-presenter job title"],
      ["coPresenterOrganization", "Co-presenter organization"],
      ["coPresenterBio", "Co-presenter bio"],
      ["coPresenterLinkedinUrl", "Co-presenter LinkedIn URL"],
    ] as const;
    for (const [key, label] of required) {
      const val = data[key];
      if (!val || (typeof val === "string" && !val.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required when you have a co-presenter`,
          path: [key],
        });
      }
    }
    if (!data.coPresenterDegrees?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Co-presenter degree(s) required",
        path: ["coPresenterDegrees"],
      });
    }
    if (data.coPresenterLinkedinHasPhoto === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indicate if co-presenter LinkedIn has a photo",
        path: ["coPresenterLinkedinHasPhoto"],
      });
    }
  });

export const presenterSubmissionEditSchema = z.object({
  token: z.string().min(1),
  title: z.string().min(1).max(300),
  abstract: z.string().min(50).max(8000),
  bio: z.string().min(20).max(4000),
  technicalLevel: z.coerce.number().int().min(1).max(5),
  themeIds: z
    .array(z.string().min(1))
    .min(1, "Select at least one theme")
    .max(3, "Select at most three themes"),
  changeNote: z.string().max(2000).optional(),
  proposedThemeName: z.string().max(80).optional(),
});

export const scoreSchema = z.object({
  submissionId: z.string().min(1),
  value: z.coerce
    .number()
    .refine(isValidScore, "Score must be between 0 and 1 in 0.1 increments"),
  notes: z.string().max(5000).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
