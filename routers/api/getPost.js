const express = require("express")
const router = express.Router()
const getPostController = require("../../controllers/getPostcontroller.js")

router.route("/").post(getPostController.postfunc)

module.exports = router