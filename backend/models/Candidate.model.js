import { Schema , model, mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const candidateSchema = new Schema(
    {
        username: {
            type: String,
            trim: true,
            required: "Username is required",
            unique: "Username should be unique"
        },

        name: {
            type: String,
            trim: true,
            required: "Name is required"
        },

        email: {
            type: String,
            trim: true,
            unique: true,
            match:  [/.+\@.+\..+/, 'Please fill a valid email address'],
            required: "Email is required",
        },

        hashed_password: {
            type: String,
            required: "Password is required"
        },

        logo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Logo",
            required: "Voting logo is required"
        },

        refreshToken: String,

        publicHash: String

    }, { timestamps: true }
);

candidateSchema.pre("save", async function (next) {
    if (this.isModified("hashed_password"))
        this.hashed_password = await bcrypt.hash(this.hashed_password, 10);
    next();
});

candidateSchema.methods.isPasswordCorrect = async function (hashed_password) {
    return await bcrypt.compare(hashed_password, this.hashed_password);
};

candidateSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

candidateSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

candidateSchema.methods.generatePublicHash = async function() {
    const max = Number.MAX_SAFE_INTEGER
    const min = Number.MIN_SAFE_INTEGER
    const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;

    const input = `${this.username} ${this.createdAt} ${randomInt}`;
    return crypto.createHash('sha256').update(input).digest('hex');
};

export const Candidate = model("Candidate", candidateSchema);
