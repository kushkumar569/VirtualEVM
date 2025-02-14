import { Schema , model, mongoose } from "mongoose";

const voteSchema = new Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            req: "Candidate hash is required"
        },
        voterId: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Voter2",
            req: "Voter hash is required"
        }
    }, { timestamps: true }
);

export const Vote = model("Vote", voteSchema);