const express = require("express");
const router = express.Router();
const path = require("path");
const forntEndCont = require("../controllers/frontendController.js");


router.get("^/$|/LogInSignUp(.html)?",forntEndCont.logsign);

router.get("^/$|/mainPage(.html)?",forntEndCont.mainpage);

router.all("*",forntEndCont.errorhtml);

module.exports = router;

