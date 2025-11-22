import { Router } from "express"
import { verifyJWT, verifyRole } from "../middlewares/auth.middleware.js"
import { UserRolesEnum } from "../constants.js"

const router = Router()

router.use(verifyJWT)
router.use(verifyRole(UserRolesEnum.ADMIN))

import {
  getTeams,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
} from "../controllers/team.controllers.js"

router.route("/").get(getTeams).post(createTeam)
router
  .route("/:teamId")
  .put(addMemberToTeam)
  .delete(removeMemberFromTeam)
  .delete(deleteTeam)

export default router
