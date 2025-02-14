import { Router } from "express";
import { 
    getAllTimelines,
    saveTimeline 
} from "../controllers/Timelines.controller.js";

const router = Router();

router.route("/save-timeline").post(saveTimeline);
router.route("/get-all-timeline").get(getAllTimelines);

export default router;
