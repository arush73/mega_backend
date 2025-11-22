import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    feedback: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
},{timestamps:true})

export const Feedback = mongoose.model("Feedback", feedbackSchema)
