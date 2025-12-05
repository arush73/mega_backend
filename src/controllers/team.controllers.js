import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { teamValidationSchema } from "../validators/team.validators.js"
import { Team } from "../models/team.models.js"
import { User } from "../models/user.models.js"
// import mongoose from "mongoose"

const createTeam = asyncHandler(async (req, res) => {
  // 1) Validate
  const parsed = teamValidationSchema.safeParse(req.body)
  if (!parsed.success) {
    throw new ApiError(
      400,
      parsed.error.issues.map((i) => i.message)
    )
  }

  // 2) Destructure & normalise
  const { name, description, admin, members = [], leaders = [] } = parsed.data

  // ensure arrays and dedupe (so updateMany isn't wasteful)
  const memberIds = Array.isArray(members)
    ? [...new Set(members.map(String))]
    : []
  const leaderIds = Array.isArray(leaders)
    ? [...new Set(leaders.map(String))]
    : []

  // 3) Optional: quick existence check for members (single DB call)
  if (memberIds.length) {
    const foundMembers = await User.countDocuments({ _id: { $in: memberIds } })
    if (foundMembers !== memberIds.length) {
      throw new ApiError(404, "One or more members not found")
    }
  }

  // 4) Create team (simple)
  const team = await Team.create({
    name,
    description,
    admin,
    members: memberIds,
    leaders: leaderIds,
  })
  if (!team) throw new ApiError(500, "failed to create team")

  // 5) Add team ref in users in one go (no loop)
  if (memberIds.length) {
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $addToSet: { teams: team._id } } // adjust `teams` if your user schema uses different field
    )
  }

  // 6) Also ensure leaders have the team ref (if leaders are separate)
  if (leaderIds.length) {
    await User.updateMany(
      { _id: { $in: leaderIds } },
      { $addToSet: { teams: team._id } }
    )
  }

  // 7) Return created team (optionally populated)
  const populated = await Team.findById(team._id)
    .populate("members", "name email")
    .populate("leaders", "name email")
    .populate("admin", "name email")

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Team created successfully"))
})

// const createTeam = asyncHandler(async (req, res) => {
//   // 1) Validate request body with zod (or your validator)
//   const parsed = teamValidationSchema.safeParse(req.body)
//   if (!parsed.success) {
//     throw new ApiError(
//       400,
//       parsed.error.issues.map((i) => i.message)
//     )
//   }

// //   // 2) Destructure and normalise members array
//   const {
//     name,
//     description,
//     admin = [],
//     members = [],
//     leaders = [],
//   } = parsed.data

//   const team = await Team.create({
//     name,
//     description,
//     admin,
//     members,
//     leaders,
//   })
//   if (!team) throw new ApiError(500, "failed to create team")

//   for (const memberId of members) {
//     const member = await User.findById(memberId)
//     if (!member) throw new ApiError(404, "Member not found")
//     const updateMemberInTeam = member.teams.push(team._id)
//     await member.save()
//     if (!updateMemberInTeam)
//       throw new ApiError(500, "failed to add member to team")
//   }

//   return res.json(new ApiResponse("Team created successfully", team))
// })

// const createTeam = asyncHandler(async (req, res) => {
//   // 1) Validate request body with zod (or your validator)
//   const parsed = teamValidationSchema.safeParse(req.body)
//   if (!parsed.success) {
//     throw new ApiError(
//       400,
//       parsed.error.issues.map((i) => i.message)
//     )
//   }

//   // 2) Destructure and normalise members array
//   const {
//     name,
//     description,
//     admin = [],
//     members = [],
//     leaders = [],
//   } = parsed.data

//   // Ensure members/leaders are arrays and dedupe ids
//   const memberIds = Array.isArray(members) ? [...new Set(members.map(String))] : []
//   const leaderIds = Array.isArray(leaders) ? [...new Set(leaders.map(String))] : []

//   // Basic sanity checks
//   if (memberIds.length < 2) {
//     // optional: allow zero-member team. Remove this if you require at least one member.
//     throw new ApiError(400, "At least two members are required")
//   }

//   // 3) Start a session for transaction (atomicity)
//   const session = await mongoose.startSession()
//   session.startTransaction()
//   try {
//     // 4) Verify admin exists (if provided)
//     if (admin) {
//       const adminExists = await User.exists({ _id: admin }).session(session)
//       if (!adminExists) throw new ApiError(404, "Admin user not found")
//     }

//     // 5) Verify that all provided member IDs exist in one query
//     if (memberIds.length) {
//       const foundCount = await User.countDocuments({ _id: { $in: memberIds } }).session(session)
//       if (foundCount !== memberIds.length) {
//         throw new ApiError(404, "Two or more members not found")
//       }
//     }

//     // 6) Optionally verify leaders exist
//     if (leaderIds.length) {
//       const foundLeaders = await User.countDocuments({ _id: { $in: leaderIds } }).session(session)
//       if (foundLeaders !== leaderIds.length) {
//         throw new ApiError(404, "Two or more leaders not found")
//       }
//     }

//     // 7) Create team document within the transaction
//     const team = await Team.create(
//       [
//         {
//           name,
//           description,
//           members: memberIds,
//           admin,
//           leaders: leaderIds,
//         },
//       ],
//       { session }
//     )
//     const createdTeam = team[0]
//     if (!createdTeam) throw new ApiError(500, "Failed to create team")

//     // 8) Add team reference to all member documents in a single update
//     if (memberIds.length) {
//       await User.updateMany(
//         { _id: { $in: memberIds } },
//         { $addToSet: { teams: createdTeam._id } }, // assumes `teams` array exists on User schema
//         { session }
//       )
//     }

//     // 9) Also add team ref to leaders (if leaders are separate from members)
//     if (leaderIds.length) {
//       await User.updateMany(
//         { _id: { $in: leaderIds } },
//         { $addToSet: { teams: createdTeam._id } },
//         { session }
//       )
//     }

//     // Commit transaction
//     await session.commitTransaction()
//     session.endSession()

//     // 10) Populate response fields (non-transactional read — cheap)
//     const populatedTeam = await Team.findById(createdTeam._id)
//       .populate("members", "name email") // adjust fields as needed
//       .populate("leaders", "name email")
//       .populate("admin", "name email")

//     return res.status(201).json(new ApiResponse(201, populatedTeam, "Team created successfully"))
//   } catch (err) {
//     // Abort transaction on error
//     await session.abortTransaction()
//     session.endSession()
//     throw err
//   }
// })

const addMemberToTeam = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params

  const team = await Team.findById(teamId)
  if (!team) throw new ApiError(404, "Team not found")

  const member = await User.findById(memberId)
  if (!member) throw new ApiError(404, "Member not found")

  const updateMemberInTeam = team.members.push(memberId)
  await team.save()
  if (!updateMemberInTeam)
    throw new ApiError(500, "failed to add member to team")

  const updateMemberInUser = member.teams.push(teamId)
  await member.save()
  if (!updateMemberInUser)
    throw new ApiError(500, "failed to add member to user")

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Member ${memberId} added to team ${teamId} successfully`
      )
    )
})

const removeMemberFromTeam = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params

  const team = await Team.findById(teamId)
  if (!team) throw new ApiError(404, "Team not found")

  const member = await User.findById(memberId)
  if (!member) throw new ApiError(404, "Member not found")

  const updateMemberInTeam = team.members.pull(memberId)
  await team.save()
  if (!updateMemberInTeam)
    throw new ApiError(500, "failed to remove member from team")

  const updateMemberInUser = member.teams.pull(teamId)
  await member.save()
  if (!updateMemberInUser)
    throw new ApiError(500, "failed to remove member from user")

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        `Member ${memberId} removed from team ${teamId} successfully`
      )
    )
})

const deleteTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params

  const deleteTeam = await Team.findByIdAndDelete(teamId)
  if (!deleteTeam) throw new ApiError(500, "failed to delete team")

  return res
    .status(200)
    .json(new ApiResponse(200, {}, `Team ${teamId} deleted successfully`))
})

const getTeamsForUser = asyncHandler(async (req, res) => {
  //logic to get teams will have to think about it
  const userId = req.user._id

  const teams = await Team.find({
    user: userId,
  })
  if (!teams) throw new ApiError(500, "Failed to get the teams")

  return res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams fetched successfully"))
})

// will return all the teams that are there in the dataabase
const getAllTeamsForAdmin = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  const teams = await Team.find()
  if (!teams)
    throw new ApiError(500, "failed to fetch the teams from the database")

  return res.status(200, teams, "all the teams fetched successfully")
})

const addMembersToTeam = asyncHandler(async (req, res) => {
  const { members } = req.body
  const { teamId } = req.params
  if (!teamId) throw new ApiError(400, "teamId not found in the req params")

  // logic to validate whether members is an array or not

  let allMembersExists = true
  for (const userId of members) {
    const userExists = await User.findById(userId)

    if (!userExists) allMembersExists = false
  }

  if (!allMembersExists) throw new ApiError(401, "some member does not exist")

  const addMembers = await Team.findByIdAndUpdate(teamId, {
    members: {
      $push: {
        members,
      },
    },
  })

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addMembers,
        `members ${members} added to the team ${teamId} successfully`
      )
    )
})

const removeAnyMemberFromAnyTeam = asyncHandler(async (req, res) => {
  const { memberId, teamId } = req.body

  if (!memberId || !teamId) {
    throw new ApiError(400, "teamId or memberId is missing from req body")
  }

  const team = await Team.findById(teamId)
  if (!team) throw new ApiError(404, "Team not found")

  const memberExists = team.members.includes(memberId)
  if (!memberExists) {
    throw new ApiError(400, "This member is not in the team")
  }

  team.members = team.members.filter(
    (m) => m.toString() !== memberId.toString()
  )

  await team.save()

  return res.status(200).json({
    success: true,
    message: "Member removed from team",
    team,
  })
})

export {
  getTeamsForUser,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
  addMembersToTeam,
  getAllTeamsForAdmin,
  removeAnyMemberFromAnyTeam,
}
