import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials
  })
);

// app.use(cors())

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes import
import voterRouter from "./routes/Voter.routes.js";
import candidateRouter from "./routes/Candidate.routes.js";
import voteRouter from "./routes/Vote.routes.js";
import logoRouter from "./routes/Logo.routes.js";
import timelinesRouter from "./routes/Timelines.routes.js";
import votingRouter from "./routes/Voting.routes.js";

// Routes declaration
app.use("/api/v1/users", voterRouter);
app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/logo", logoRouter);
app.use("/api/v1/timelines", timelinesRouter);
app.use("/api/v1/voting", votingRouter);

export { app };
