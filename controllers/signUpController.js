
const userDB = require("../models/userDB.js");
const bcrypt = require("bcrypt");


const signFunct = async function(req,res){
    const missing = req.api.missingFields(["username","password"]);
    if(missing.length){
        return res.api.fail(`Missing required fields: ${missing.join(", ")}`, 400);//400-bad request
    }

    try{
        var uname = req.api.body.username
        var pword = req.api.body.password


        //finding duplicates
        var foundUser = await userDB.findOne({username:uname}).exec();

        if(foundUser){
            return res.api.fail("Username already exists", 409);//409 -> conflict
        }


        var hashpassword = await bcrypt.hash(pword,10);

        pword = hashpassword;

        var result = userDB.create({
            username:uname,
            password:pword,
            imageSrc:"none"
        })

        return res.api.success({}, 201);//resource created successfully
    }catch(err){
        return res.api.fail(err.message, 500);
    }
}

module.exports = {signFunct}