
const express = require("express");
const router = express.Router();
const signUpcontroller = require("../../controllers/signUpController.js");

router.route("/").post(signUpcontroller.signFunct);

module.exports = router;