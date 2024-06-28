const path = require("path");

const logsign = function(req,res){
    res.sendFile(path.join(__dirname,"..","frontEndFiles","LogInSignUp.html"));
}

const errorhtml = function(req,res){
    res.status(404);//not found
    if(req.accepts("html")){
        res.sendFile(path.join(__dirname,"..","frontEndFiles","404.html"));
    }
    else if(req.accepts("json")){
        res.json({"Error":"404 File not Found"});
    }
    else{
        res.type("txt").send("Not Found");
    }
}

module.exports = {logsign,errorhtml};