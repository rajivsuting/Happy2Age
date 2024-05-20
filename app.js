const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv/config");
const cookieParser = require("cookie-parser");

const connectDB = require("./db/connectDb");
const participantRoutes = require("./routes/participantRoutes");
const cohortRoutes = require("./routes/cohortRoutes");
const activityRoutes = require("./routes/activityRoutes");
const domainRoutes = require("./routes/domainRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");

// auth
const authRoutes = require("./routes/authRoutes");

const port = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// auth
app.use("/auth", authRoutes);

app.use("/participant", participantRoutes);
app.use("/cohort", cohortRoutes);
app.use("/activity", activityRoutes);
app.use("/domain", domainRoutes);
app.use("/session", sessionRoutes);
app.use("/evaluation", evaluationRoutes);

connectDB();

app.listen(port, () => {
  console.log(`Connection is live at port no. ${port}`);
});
