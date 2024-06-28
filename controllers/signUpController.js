
const userDB = require("../models/userDB.js");
const bcrypt = require("bcrypt");


const signFunct = async function(req,res){
    if(!req || ! req.body || !req.body.username || !req.body.password){
        return res.status(400).json({"400":"Lack Parameters"})//400-bad request
    }

    try{
        var uname = req.body.username
        var pword = req.body.password


        //finding duplicates
        var foundUser = await userDB.findOne({username:uname}).exec();

        if(foundUser){
            return res.status(409).json({"Status 409":"Username already exists"});//409 -> conflict
        }


        var hashpassword = await bcrypt.hash(pword,10);

        pword = hashpassword;

        var result = userDB.create({
            username:uname,
            password:pword,
            imageSrc:"none"
        })

        res.status(201).json({"success":true})//resource created successfully
    }catch(err){
        res.status(500);
        return res.json({"message":err.message})
    }
}

module.exports = {signFunct}