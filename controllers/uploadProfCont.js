const uploadPicme = require("../middlewares/uploadPic.js");
const UserDb = require("../models/userDB.js");
const uploadCont = async function(req,res){
    if(!req.file){
        return res.status(400).json({"message":"No file uploaded"}); //status 400 - Bad request(lacks parameters)
    }

    if(!req || !req.body || !req.body.username){
        return res.status(400).json({"message":"No file uploaded"});
    }
    try{
        const foundUser = await UserDb.findOne({username:req.body.username}).exec();
        if(foundUser){
            foundUser.imageSrc = uploadPicme.newFileMe();
            await foundUser.save();
            res.status(200).json({"message":"File uploaded Successfuly"});
        }
        else{
            return res.status(404).json({"message":"User Not Found"});
        }
    }catch(err){
        res.status(500);
        return res.json({"message":err.message})
    }

}

module.exports = {uploadCont};