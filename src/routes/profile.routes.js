import { Router } from "express"
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"
import { UserRolesEnum } from "../constants.js"

const router = Router()

router.use(verifyJWT)

import {
  addProfile,
  updateProfile,
  deleteProfile,
  getProfile,
  listProfiles,
  addCohortToProfile,
} from "../controllers/profile.controllers.js"

router.route("/").post(addProfile).get(listProfiles)
router
  .route("/:profileId")
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile)
router
  .route("/:profileId/cohort")
  .post(verifyRole(UserRolesEnum.ADMIN), addCohortToProfile)

export default router
