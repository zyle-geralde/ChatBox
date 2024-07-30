const userDB = require("../models/userDB.js")

const getUserController = async function(req,res){
    const allUsers = await userDB.find({}, 'username imageSrc -_id');//find everything but only take the username excluding the id becuase mongodb includes the id by default
    
    try{
        res.status(200).json({"usersList":allUsers})
    }catch(err){
        res.status(500);//Internal server error
        return res.json({"message":err.message})
    }
}

module.exports = {getUserController}