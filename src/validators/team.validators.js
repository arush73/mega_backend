import { z } from "zod"
import mongoose from "mongoose"

// Helper to validate MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId format",
  })

const teamValidationSchema = z.object({
  name: z.string().trim().min(1, "Team name is required"),

  members: z.array(objectIdSchema).optional(),

  admin: objectIdSchema, // required

  leaders: z.array(objectIdSchema).optional(),

  description: z.string().trim().optional(),

  projects: z.array(objectIdSchema).optional(),
})

export { teamValidationSchema }
