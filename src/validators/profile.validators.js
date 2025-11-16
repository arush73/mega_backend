import { z } from "zod"

// Utility: MongoDB ObjectId validator
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")

// Basic string
const str = z.string().trim().optional()
const urlStr = z.string().url().optional()

// Project item schema
const projectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  role: z.string().optional(),
})

// Experience schema
const experienceSchema = z.object({
  years: z.number().min(0).optional(),
  summary: z.string().optional(),
})

// Social links schema
const socialSchema = z.object({
  github: urlStr,
  linkedin: urlStr,
  website: urlStr,
  twitter: urlStr,
})

// Preferences schema
const preferencesSchema = z.object({
  preferredRoles: z.array(z.string()).optional(),
  preferredTeamSize: z.number().default(4).optional(),
  willingToLead: z.boolean().default(false).optional(),
})

// Main Profile validator
export const addProfileSchema = z.object({
  // Required on create
  user: objectId,

  // Basic identity
  fullName: str,
  displayName: str,
  pronouns: str,
  title: str,
  bio: z.string().optional(),

  // Cohort
  cohort: objectId.optional(),

  // Skills, roles, experience
  skills: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  experience: experienceSchema.optional(),

  // Projects
  projects: z.array(projectSchema).optional(),

  // Social
  social: socialSchema.optional(),

  // Preferences
  preferences: preferencesSchema.optional(),

  // Availability
  availability: z.enum(["available", "busy", "maybe"]).optional(),

  // Presentation
  avatarUrl: urlStr,
})

// For update -> everything optional
export const updateProfileSchema = profileZodSchema
  .omit({ user: true })
  .partial()
