import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import User from "../models/user.models.js"
import {
  registerUserSchema,
  loginUserSchema,
  forgotPasswordSchema,
  resetForgottenPasswordSchema,
} from "../validators/auth.validators.js"
import { UserRolesEnum, UserLoginType } from "../constants.js"
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendMail,
} from "../utils/mail.js"
import crypto from "crypto"
import { uploadCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import axios from "axios"

const cookieOptions = () => {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  }
}

// const registerUser = asyncHandler(async (req, res) => {
//   const validate = registerUserSchema.safeParse(req.body)
//   if (!validate.success)
//     throw new ApiError(
//       401,
//       validate.error.issues.map((mess) => mess.message)
//     )

//   const { email, password } = req.body

//   const existingUser = await User.findOne({
//     email,
//   })
//   if (existingUser)
//     throw new ApiError(409, "user with username or email already exists")

//   const user = await User.create({
//     email,
//     username: email.split("@")[0],
//     password,
//     isEmailVerified: false,
//     // role: role || UserRolesEnum.USER
//   })

//   // not doing the mail thing for now !!
//   const { unHashedToken, hashedToken, tokenExpiry } =
//     user.generateTemporaryToken()

//   user.emailVerificationToken = hashedToken
//   user.emailVerificationExpiry = tokenExpiry
//   await user.save({ validateBeforeSave: false })

//   await sendMail({
//     email: user?.email,
//     subject: "Please verify your email",
//     mailgenContent: emailVerificationMailgenContent(
//       user.username,
//       `${req.protocol}://${req.get(
//         "host"
//       )}/api/v1/auth/verify-email/${unHashedToken}`
//     ),
//   })

//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
//   )

//   const accessToken = user.generateAccessToken()
//   const refreshToken = user.generateRefreshToken()

//   if (!createdUser)
//     throw new ApiError(500, "Something went wrong while registering the user")
//   return res
//     .status(201)
//     .cookie("accessToken", accessToken, cookieOptions())
//     .cookie("refreshToken", refreshToken, cookieOptions())
//     .json(
//       new ApiResponse(
//         200,
//         createdUser,
//         "User registered successfully and verification email has been sent on your email"
//       )
//     )
// })

const registerUser = asyncHandler(async (req, res) => {
  console.time("register_total")

  // Validate
  const validate = registerUserSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((m) => m.message)
    )

  const { email, password } = req.body

  // quick existing check (lean to reduce memory)
  console.time("check_existing")
  const existingUser = await User.findOne({ email }).lean()
  console.timeEnd("check_existing")
  if (existingUser)
    throw new ApiError(409, "user with username or email already exists")

  // Build instance so we can run instance methods before a single save
  console.time("build_user")
  const user = new User({
    email,
    username: email.split("@")[0],
    password,
    isEmailVerified: false,
  })
  console.timeEnd("build_user")

  // Generate tokens (temp) on the instance BEFORE persisting so we keep single DB write
  console.time("generate_temp_token")
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken()
  user.emailVerificationToken = hashedToken
  user.emailVerificationExpiry = tokenExpiry
  console.timeEnd("generate_temp_token")

  // Single DB write (this triggers pre-save hashing once)
  console.time("save_user")
  await user.save() // one DB round-trip
  console.timeEnd("save_user")

  // Prepare safe user for response (no extra findById required)
  const createdUser = user.toObject()
  delete createdUser.password
  delete createdUser.refreshToken
  delete createdUser.emailVerificationToken
  delete createdUser.emailVerificationExpiry

  // Generate access + refresh tokens (fast)
  console.time("generate_tokens")
  // If these are synchronous (jwt.sign) they are fast. If async, await them.
  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()
  console.timeEnd("generate_tokens")

  // Fire-and-forget email (do NOT await) — logs errors
  // ;(async () => {
  //   try {
  //     await sendMail({
  //       email: user.email,
  //       subject: "Please verify your email",
  //       mailgenContent: emailVerificationMailgenContent(
  //         user.username,
  //         `${req.protocol}://${req.get(
  //           "host"
  //         )}/api/v1/auth/verify-email/${unHashedToken}`
  //       ),
  //     })
  //   } catch (err) {
  //     console.error("Email send failed for user:", user.email, err)
  //     // optionally push to a retry queue here
  //   }
  // })()

  // simply send a req to the ec2 for sending a mail
  // const sendMail = {
  //   email: user.email,
  //   subject: "Please verify your email",
  //   mailgenContent: emailVerificationMailgenContent(
  //     user.username,
  //     `${req.protocol}://${req.get(
  //       "host"
  //     )}/api/v1/auth/verify-email/${unHashedToken}`
  //   ),
  // }

  axios.post(
    process.env.MAIL_SERVICE_URL +
      "/verify-email/" +
      unHashedToken +
      "/" +
      process.env.MAIL_SERVICE_TOKEN,
    {
      email: user.email,
    }
  )

  // Send response fast
  console.timeEnd("register_total")
  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions())
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(
        200,
        createdUser,
        "User registered successfully; verification email sent"
      )
    )
})

const loginUser = asyncHandler(async (req, res) => {
  const validate = loginUserSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      400,
      validate.error.issues.map((mess) => mess.message)
    )

  const { email, password } = req.body

  const user = await User.findOne({
    email,
  })

  if (!user)
    throw new ApiError(
      404,
      "User with provided username and email does not exist"
    )

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
    throw new ApiError(
      400,
      "You have previously registered using " +
        user.loginType?.toLowerCase() +
        ". Please use the " +
        user.loginType?.toLowerCase() +
        " login option to access your account."
    )
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) throw new ApiError(400, "invalid credentials")

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  )

  loggedInUser.refreshToken = refreshToken
  await loggedInUser.save({ validateBeforeSave: false })

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions())
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true }
  )

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions())
    .clearCookie("refreshToken", cookieOptions())
    .json(new ApiResponse(200, {}, "User logged out"))
})

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params

  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing")
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex")

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  })

  // if (!user) throw new ApiError(489, "Token is invalid or expired")
  if (!user)
    return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verified</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .btn {
          margin-top: 20px;
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .btn:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>✅ Email vrification failed</h2>
        <p>Token is either expired or invalid</p>
        <a class="btn" href="https://code-pair-arena.netlify.app">Continue</a>
      </div>
    </body>
    </html>
  `)

  user.emailVerificationToken = undefined
  user.emailVerificationExpiry = undefined
  user.isEmailVerified = true
  await user.save({ validateBeforeSave: false })

  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email Verified</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f3f4f6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .btn {
          margin-top: 20px;
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .btn:hover {
          background: #1d4ed8;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>✅ Email Successfully Verified!</h2>
        <p>You can now continue to the application.</p>
        <a class="btn" href="https://code-pair-arena.netlify.app">Continue</a>
      </div>
    </body>
    </html>
  `)
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  console.log("req.cookies.refreshToken: ", req.cookies.refreshToken)
  console.log("req.body.refreshToken: ", req.body?.refreshToken)
  const incomingRefreshToken = req.cookies.refreshToken
  console.log("incoming refreh token: ", incomingRefreshToken)

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request")

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)
    if (!user) throw new ApiError(401, "Invalid refresh token")

    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh token is expired or used")

    const accessToken = user.generateAccessToken()
    const newRefreshToken = user.generateRefreshToken()

    user.refreshToken = newRefreshToken
    await user.save()

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions())
      .cookie("refreshToken", newRefreshToken, cookieOptions())
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const validate = forgotPasswordSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((mess) => mess.message)
    )

  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) throw new ApiError(404, "User does not exists", [])

  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken()

  user.forgotPasswordToken = hashedToken
  user.forgotPasswordExpiry = tokenExpiry
  await user.save({ validateBeforeSave: false })

  console.log(
    await sendMail({
      email: user?.email,
      subject: "Password reset request",
      mailgenContent: forgotPasswordMailgenContent(
        user.username,
        // ! NOTE: Following link should be the link of the frontend page responsible to request password reset
        // ! Frontend will send the below token with the new password in the request body to the backend reset password endpoint
        `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
      ),
    })
  )
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id"
      )
    )
})

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const validate = resetForgottenPasswordSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((mess) => mess.message)
    )

  const { resetToken } = req.params
  const { newPassword } = req.body

  let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  })

  if (!user) throw new ApiError(489, "Token is invalid or expired")

  user.forgotPasswordToken = undefined
  user.forgotPasswordExpiry = undefined

  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"))
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const validate = resetForgottenPasswordSchema.safeParse(req.body)
  if (!validate.success)
    throw new ApiError(
      401,
      validate.error.issues.map((mess) => mess.message)
    )

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordValid = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log(req.user)
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.filename) throw new ApiError(400, "Avatar image is required")

  const avatarLocalPath = req.file.path

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required")
  const avatar = await uploadCloudinary(avatarLocalPath)
  if (!avatar) throw new ApiError(400, "failed to upload on cloudinary")

  const user = await User.findById(req.user._id)

  let updatedUser = await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  )

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"))
})

const handleSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id)

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  return res
    .cookie("accessToken", accessToken, cookieOptions())
    .cookie("refreshToken", refreshToken, cookieOptions())
    .redirect(
      // redirect user to the frontend with access and refresh token in case user is not using cookies
      `${process.env.CORS_ORIGIN}/setter/${accessToken}/${refreshToken}`
    )
  // .redirect(
  //   // redirect user to the frontend with access and refresh token in case user is not using cookies
  //   `http://localhost:3001/setter/${accessToken}/${refreshToken}`
  // )
  // // .status(301)
  // .json(new ApiResponse(200, "user created sucessfully via google", user))
})

const cookieSetter = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = req.body

  console.log("This is the incoming accessToken: ", accessToken)
  console.log("This is the incoming refreshToken: ", refreshToken)
  
  const isAccessTokenValid = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  )
  if (!isAccessTokenValid) throw new ApiError(401, "accessToken is invalid")
  
  const isRefreshTokenValid = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  if (!isRefreshTokenValid) throw new ApiError(401, "refreshToken is invalid")
  if(!accessToken || !refreshToken)
    throw new ApiError(400, "token to send krr bc!!")

  return res
    .cookie("accessToken", accessToken, cookieOptions())
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken },
        "hoo gyii bhenchod cookie set bsdki !! "
      )
    )
})
export {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgottenPassword,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  handleSocialLogin,
  cookieSetter
}
