import { z } from "zod"
import mongoose from "mongoose"

// Helper function for validating MongoDB ObjectId
const objectIdSchema = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid ObjectId format",
  })

const addCohortSchema = z.object({
  name: z.string().trim().min(1, "Cohort name is required"),
  description: z.string().optional(),

  startDate: z.string().datetime().optional(), // ISO string expected → convert to Date in controller

  endDate: z.string().datetime().optional(),

  isActive: z.boolean().optional().default(true),

  members: z.array(objectIdSchema).optional(),
})

export { addCohortSchema }
