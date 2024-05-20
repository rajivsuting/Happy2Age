const AdminSchema = require("../models/Admin");
const { generate: uniqueId } = require("shortid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const shortid = require("shortid");
const logger = require("../log/logger");

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingAdmin = await AdminSchema.find({
      email: email,
      removed: false,
    });

    if (existingAdmin.length > 0) {
      return res
        .status(400)
        .json({ error: "An account already exists with the email" });
    }

    const salt = uniqueId();
    const hashPassword = bcrypt.hashSync(salt + password);
    const emailToken = uniqueId();

    const admin = await AdminSchema.create({
      email,
      firstName,
      lastName,
      password: hashPassword,
      salt,
      emailToken,
    });

    if (!admin) {
      res.status(400).json({ error: "An error occured" });
    }

    res.status(200).json({ admin });
  } catch (err) {
    logger.error("Error creating admin", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await AdminSchema.findOne({
      email,
      removed: false,
      enabled: true,
    });

    const isMatch = await bcrypt.compare(admin.salt + password, admin.password);

    if (!isMatch) {
      res.status(403).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id }, "happyToageSecretKeyRajivAndHilton", {
      expiresIn: req.body.remember ? 365 * 24 + "h" : "24h",
    });

    await AdminSchema.findByIdAndUpdate(
      { _id: admin._id },
      { $push: { loggedSessions: token } },
      { new: true }
    ).exec();

    res
      .status(200)
      .cookie("token", token, {
        maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 100 : null,
        sameSite: "Lax",
        httpOnly: true,
        secure: false,
        path: "/",
        domain: req.hostname,
        Partitioned: true,
      })
      .json(admin);
  } catch (error) {
    logger.error("Error logging in admin", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { register, login };
