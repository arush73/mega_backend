import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { addProfileSchema } from "../validators/profile.validators.js"

const addProfile = asyncHandler(async (req, res) => {
  // Implementation for adding a profile
  const validate = addProfileSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )
  
  
  return res
    .status(201)
    .json(
      new ApiResponse(201, { /* profile data */ }, "Profile added successfully")
    )
})

const updateProfile = asyncHandler(async (req, res) => {
  // Implementation for updating a profile
  const validate = updateProfileSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )
  return res
    .status(200)
    .json(
      new ApiResponse(200, { /* updated profile data */ }, "Profile updated successfully")
    )
})

const deleteProfile = asyncHandler(async (req, res) => {
  // Implementation for deleting a profile
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Profile deleted successfully"))
})

const getProfile = asyncHandler(async (req, res) => {
  // Implementation for retrieving a single profile
  return res.status(200).json(new ApiResponse(200, { /* profile data */ }))
})

const listProfiles = asyncHandler(async (req, res) => {
  // Implementation for listing all profiles
  return res.status(200).json(new ApiResponse(200, [ /* array of profiles */ ]))
})  

export {
    addProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    listProfiles
}