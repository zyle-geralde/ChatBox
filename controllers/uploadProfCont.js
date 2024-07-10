const uploadPicme = require("../middlewares/uploadPic.js");
const uploadCont = function(req,res){
    if(!req.file){
        return res.status(400).json({"message":"No file uploaded"}); //status 400 - Bad request(lacks parameters)
    }
    res.status(200).json({"message":"File uploaded Successfuly","src":uploadPicme.newFileMe()});
}

module.exports = {uploadCont};