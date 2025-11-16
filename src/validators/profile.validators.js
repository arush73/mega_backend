import { z } from "zod"

const addProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long."),
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters long.")
    .optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
})

const updateProfileSchema = addProfileSchema

export { addProfileSchema, updateProfileSchema }
