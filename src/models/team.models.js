import mongoose from "mongoose"

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    leaders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  }
)

export const Team = mongoose.model("Team", teamSchema)
