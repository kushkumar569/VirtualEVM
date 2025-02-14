import { Voter1, Voter2 } from "../models/Voter.model.js";
import { ApiError } from "../helpers/ApiError.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token1 =
            req.cookies?.accessToken1 ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token1) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        const decodedToken1 = jwt.verify(token1, process.env.ACCESS_TOKEN_SECRET);

        const voter1 = await Voter1.findById(decodedToken1?._id).select(
            "-password -refreshToken -publicHash"
        );

        if (!voter1) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.voter1 = voter1;

        const token2 =
            req.cookies?.accessToken2 ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token2) {
            throw new ApiError(401, "Unauthorized request");
        }
        
        const decodedToken2 = jwt.verify(token2, process.env.ACCESS_TOKEN_SECRET);

        const voter2 = await Voter2.findById(decodedToken2?._id).select(
            "-password -refreshToken -publicHash"
        );

        if (!voter2) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.voter2 = voter2;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});