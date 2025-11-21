import { Router } from "express"
import {
  deleteMessage,
  getAllMessages,
  sendMessage,
} from "../controllers/message.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"

const router = Router()

router.use(verifyJWT)

router
  .route("/:chatId")
  .get(getAllMessages)
  .post(upload.fields([{ name: "attachments", maxCount: 5 }]), sendMessage)

router.route("/:chatId/:messageId").delete(deleteMessage)

export default router
