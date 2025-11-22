import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { teamValidationSchema } from "../validators/team.validators.js"
import { Team } from "../models/team.models.js"
import { User } from "../models/user.models.js"

const getTeams = asyncHandler(async (req, res) => {
  //logic to get teams will have to think about it

  return res.status(200).json(new ApiResponse(200, {},"Team created successfully"))
})

const createTeam = asyncHandler(async (req, res) => {
  const validate = teamValidationSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const { name, description, startDate, endDate, isActive, members } = req.body

const team = await Team.create({
  name,
  description,
  startDate,
  endDate,
  isActive,
  members,
})
  if (!team) throw new ApiError(500, "failed to create team")

  return res.json(new ApiResponse("Team created successfully", team))
})

const addMemberToTeam = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params

  const team = await Team.findById(teamId)
  if (!team) throw new ApiError(404, "Team not found")

  const member = await User.findById(memberId)
  if (!member) throw new ApiError(404, "Member not found")

  const updateMemberInTeam = team.members.push(memberId)
  await team.save()
  if (!updateMemberInTeam) throw new ApiError(500, "failed to add member to team")

  const updateMemberInUser = member.teams.push(teamId)
  await member.save()
  if (!updateMemberInUser) throw new ApiError(500, "failed to add member to user")

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
  if (!updateMemberInTeam) throw new ApiError(500, "failed to remove member from team")

  const updateMemberInUser = member.teams.pull(teamId)
  await member.save()
  if (!updateMemberInUser) throw new ApiError(500, "failed to remove member from user")

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

export {
  getTeams,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
}
