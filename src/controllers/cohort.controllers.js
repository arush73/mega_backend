import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Cohort } from "../models/cohort.models.js"
import { addCohortSchema } from "../validators/cohort.validators.js"

const addCohort = asyncHandler(async (req, res) => {
  const validate = addCohortSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const { name, description, startDate, endDate, isActive, members } = req.body

  const cohort = await Cohort.create({
    name,
    description,
    startDate,
    endDate,
    isActive,
    members,
  })
  if (!cohort) throw new ApiError(500, "failed to add cohort")

  return res
    .status(201)
    .json(new ApiResponse(201, cohort, "Cohort added successfully"))
})

const updateCohort = asyncHandler(async (req, res) => {
  const validate = addCohortSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const { name, description, startDate, endDate, isActive, members } = req.body

  const cohort = await Cohort.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      startDate,
      endDate,
      isActive,
      members,
    },
    { new: true }
  )
  if (!cohort) throw new ApiError(404, "Cohort not found")
  return res
    .status(200)
    .json(new ApiResponse(200, cohort, "Cohort updated successfully"))
})

const deleteCohort = asyncHandler(async (req, res) => {
  const cohortId = req.params

  const deleteCohort = await Cohort.findByIdAndDelete(cohortId)
  if (!deleteCohort) throw new ApiError(404, "Cohort not found")

  return res
    .status(200)
    .json(new ApiResponse(200, deleteCohort, "Cohort deleted successfully"))
})

const getCohort = asyncHandler(async (req, res) => {
  const cohortId = req.params

  const cohort = await Cohort.findById(cohortId)
  if (!cohort) throw new ApiError(404, "Cohort not found")
  return res
    .status(200)
    .json(new ApiResponse(200, cohort, "Cohort retrieved successfully"))
})

const listCohorts = asyncHandler(async (req, res) => {
  const cohorts = await Cohort.find()
  if (!cohorts) throw new ApiError(404, "Cohorts not found")
  return res
    .status(200)
    .json(new ApiResponse(200, cohorts, "Cohorts retrieved successfully"))
})

export { addCohort, updateCohort, deleteCohort, getCohort, listCohorts }
