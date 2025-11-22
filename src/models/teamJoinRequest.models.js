import mongoose from "mongoose"
import {
  TeamJoinRequestStatus,
  AvailableTeamJoinRequestStatus,
} from "../constants"

const teamJoinRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableTeamJoinRequestStatus,
      default: TeamJoinRequestStatus.PENDING,
    },
  },
  { timestamps: true }
)

export const TeamJoinRequest = mongoose.model(
  "TeamJoinRequest",
  teamJoinRequestSchema
)
