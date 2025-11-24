import mongoose from "mongoose"
import { AvailableCohortChannelTypes } from "../constants.js"

const cohortGlobalChatSchema = new mongoose.Schema(
  {
    cohortId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cohort",
      required: true,
    },
    channels: [
      {
        channelType: {
          type: String,
          enum: AvailableCohortChannelTypes,
          default: "TEXT",
        },
        name: {
          type: String,
          required: true,
        },
        messages: [
          {
            sender: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            message: {
              type: String,
              required: true,
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const CohortGlobalChat = mongoose.model(
  "CohortGlobalChat",
  cohortGlobalChatSchema
)
