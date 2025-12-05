import { z } from "zod"

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")

const teamValidationSchema = z.object({
  name: z
    .string({
      required_error: "Team name is required",
    })
    .trim()
    .min(1, "Team name cannot be empty"),

  admin: z.array(objectId).min(1, "Admin is required"), // required admin

  members: z.array(objectId).optional().default([]),

  leaders: z.array(objectId).optional().default([]),

  description: z.string().trim().optional(),

  projects: z.array(objectId).optional().default([]),
})

export { teamValidationSchema }
