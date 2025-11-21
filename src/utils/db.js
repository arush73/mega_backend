import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log("This is the database URI: ", process.env.MONGODB_URI)
    console.log("database connected succesfully")
  } catch (error) {
    process.exit(1)
  }
}

export default connectDB
