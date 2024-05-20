const express = require("express");
const routes = express.Router();

const {
  createCohort,
  getAllCohorts,
  updateCohort,
  deleteCohort,
} = require("../controllers/cohortController");
const authenticate = require("../middlewares/authenticate");

routes.post("/create", createCohort);
routes.get("/all", getAllCohorts);
routes.patch("/edit/:id", updateCohort);
routes.delete("/delete/:id", deleteCohort);

module.exports = routes;
