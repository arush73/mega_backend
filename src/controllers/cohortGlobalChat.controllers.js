import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { CohortGlobalChat } from "../models/cohortGlobalChat.models.js"

const createCohortGlobalChat = asyncHandler(async (req, res) => {
  const { cohortId } = req.params
  const { name } = req.body

  if (!name) {
    throw new ApiError(400, "Name is required")
  }

  const cohortGlobalChat = await CohortGlobalChat.create({
    cohortId,
    name,
  })

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        cohortGlobalChat,
        "Cohort global chat created successfully"
      )
    )
})

const addChannelToCohortGlobalChat = asyncHandler(async (req, res) => {
  const { cohortId } = req.params
  const { channelName, channelType } = req.body

  if (channelType !== "VOICE" && channelType !== "TEXT") {
    throw new ApiError(400, "Invalid channel type")
  }

  if (!channelName) {
    throw new ApiError(400, "Channel name is required")
  }

  const cohortGlobalChat = await CohortGlobalChat.findOne({ cohortId })

  if (!cohortGlobalChat) {
    throw new ApiError(404, "Cohort global chat not found")
  }

  cohortGlobalChat.channels.push({ name: channelName, channelType })
  await cohortGlobalChat.save()

  return res
    .status(201)
    .json(new ApiResponse(201, cohortGlobalChat, "Channel added successfully"))
})

export { createCohortGlobalChat, addChannelToCohortGlobalChat }
