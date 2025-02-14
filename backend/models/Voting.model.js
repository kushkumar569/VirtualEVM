import { Schema, model } from "mongoose";

const votingSchema = new Schema(
  {
    candidateRegistrationStart: {
      type: String,
      req: "Candidate registration starting time is required",
    },
    voterRegistrationStart: {
      type: String,
      req: "Voter registration starting is required",
    },
    votingStart: {
      type: String,
      req: "Voting start is required",
    },
    votingEnd: {
      type: String,
      req: "Voting end is required",
    },
  },
  { timestamps: true }
);

export const Voting = model("Voting", votingSchema);
