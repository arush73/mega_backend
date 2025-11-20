import mongoose from "mongoose"

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Basic identity
    fullName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    pronouns: { type: String, trim: true },
    title: { type: String, trim: true },
    bio: { type: String },

    // Cohort / program links
    cohort: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cohort" }],

    // Skills, roles and experience
    skills: [{ type: String }],
    roles: [{ type: String }],
    experience: {
      years: { type: Number, min: 0 },
      summary: { type: String },
    },

    // Projects the user has worked on
    projects: [
      {
        name: { type: String },
        description: { type: String },
        url: { type: String },
        role: { type: String },
      },
    ],

    // Social / contact links
    social: {
      github: { type: String },
      linkedin: { type: String },
      website: { type: String },
      twitter: { type: String },
    },

    // Team-building preferences
    preferences: {
      preferredRoles: [{ type: String }],
      preferredTeamSize: { type: Number, default: 4 },
      willingToLead: { type: Boolean, default: false },
    },

    // Availability / status
    availability: {
      type: String,
      enum: ["available", "busy", "maybe"],
      default: "available",
    },

    // Presentation
    avatarUrl: { type: String },

    // Add timestamps via schema options (timestamps: true)
  },
  { timestamps: true }
)

export const Profile = mongoose.model("Profile", profileSchema)
