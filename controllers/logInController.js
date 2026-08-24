
const bcrypt = require("bcrypt");
const userDB = require("../models/userDB.js");


const logFunc = async function(req,res){
    const missing = req.api.missingFields(["username","password"]);
    if(missing.length){
        return res.api.fail(`Missing required fields: ${missing.join(", ")}`, 400);
    }

    try{
        var uname = req.api.body.username;
        var pword = req.api.body.password;

        var foundUser = await userDB.findOne({username:uname}).exec();

        if(!foundUser){
            return res.api.fail("User not found", 401);//401 - Unauthorized
        }

        var comparedPassword = await bcrypt.compare(pword,foundUser.password);

        if(comparedPassword){
            return res.api.success({imageSrc:foundUser.imageSrc});//200 - OK(successful)
        }
        else{
            return res.api.fail("Incorrect Password", 401);//401 - Unauthorized
        }

    }catch(err){
        return res.api.fail(err.message, 500);//Internal server error
    }
}

module.exports = {logFunc};


