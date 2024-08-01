const postDb = require("../models/postDb.js")

var postfunction = async function(req,res){
    if(!req || !req.body || !req.body.post || !req.body.postDate || !req.body.sender || !req.body.receiver){
        return res.status(400).json({"Error":"Lacking parameters"});
    }

    try{
        var postCont = postDb.create({
            post:req.body.post,
            postDate:req.body.postDate,
            sender:req.body.sender,
            receiver:req.body.receiver
        })

        res.status(201).json({"success":true})//resource created successfully
    }catch(err){
        res.status(500);//Internal server error
        return res.json({"message":err.message})
    }
}

module.exports = {postfunction}