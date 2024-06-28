const express = require("express");
const router = express.Router();
const logInController = require("../../controllers/logInController.js");


router.route("/").post(logInController.logFunc);

module.exports = router;

