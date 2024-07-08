
const bcrypt = require("bcrypt");
const userDB = require("../models/userDB.js");


const logFunc = async function(req,res){
    if(!req || !req.body || !req.body.username || !req.body.password){
        return res.status(400).json({"Error":"Lacking parameters"});
    }

    try{
        var uname = req.body.username;
        var pword = req.body.password;

        var foundUser = await userDB.findOne({username:uname}).exec();

        if(!foundUser){
            return res.status(401).json({"message":"User not found"});//401 - Unauthorized
        }

        var comparedPassword = await bcrypt.compare(pword,foundUser.password);

        if(comparedPassword){
            res.status(200).json({"imageSrc":foundUser.imageSrc,"success":true});//200 - OK(successful)
        }
        else{
            return res.status(401).json({"message":"Incorrect Password"});//401 - Unauthorized
        }

    }catch(err){
        res.status(500);//Internal server error
        return res.json({"message":err.message})
    }
}

module.exports = {logFunc};


