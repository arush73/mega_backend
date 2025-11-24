import { Router } from "express"
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"
import { UserRolesEnum } from "../constants.js"

const router = Router()

// router.use(verifyJWT)
// router.use(verifyRole(UserRolesEnum.ADMIN))

import {
  addCohort,
  updateCohort,
  deleteCohort,
  getCohort,
  listCohorts,
} from "../controllers/cohort.controllers.js"

router.route("/").post(addCohort).get(listCohorts)
router.route("/:cohortId").get(getCohort).put(updateCohort).delete(deleteCohort)

export default router
