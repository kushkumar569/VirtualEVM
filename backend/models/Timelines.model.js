import { Schema, model, mongoose } from "mongoose";

const timelinesSchema = new Schema(
  {
    from: {
      type: String,
      req: "Staring time is required",
    },
    to: {
      type: String,
      req: "Ending time is required",
    },
    next: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timelines",
      default: null,
    },
  },
  { timestamps: true }
);

export const Timelines = model("Timelines", timelinesSchema);
