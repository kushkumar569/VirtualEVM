import { Router } from "express";
import {
  getVotingTimeline,
  saveVotingTimeline,
} from "../controllers/Voting.controller.js";

const router = Router();

router.route("/save-voting-timeline").post(saveVotingTimeline);
router.route("/get-voting-timeline").get(getVotingTimeline);

export default router;
