import { ApiResponse } from "../helpers/ApiResponse.js";
import { asyncHandler } from "../helpers/asyncHandler.js";
import { ApiError } from "../helpers/ApiError.js";
import { Voter2 } from "../models/Voter.model.js";
import { Vote } from "../models/Vote.model.js";
import { Candidate } from "../models/Candidate.model.js";

const vote = asyncHandler(async (req, res) => {
  // get Candidate details from frontend
  const { candidateId, voterId } = req.body;

  // validation - not empty
  if ([candidateId, voterId].some((fields) => fields?.trim() === "")) {
    throw new ApiError(400, "All fields are required.");
  }

  // check if Candidate already exists: username, email
  const existedVoter = await Voter2.findById(voterId);

  if (!existedVoter) {
    throw new ApiError(409, "Voter not existed.");
  }

  const existedCandidate = await Candidate.findById(candidateId);

  if (!existedCandidate) {
    throw new ApiError(409, "Candidate not existed.");
  }

  if (existedVoter.hasVoted) {
    throw new ApiError(409, "You are already voted.");
  }

  const vote = await Vote.create({
    candidateId,
    voterId,
  });

  const createdVote = await Vote.findById(vote._id);

  if (!createdVote) {
    throw new ApiError(500, "Something went wrong while voting the Candidate");
  }

  await Voter2.findByIdAndUpdate(
    voterId,
    {
      $set: {
        hasVoted: true,
      },
    },
    { new: true }
  );

  // return res
  return res
    .status(200)
    .json(
      new ApiResponse(200, createdVote, "Candidate registered successfully")
    );
});

const getVotes = asyncHandler(async (req, res) => {
  const { from, to } = req.body;
  const votes = await Vote.find({
    createdAt: {
      $gte: new Date(from),
      $lt: new Date(to),
    },
  }).sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, votes, "Users found successfully"));
});

const countVotes = asyncHandler(async (req, res) => {
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json(new ApiResponse(400, null, "Candidate ID is required"));
  }

  const votesCount = await Vote.countDocuments({ candidateId });

  return res.status(200).json(new ApiResponse(200, votesCount, "Votes counted successfully"));
});


export { vote, getVotes, countVotes };
