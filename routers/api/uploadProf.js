const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const uploadPicme = require("../../middlewares/uploadPic.js");

router.route("/").post(uploadPicme.uploadIndx.single("profilePic"),function(req,res){
    if(!req.file){
        return res.status(400).json({"message":"No file uploaded"}); //status 400 - Bad request(lacks parameters)
    }
    res.status(200).json({"message":"File uploaded Successfuly","src":uploadPicme.newFileMe()});
})

module.exports = router;