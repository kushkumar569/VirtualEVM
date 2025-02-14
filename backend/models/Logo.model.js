import { Schema , model } from "mongoose";

const logoSchema = new Schema(
    {
        image: {
            type: String,
            req: "Image is required"
        },
        name: {
            type: String,
            req: "Name is required"
        },
        isUsed: {
            type: Boolean,
            default: false
        }
    }
)

export const Logo = model("Logo", logoSchema);