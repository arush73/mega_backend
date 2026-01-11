import mongoose from "mongoose"
import { AvailableChannelTypes, AvailableChatTypes } from "../constants.js"

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: AvailableChannelTypes,
        required: true,
    },
})

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: AvailableChatTypes,
      required: true,
    },
    channels: [
      {
        type: channelSchema,
        required: true,
      },
    ],
    name: {
      type: String,
      required: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

export const Chat = mongoose.model("Chat", chatSchema)
