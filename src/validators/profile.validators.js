import { z } from "zod"
import {
  AvailableUserPronouns,
  AvailableProfileAvailability,
} from "../constants.js"

// MongoDB ObjectId validation (as string ki form me leke)
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")

const profileValidationSchema = z.object({
  user: objectIdSchema, // required

  // Basic identity
  fullName: z.string().trim().optional(),
  displayName: z.string().trim().optional(),
  pronouns: z.enum(AvailableUserPronouns).optional(), // default mongoose me handle hoga
  title: z.string().trim().optional(),
  bio: z
    .string()
    .trim()
    .min(10, "Bio must be at least 10 characters")
    .max(1000, "Bio cannot exceed 1000 characters")
    .optional(),

  // Cohort array
  cohort: z.array(objectIdSchema).optional(),

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
        url: z.string().url("Invalid URL").optional(),
        role: z.string().optional(),
      })
    )
    .optional(),

  // Social links
  social: z
    .object({
      github: z.string().trim().optional(),
      linkedin: z.string().trim().optional(),
      website: z.string().trim().url("Invalid website URL").optional(),
      twitter: z.string().trim().optional(),
    })
    .optional(),

  // Preferences
  preferences: z
    .object({
      preferredRoles: z.array(z.string()).optional(),
      preferredTeamSize: z.number().default(4).optional(),
      willingToLead: z.boolean().default(false).optional(),
    })
    .optional(),

  // Availability
  availability: z.enum(AvailableProfileAvailability).optional(),

  // Presentation
  avatarUrl: z.string().trim().optional(),
})

export { profileValidationSchema }
