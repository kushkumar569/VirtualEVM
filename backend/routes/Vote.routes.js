import { Router } from "express";
import {
  countVotes,
  getVotes,
  vote,
} from "../controllers/Vote.controller.js";

const router = Router();

router.route("/voting").post(vote);
router.route("/get-votes").post(getVotes);
router.route("/count-votes").post(countVotes);

export default router;
