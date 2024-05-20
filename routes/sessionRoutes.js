const express = require("express");
const routes = express.Router();

const {
  createSession,
  getAllSessions,
} = require("../controllers/sessionController");
const authenticate = require("../middlewares/authenticate");

routes.post("/create", createSession);
routes.get("/all", getAllSessions);

module.exports = routes;
