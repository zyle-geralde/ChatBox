const express = require("express")
const router = express.Router()
const getUserFunction = require("../../controllers/getUserController.js")

router.route("/").get(getUserFunction.getUserController)

module.exports = router