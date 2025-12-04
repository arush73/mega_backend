import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { teamValidationSchema } from "../validators/team.validators.js"
import { Team } from "../models/team.models.js"
import { User } from "../models/user.models.js"

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

  for (const memberId of members) {
    const member = await User.findById(memberId)
    if (!member) throw new ApiError(404, "Member not found")
    const updateMemberInTeam = member.teams.push(team._id)
    await member.save()
    if (!updateMemberInTeam)
      throw new ApiError(500, "failed to add member to team")
  }

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
    user: userId
  })
  if(!teams) throw new ApiError(500,"Failed to get the teams")

  return res
    .status(200)
    .json(new ApiResponse(200, teams, "Teams fetched successfully"))
})

// will return all the teams that are there in the dataabase
const getAllTeamsForAdmin = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  const teams = await Team.find()
  if (!teams) throw new ApiError(500, "failed to fetch the teams from the database")
  
  return res.status(200, teams, "all the teams fetched successfully")
})

const addMembersToTeam = asyncHandler(async(req, res) => {
  const { members } = req.body
  const { teamId } = req.params
  if(!teamId) throw new ApiError(400,"teamId not found in the req params")

  // logic to validate whether members is an array or not 

  let allMembersExists = true
  for (const userId of members) {
    const userExists = await User.findById(userId)

    if(!userExists) allMembersExists = false
  }

  if (!allMembersExists) throw new ApiError(401, "some member does not exist")
  
  const addMembers = await Team.findByIdAndUpdate(teamId, {
    members: {
      $push: {
        members
      }
    }
  })

  return res
    .status(200)
    .json(new ApiResponse(200, addMembers, `members ${members} added to the team ${teamId} successfully`))
})

const removeAnyMemberFromAnyTeam = asyncHandler(async (req, res) => {
  const { memberId, teamId } = req.body;

  if (!memberId || !teamId) {
    throw new ApiError(400, "teamId or memberId is missing from req body");
  }

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, "Team not found");

  const memberExists = team.members.includes(memberId);
  if (!memberExists) {
    throw new ApiError(400, "This member is not in the team");
  }

  team.members = team.members.filter(
    (m) => m.toString() !== memberId.toString()
  );

  await team.save();

  return res.status(200).json({
    success: true,
    message: "Member removed from team",
    team,
  });
});



export {
  getTeamsForUser,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
  addMembersToTeam,
  getAllTeamsForAdmin,
  removeAnyMemberFromAnyTeam
}
