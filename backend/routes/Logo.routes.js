import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import { clearImageUsage, getImage, getUnusedImages, uploadImages } from "../controllers/Logo.controller.js";

const router = Router();

router.route("/upload-images").post(
    upload.fields([
        {
            name: "image",
            maxCount: 200
        }
    ]),
    uploadImages
)

router.route("/clear-images").post(clearImageUsage);

router.route("/get-user-images").get(getUnusedImages);

router.route("/get-image").post(getImage);

export default router;