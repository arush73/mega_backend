import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Cohort } from "../models/cohort.models.js"
import { addCohortSchema } from "../validators/cohort.validators.js"
import { User } from "../models/user.models.js"
import mongoose from "mongoose"
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

const getCohortDetails = asyncHandler(async (req, res) => {
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

  cohorts.forEach((cohort) => {
    cohort.members = []
  })

  return res
    .status(200)
    .json(new ApiResponse(200, cohorts, "Cohorts retrieved successfully"))
})

const addMemberToCohort = asyncHandler(async (req, res) => {
  const { cohortId } = req.params
  const { memberId } = req.params

  const cohort = await Cohort.findById(cohortId)
  if (!cohort) throw new ApiError(404, "Cohort not found")

  const member = await User.findById(memberId)
  if (!member) throw new ApiError(404, "User not found")

  cohort.members.push(memberId)
  await cohort.save()

  member.cohort.push({
    name: cohort.name,
    id: cohort._id,
  })
  await member.save()

  return res
    .status(200)
    .json(new ApiResponse(200, cohort, "Member added to cohort successfully"))
})

// const addMemberToCohort = asyncHandler(async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { cohortId, memberId } = req.params

//     const cohort = await Cohort.findById(cohortId).session(session);
//     if (!cohort) throw new ApiError(404, "Cohort not found");

//     const member = await User.findById(memberId).session(session);
//     if (!member) throw new ApiError(404, "User not found");

//     cohort.members.addToSet(memberId);
//     member.cohort.addToSet(cohortId);

//     await cohort.save({ session });
//     await member.save({ session });

//     await session.commitTransaction();
//     session.endSession();

//     return res
//       .status(200)
//       .json(new ApiResponse(200, cohort, "Member added to cohort successfully"));
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// });

const getUserCohorts = asyncHandler(async (req, res) => {
  // later will uncomment
  // const userId = req.user?._id

  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, "User not found")

  const cohorts = user.cohort
  if (!cohorts) throw new ApiError(404, "User not enrolled in any cohort")

  const cohortList = []
  for (const cohort of cohorts) {
    const dbResponse = await Cohort.findById(cohort)
    if (!dbResponse) throw new ApiError(404, "Cohort not found")
    cohortList.push(dbResponse)
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cohortList, "Cohorts retrieved successfully"))
})

export {
  addCohort,
  updateCohort,
  deleteCohort,
  getCohortDetails,
  listCohorts,
  addMemberToCohort,
  getUserCohorts,
}
