import { ApiResponse } from "../helpers/ApiResponse.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { Voting } from "../models/Voting.model.js";

const saveVotingTimeline = asyncHandler(async (req, res) => {

    // get Candidate details from frontend
    const { candidateRegistrationStart, voterRegistrationStart, votingStart, votingEnd } = req.body;

    // validation - not empty
    if (
        [ candidateRegistrationStart, voterRegistrationStart, votingStart, votingEnd ].some(
            (fields) => fields?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required.");
    }

    

    const voting = await Voting.create({
        candidateRegistrationStart,
        voterRegistrationStart, 
        votingStart, 
        votingEnd
    })

    const createdVoting = await Voting.findById(voting._id);

    if(!createdVoting) {
        throw new ApiError(
            500,
            "Something went wrong while uploading the voting timeline"
        );
    }

    // return res
    return res
        .status(200)
        .json(new ApiResponse(200, createdVoting, "Timeline is uploaded successfully"));
});

const getVotingTimeline = asyncHandler(async (req, res) => {
    // Fetch all timelines sorted by the "to" field in descending order
    const sortedVotingTimelines = await Voting.findOne().sort({ candidateRegistrationStart: 1 });

    if (!sortedVotingTimelines) {
        throw new ApiError(
            500,
            "No timelines in the database"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, sortedVotingTimelines, "Timelines sorted successfully"));
});

export { saveVotingTimeline, getVotingTimeline };