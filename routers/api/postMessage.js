const express = require("express")
const router = express.Router()
const postMessageController = require("../../controllers/postMessageController.js")


router.route("/").post(postMessageController.postfunction)
module.exports = router