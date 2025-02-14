import { ApiResponse } from "../helpers/ApiResponse.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { Timelines } from "../models/Timelines.model.js";

const saveTimeline = asyncHandler(async (req, res) => {

    // get Candidate details from frontend
    const { from, to } = req.body;

    // validation - not empty
    if (
        [ from, to, next ].some(
            (fields) => fields?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    const previousTimeline = await Timelines.findOne().sort({ createdAt: -1 });

    if(previousTimeline.to !== from) {
        throw new ApiError(
            401,
            "Wrong timeline uploading"
        );
    }

    const timeline = await Timelines.create({
        from,
        to,
        next: next || null
    })

    const createdTimeline = await Timelines.findById(timeline._id);

    if(!createdTimeline) {
        throw new ApiError(
            500,
            "Something went wrong while uploading the timeline"
        );
    }

    // return res
    return res
        .status(200)
        .json(new ApiResponse(200, createdTimeline, "Timeline is uploaded successfully"));
});

const getAllTimelines = asyncHandler(async (req, res) => {
    // Fetch all timelines sorted by the "to" field in descending order
    const sortedTimelines = await Timelines.find().sort({ to: -1 });

    if (!sortedTimelines || sortedTimelines.length === 0) {
        throw new ApiError(
            500,
            "No timelines in the database"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, sortedTimelines, "Timelines sorted successfully"));
});

export { saveTimeline, getAllTimelines };