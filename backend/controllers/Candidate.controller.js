import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { Candidate } from "../models/Candidate.model.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import jwt from "jsonwebtoken";
import { Logo } from "../models/Logo.model.js";
import sendEmail from "../helpers/sendEmail.js";

const generateAccessAndRefreshTokens = async (candidateId) => {
  try {
    const candidate = await Candidate.findById(candidateId);
    const accessToken = await candidate.generateAccessToken();
    const refreshToken = await candidate.generateRefreshToken();
    candidate.refreshToken = refreshToken;
    await candidate.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const getPublicHash = async (candidateId) => {
  try {
    const candidate = await Candidate.findById(candidateId);
    const publicHash = await candidate.generatePublicHash();

    candidate.publicHash = publicHash;

    await candidate.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating public hash"
    );
  }
};

const registerCandidate = asyncHandler(async (req, res) => {
  // get Candidate details from frontend
  const { name, username, email, hashed_password, logo } = req.body;

  // validation - not empty
  if (
    [email, name, hashed_password, username, logo].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // check if Candidate already exists: username, email
  const existedCandidate = await Candidate.findOne({
    $or: [{ email }, { username }],
  });

  if (existedCandidate) {
    throw new ApiError(409, "Candidate with email or username already exists");
  }

  const getLogo = await Logo.findById(logo);

  if (!getLogo) {
    throw new ApiError(401, "Logo not found");
  }

  if (getLogo.isUsed) {
    throw new ApiError(409, "Logo is already used");
  }

  await Logo.findByIdAndUpdate(
    logo,
    {
      $set: {
        isUsed: true,
      },
    },
    { new: true }
  );

  // create Candidate object - create entry in db
  const candidate = await Candidate.create({
    username,
    name,
    hashed_password,
    email,
    logo,
  });

  getPublicHash(candidate._id);

  // remove password and refresh token field from response
  const createdCandidate = await Candidate.findById(candidate._id).select(
    "-hashed_password -refreshToken2 -publicHash"
  );

  // check for Candidate creation
  if (!createdCandidate) {
    throw new ApiError(
      500,
      "Something went wrong while registering the Candidate"
    );
  }

  const subject = "Candidate's Public Hash";

  const candidatePH = await Candidate.findById(candidate._id).select(
    "publicHash"
  );

  const message = `Dear ${createdCandidate.name},\n  Thankyou for registering as a candidate. Your public hash is ${candidatePH.publicHash}`;

  sendEmail({ email: createdCandidate.email, subject, message });

  // return res
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        createdCandidate,
        "Candidate registered successfully"
      )
    );
});

const loginCandidate = asyncHandler(async (req, res) => {
  // Steps -:

  // get data from req.body
  const { email, username, hashed_password } = req.body;

  // username or email
  if (!email) {
    throw new ApiError(400, "email is required");
  }

  if (!username) {
    throw new ApiError(400, "username is required");
  }

  // find the Candidate
  const candidate = await Candidate.findOne({ $or: [{ email }, { username }] });

  if (!candidate) {
    throw new ApiError(404, "Candidate does not exist");
  }

  // password check

  const isPasswordValid = await candidate.isPasswordCorrect(hashed_password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  // access and refresh token generate
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    candidate._id
  );

  // send cookies
  const loggedInCandidate = await Candidate.findById(candidate._id).select(
    "-password -refreshToken2 -publicHash"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedInCandidate,
          accessToken,
          refreshToken,
        },
        "Candidate logged In Successfully"
      )
    );
});

const logoutCandidate = asyncHandler(async (req, res) => {
  await Candidate.findByIdAndUpdate(
    req.candidate._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "Candidate logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const candidate = await Candidate.findById(decodedToken?._id);

    if (!candidate) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== candidate?.refreshToken) {
      next();
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      candidate._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const candidate = await Candidate.findById(req.candidate?._id);

  const isPasswordCorrect = await Candidate.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(404, "incorrect old password");
  }

  candidate.hashed_password = newPassword;
  candidate.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed successfully"));
});

const getCurrentCandidate = asyncHandler(async (req, res) => {
  const candidate = req.candidate;
  return res
    .status(200)
    .json(
      new ApiResponse(200, candidate, "Current Candidate fetched successfully")
    );
});

const getCandidate = asyncHandler(async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({
      message: "Candidate ID is required.",
    });
  }

  try {
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found.",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, candidate, "Candidate fetched successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, {}, "Server error. Could not fetch candidate.")
      );
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "All fields are required");
  }

  const candidate = await Candidate.findByIdAndUpdate(
    req.candidate?._id,
    {
      $set: {
        name,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, candidate, "Account details is updated successfully")
    );
});

const deleteCandidate = asyncHandler(async (req, res) => {
  const candidateId = req.candidate?._id;

  if (!candidateId) {
    throw new ApiError(400, "Candidate not found");
  }

  const candidate = await Candidate.findById(candidateId);

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  const deletedCandidate = await Voter1.findByIdAndDelete(voter1Id);

  if (!deletedCandidate) {
    throw new ApiError(404, "Candidate not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Candidate deleted successfully"));
});

const getAllCandidates = asyncHandler(async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    return res
      .status(200)
      .json(
        new ApiResponse(200, candidates, "All Candidate fetched successfully")
      );
  } catch (err) {
    console.error("Error fetching candidates:", err);
  }
});

export {
  registerCandidate,
  loginCandidate,
  logoutCandidate,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentCandidate,
  updateAccountDetails,
  deleteCandidate,
  getAllCandidates,
  getCandidate,
};
