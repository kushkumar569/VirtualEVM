import { ApiResponse } from "../helpers/ApiResponse.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { uploadOnCloudinary } from "../helpers/cloudinary.js";
import { Logo } from "../models/Logo.model.js";

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const images = req.files?.image;

    const savedImaged = images.map(async (element) => {
      const localPath = element?.path;

      const file = await uploadOnCloudinary(localPath);

      if (!file) {
        throw new ApiError(400, "Image file is required");
      }

      const image = Logo.create({
        image: file.url,
        name: file.original_filename,
      });

      const createdImage = Logo.findById(image._id);

      if (!createdImage) {
        throw new ApiError(
          500,
          "Something went wrong while uploading the image"
        );
      }

      return createdImage;
    });

    return res
      .status(200)
      .json(new ApiResponse(200, savedImaged, "Images uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while uploading the image");
  }
});

const clearImageUsage = asyncHandler(async (req, res) => {
  Logo.updateMany({}, { $set: { isUsed: false } })
    .then((result) => {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "All images in unused now"));
    })
    .catch((error) => {
      throw new ApiError(
        500,
        "Something went wrong while clearing the image usage"
      );
    });
});

const getUnusedImages = asyncHandler(async (req, res) => {
  try {
    const unusedImages = await Logo.find({ isUsed: false }).sort({name: 1});

    return res
      .status(200)
      .json(new ApiResponse(200, unusedImages, "All images in unused now"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting the image");
  }
});

const getImage = asyncHandler(async (req, res) => {
  try {
    // get Candidate details from frontend
    const { logo } = req.body;
  
    // validation - not empty
    if (!logo) {
      throw new ApiError(400, "Logo id is required.");
    }
  
    const getLogo = await Logo.findById(logo);
  
    if (!getLogo) {
      throw new ApiError(401, "Logo not found");
    }
  
    // return res
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          getLogo,
          "Logo found successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting the image");
  }
});

export { uploadImages, clearImageUsage, getUnusedImages, getImage };
