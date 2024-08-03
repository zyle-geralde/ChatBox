const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const uploadPicme = require("../../middlewares/uploadPic.js");
const uploadControl = require("../../controllers/uploadProfCont.js")

router.route("/").post(uploadPicme.uploadIndx.single("profilePic"),uploadControl.uploadFileController)

module.exports = router;