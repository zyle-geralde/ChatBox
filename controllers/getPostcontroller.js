
const postDb = require("../models/postDb.js")

var postfunc = async function(req,res){
    if(!req || !req.body || !req.body.sender || !req.body.receiver){
        return res.status(400).json({"Error":"Lacking parameters"});
    }
    try{
        //$or allows you to match the fetch querry with any of the elements available on the array
        var allPost = await postDb.find({
            $or: [
                { sender: req.body.sender, receiver: req.body.receiver},
                { sender: req.body.receiver, receiver: req.body.sender}
            ]
        }) 

        res.status(200).json({"allPost":allPost})
    }
    catch(err){
        res.status(500);//Internal server error
        return res.json({"message":err.message})
    }
}

module.exports = {postfunc}