import mongoose from "mongoose"
import {
  AvailableUserPronouns,
  AvailableProfileAvailability,
} from "../constants.js"

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
    pronouns: {
      type: String,
      enum: AvailableUserPronouns,
      default: "HE/HIM/HIS",
    },
    title: { type: String, trim: true },
    bio: { type: String, trim: true, maxLength: 1000, minLength: 10 },

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
      github: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      website: { type: String, trim: true },
      twitter: { type: String, trim: true },
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
      enum: AvailableProfileAvailability,
      default: "AVAILABLE",
    },

    // Presentation
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true }
)

export const Profile = mongoose.model("Profile", profileSchema)
