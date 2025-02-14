import { Schema , model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const voterSchema1 = new Schema(
    {
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

        refreshToken1: String,

    }, { timestamps: true }
);


const voterSchema2 = new Schema(
    {
        username: {
            type: String,
            trim: true,
            required: "Username is required",
            unique: "Username should be unique"
        },

        hashed_password: {
            type: String,
            required: "Password is required"
        },

        refreshToken2: String,

        hasVoted: {
            type: Boolean,
            default: false
        },

        publicHash: String

    }, { timestamps: true }
);

voterSchema1.pre("save", async function (next) {
    if (this.isModified("hashed_password"))
        this.hashed_password = await bcrypt.hash(this.hashed_password, 10);
    next();
});

voterSchema1.methods.isPasswordCorrect = async function (hashed_password) {
    return await bcrypt.compare(hashed_password, this.hashed_password);
};

voterSchema1.methods.generateAccessToken = async function () {
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

voterSchema1.methods.generateRefreshToken = async function () {
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

voterSchema2.pre("save", async function (next) {
    if (this.isModified("hashed_password"))
        this.hashed_password = await bcrypt.hash(this.hashed_password, 10);
    next();
});

voterSchema2.methods.isPasswordCorrect = async function (hashed_password) {
    return await bcrypt.compare(hashed_password, this.hashed_password);
};

voterSchema2.methods.generateAccessToken = async function () {
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

voterSchema2.methods.generateRefreshToken = async function () {
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

voterSchema2.methods.generatePublicHash = async function() {
    const max = Number.MAX_SAFE_INTEGER
    const min = Number.MIN_SAFE_INTEGER
    const randomInt = Math.floor(Math.random() * (max - min + 1)) + min;

    const input = `${this.username} ${this.createdAt} ${randomInt}`;
    return crypto.createHash('sha256').update(input).digest('hex');
};

const Voter1 = model("Voter1", voterSchema1);
const Voter2 = model("Voter2", voterSchema2);

export { Voter1, Voter2 };