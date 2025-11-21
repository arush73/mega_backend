import { Router } from "express"

const router = Router()

import {
  getTeams,
  createTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
} from "../controllers/team.controllers.js"

export default router
