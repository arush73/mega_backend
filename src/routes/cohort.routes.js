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
  getCohortDetails,
  listCohorts,
  addMemberToCohort,
} from "../controllers/cohort.controllers.js"

router.route("/").post(addCohort).get(listCohorts)
router
  .route("/:cohortId")
  .get(getCohortDetails)
  .put(updateCohort)
  .delete(deleteCohort)
router.route("/add-member/:cohortId/:memberId").patch(addMemberToCohort)

export default router
