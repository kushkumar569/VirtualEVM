import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { Voter1, Voter2 } from "../models/Voter.model.js";
import { ApiResponse } from "../helpers/ApiResponse.js";
import jwt from "jsonwebtoken";
import sendEmail from "../helpers/sendEmail.js";

const generateAccessAndRefreshTokens1 = async (voter1Id) => {
  try {
    const voter1 = await Voter1.findById(voter1Id);
    const accessToken1 = await voter1.generateAccessToken();
    const refreshToken1 = await voter1.generateRefreshToken();
    voter1.refreshToken1 = refreshToken1;
    await voter1.save({ validateBeforeSave: false });
    return { accessToken1, refreshToken1 };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const generateAccessAndRefreshTokens2 = async (voter2Id) => {
  try {
    const voter2 = await Voter2.findById(voter2Id);
    const accessToken2 = await voter2.generateAccessToken();
    const refreshToken2 = await voter2.generateRefreshToken();
    voter2.refreshToken2 = refreshToken2;
    await voter2.save({ validateBeforeSave: false });

    return { accessToken2, refreshToken2 };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

const getPublicHash = async (userId) => {
  try {
    const user = await Voter2.findById(userId);
    const publicHash = await user.generatePublicHash();

    user.publicHash = publicHash;

    await user.save({ validateBeforeSave: false });
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating public hash"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { name, username, email, hashed_password } = req.body;

  // validation - not empty
  if (
    [email, name, hashed_password, username].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  // check if user already exists: username, email
  const existedVoter1 = await Voter1.findOne({ email });

  if (existedVoter1) {
    throw new ApiError(409, "User with email already exists");
  }

  const existedVoter2 = await Voter2.findOne({ username });

  if (existedVoter2) {
    throw new ApiError(409, "User with email already exists");
  }

  // create user object - create entry in db
  const voter1 = await Voter1.create({
    name,
    hashed_password,
    email,
  });

  const voter2 = await Voter2.create({
    username,
    hashed_password,
  });

  getPublicHash(voter2._id);

  // remove password and refresh token field from response
  const createdVoter1 = await Voter1.findById(voter1._id).select(
    "-hashed_password -refreshToken1"
  );

  const createdVoter2 = await Voter2.findById(voter2._id).select(
    "-hashed_password -refreshToken2 -publicHash"
  );

  // check for user creation
  if (!createdVoter1) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  if (!createdVoter2) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const voter = {
    voter1: createdVoter1,
    voter2: createdVoter2,
  };

  const subject = "Voter's Public Hash";

  const voterPH = await Voter2.findById(voter2._id).select("publicHash");

  const message = `Dear ${createdVoter1.name},\n  Thankyou for registering as a voter. Your public hash is ${voterPH.publicHash}`;

  sendEmail({ email: createdVoter1.email, subject, message });

  // return res
  return res
    .status(200)
    .json(new ApiResponse(200, voter, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
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

  // find the user
  const voter1 = await Voter1.findOne({ email });

  if (!voter1) {
    throw new ApiError(404, "User does not exist");
  }

  // password check

  const isPasswordValid1 = await voter1.isPasswordCorrect(hashed_password);

  if (!isPasswordValid1) {
    throw new ApiError(401, "Password is incorrect");
  }

  const voter2 = await Voter2.findOne({ username });

  if (!voter2) {
    throw new ApiError(404, "User does not exist");
  }

  // password check

  const isPasswordValid2 = await voter2.isPasswordCorrect(hashed_password);

  if (!isPasswordValid2) {
    throw new ApiError(401, "Password is incorrect");
  }

  // access and refresh token generate
  const { accessToken1, refreshToken1 } = await generateAccessAndRefreshTokens1(
    voter1._id
  );

  const { accessToken2, refreshToken2 } = await generateAccessAndRefreshTokens2(
    voter2._id
  );

  // send cookies
  const loggedInVoter1 = await Voter1.findById(voter1._id).select(
    "-password -refreshToken1"
  );

  const loggedInVoter2 = await Voter2.findById(voter2._id).select(
    "-password -refreshToken2 -publicHash"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const voter = {
    voter1: loggedInVoter1,
    voter2: loggedInVoter2,
  };

  return res
    .status(200)
    .cookie("accessToken1", accessToken1, options)
    .cookie("refreshToken1", refreshToken1, options)
    .cookie("accessToken2", accessToken2, options)
    .cookie("refreshToken2", refreshToken2, options)
    .json(
      new ApiResponse(
        200,
        {
          user: voter,
          accessToken1,
          refreshToken1,
          accessToken2,
          refreshToken2,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await Voter1.findByIdAndUpdate(
    req.voter1._id,
    {
      $unset: {
        refreshToken1: 1,
      },
    },
    {
      new: true,
    }
  );

  await Voter2.findByIdAndUpdate(
    req.voter1._id,
    {
      $unset: {
        refreshToken2: 1,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken1")
    .clearCookie("refreshToken1")
    .clearCookie("accessToken2")
    .clearCookie("refreshToken2")
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken1 =
    req.cookies.refreshToken1 || req.body.refreshToken1;

  if (!incomingRefreshToken1) {
    throw new ApiError(401, "unauthorized request");
  }

  const incomingRefreshToken2 =
    req.cookies.refreshToken2 || req.body.refreshToken2;

  if (!incomingRefreshToken2) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken1 = jwt.verify(
      incomingRefreshToken1,
      process.env.REFRESH_TOKEN_SECRET
    );

    const voter1 = await Voter1.findById(decodedToken1?._id);

    if (!voter1) {
      throw new ApiError(401, "invalid refresh token");
    }

    const decodedToken2 = jwt.verify(
      incomingRefreshToken2,
      process.env.REFRESH_TOKEN_SECRET
    );

    const voter2 = await Voter2.findById(decodedToken2?._id);

    if (!voter2) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (
      incomingRefreshToken1 !== voter1?.refreshToken1 ||
      incomingRefreshToken2 !== voter2?.refreshToken2
    ) {
      next();
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken1, refreshToken1 } =
      await generateAccessAndRefreshTokens1(voter1._id);

    const { accessToken2, refreshToken2 } =
      await generateAccessAndRefreshTokens2(voter2._id);

    return res
      .status(200)
      .cookie("accessToken1", accessToken1, options)
      .cookie("refreshToken1", refreshToken1, options)
      .cookie("accessToken2", accessToken2, options)
      .cookie("refreshToken2", refreshToken2, options)
      .json(
        new ApiResponse(
          200,
          { accessToken1, refreshToken1, accessToken2, refreshToken2 },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const voter1 = await Voter1.findById(req.voter1?._id);

  const isPasswordCorrect1 = await voter1.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect1) {
    throw new ApiError(404, "incorrect old password");
  }

  const voter2 = await Voter2.findById(req.voter2?._id);

  const isPasswordCorrect2 = await voter2.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect2) {
    throw new ApiError(404, "incorrect old password");
  }

  voter1.hashed_password = newPassword;
  voter2.hashed_password = newPassword;
  voter1.save({ validateBeforeSave: false });
  voter2.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const voter = {
    voter1: req.voter1,
    voter2: req.voter2,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, voter, "current user fetched successfully"));
});

const getUser = asyncHandler(async (req, res) => {
  const { voterId } = req.body;

  if (!voterId) {
    return res.status(400).json({
      message: "Candidate ID is required.",
    });
  }

  try {
    const voter = await Voter2.findById(voterId);

    if (!voter) {
      return res.status(404).json({
        message: "Candidate not found.",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, voter, "Voter fetched successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Server error. Could not fetch Voter."));
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "All fields are required");
  }

  const voter1 = await Voter1.findByIdAndUpdate(
    req.voter1?._id,
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
      new ApiResponse(200, voter1, "Account details is updated successfully")
    );
});

const deleteUser = asyncHandler(async (req, res) => {
  const voter1Id = req.voter1?._id;
  const voter2Id = req.voter2?._id;

  if (!voter1Id || !voter2Id) {
    throw new ApiError(400, "User not found");
  }

  const voter1 = await Voter1.findById(voter1Id);

  if (!voter1) {
    throw new ApiError(404, "User not found");
  }

  const voter2 = await Voter2.findById(voter2Id);

  if (!voter2) {
    throw new ApiError(404, "User not found");
  }

  const deletedVoter1 = await Voter1.findByIdAndDelete(voter1Id);

  if (!deletedVoter1) {
    throw new ApiError(404, "User not found");
  }

  const deletedVoter2 = await Voter2.findByIdAndDelete(voter2Id);

  if (!deletedVoter2) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getUser,
  updateAccountDetails,
  deleteUser,
};
