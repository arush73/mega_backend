import { z } from "zod"
import mongoose from "mongoose"

// Helper to validate MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId",
  })

const profileValidationSchema = z.object({
  user: objectIdSchema, // required (from auth or body)

  // Basic identity
  fullName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  pronouns: z.string().trim().optional(),
  title: z.string().trim().optional(),
  bio: z.string().optional(),

  // Cohort
  cohort: objectIdSchema.optional(),

  // Skills and roles
  skills: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),

  // Experience
  experience: z
    .object({
      years: z.number().min(0).optional(),
      summary: z.string().optional(),
    })
    .optional(),

  // Projects
  projects: z
    .array(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        url: z.string().url().optional(),
        role: z.string().optional(),
      })
    )
    .optional(),

  // Social links
  social: z
    .object({
      github: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      website: z.string().url().optional(),
      twitter: z.string().url().optional(),
    })
    .optional(),

  // Preferences
  preferences: z
    .object({
      preferredRoles: z.array(z.string()).optional(),
      preferredTeamSize: z.number().min(1).default(4).optional(),
      willingToLead: z.boolean().default(false).optional(),
    })
    .optional(),

  // Availability
  availability: z
    .enum(["available", "busy", "maybe"])
    .default("available")
    .optional(),

  // Presentation
  avatarUrl: z.string().url().optional(),
})

export {
  profileValidationSchema
}