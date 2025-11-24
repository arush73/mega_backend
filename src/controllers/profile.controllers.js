import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { profileValidationSchema } from "../validators/profile.validators.js"
import { Cohort } from "../models/cohort.models.js"
import { Profile } from "../models/profile.models.js"
import {User} from "../models/user.models.js"

const addProfile = asyncHandler(async (req, res) => {
  const validate = profileValidationSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const userId = req.user._id
  if (!userId) {
    throw new ApiError(404, "UserId not found")
  }

  const existingProfile = await Profile.findOne({ user: userId })
  if (existingProfile) {
    throw new ApiError(401, "profile already exists")
  }

  const {
    fullName,
    displayName,
    pronouns,
    title,
    bio,
    cohort,
    skills,
    roles,
    experience,
    projects,
    social,
    preferences,
    availability,
    avatarUrl,
  } = req.body

  if (!cohort) {
    throw new ApiError(404, "cohort id not found")
  }

  const cohortExists = await Cohort.findById(cohort)
  if (!cohortExists) {
    throw new ApiError(400, "Cohort does not exist")
  }

  const profile = await Profile.create({
    user: userId,
    fullName,
    displayName,
    pronouns,
    title,
    bio,
    cohort,
    skills,
    roles,
    experience,
    projects,
    social,
    preferences,
    availability,
    avatarUrl,
  })
  if (!profile) throw new ApiError(500, "failed to create profile")
  
  const updateUser = await User.findByIdAndUpdate(userId, { profile: profile._id })
  if (!updateUser) throw new ApiError(500, "failed to link profile to user")

  return res
    .status(201)
    .json(new ApiResponse(201, profile, "Profile added successfully"))
})

const updateProfile = asyncHandler(async (req, res) => {
  const validate = profileValidationSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const profileId = req.params
  if (!profileId) throw new ApiError(404, "profileId not found in the params")

  const {
    fullName,
    displayName,
    pronouns,
    title,
    bio,
    cohort,
    skills,
    roles,
    experience,
    projects,
    social,
    preferences,
    availability,
    avatarUrl,
  } = req.body

  const updatedProfile = await Profile.findByIdAndUpdate(profileId, {
    fullName,
    displayName,
    pronouns,
    title,
    bio,
    cohort,
    skills,
    roles,
    experience,
    projects,
    social,
    preferences,
    availability,
    avatarUrl,
  })

  if (!updatedProfile) throw new ApiError(500, "failed to update the profile")

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        /* updated profile data */
      },
      "Profile updated successfully"
    )
  )
})

const deleteProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params
  if (!profileId) throw new ApiError(404, "profileId not found in the params")

  const deleteProfile = Profile.findByIdAndDelete(profileId)
  if (!deleteProfile) throw new ApiError(500, "failed to delete the profile")

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Profile deleted successfully"))
})

const getProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params
  if (!profileId) throw new ApiError(404, "profileId not found in the params")

  const profile = await Profile.findById(profileId)
  if (!profile) throw new ApiError(404, "failed to find profile")

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "profile fetched sccessfully"))
})

const listProfiles = asyncHandler(async (req, res) => {
  const profiles = await Profile.find()

  return res
    .status(200)
    .json(new ApiResponse(200, profiles, "profiled fetched successfully"))
})

const addCohortToProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params
  if (!profileId) throw new ApiError(404, "profileId not found in the params")

  const profile = await Profile.findById(profileId)
  if (!profile) throw new ApiError(404, "failed to find profile")

  const cohort = req.body.cohort
  if (!cohort) throw new ApiError(404, "provide cohort details in the req")

  if (cohort.length === 0) throw new ApiError(404, "cohort is empty")

  // const updatedCohortProfile = await Cohort.findByIdAndUpdate(cohortId)
  // return res.status(201).json(new ApiResponse(201, updatedCohortProfile))
})

export {
  addProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  addCohortToProfile,
}
