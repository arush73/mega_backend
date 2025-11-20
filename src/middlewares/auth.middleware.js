import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import User from "../models/user.models.js"
import jwt from "jsonwebtoken"

const verifyJWT = asyncHandler(async (req, res, next) => {

  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")
  
console.log("Incoming token: ", token)
  

  if (!token) throw new ApiError(401, "Unauthorized request")

  try {
    console.log(
    
      "this is the access token secret: ", 
    )
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    console.log("This is the decoded token: ", decodedToken)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    if (!user) {
      throw new ApiError(401, "Invalid access token")
    }
    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token")
  }
})

const verifyRole = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      throw new ApiError(401, "Unauthorized request")
    }
    if (roles.includes(req.user?.role)) {
      next()
    } else {
      throw new ApiError(403, "You are not allowed to perform this action")
    }
  })

export { verifyJWT, verifyRole }
