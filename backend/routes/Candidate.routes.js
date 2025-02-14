import { Router } from "express";
import {
  changeCurrentPassword,
  deleteCandidate,
  getAllCandidates,
  getCandidate,
  getCurrentCandidate,
  loginCandidate,
  logoutCandidate,
  refreshAccessToken,
  registerCandidate,
  updateAccountDetails,
} from "../controllers/Candidate.controller.js";
import { verifyJWT } from "../middlewares/candidate.auth.middleware.js";

const router = Router();

router.route("/register").post(registerCandidate);

router.route("/login").post(loginCandidate);

router.route("/logout").post(verifyJWT, logoutCandidate);

router
  .route("/refresh-token")
  .post(refreshAccessToken, verifyJWT, logoutCandidate);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-candidate").get(verifyJWT, getCurrentCandidate);

router.route("/get-candidate").post(getCandidate);

router.route("/all-candidates").get(getAllCandidates);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.delete("/delete", verifyJWT, deleteCandidate);

export default router;
