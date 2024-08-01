require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const exp = require('constants');
const mongoose = require("mongoose");
const connectDB = require("./controllers/connection.js")

const PORT = process.env.PORT || 3500;

connectDB.connectFunc();

originList = ["http://localhost:3500",'http://127.0.0.1:5500','http://localhost:3000','http://localhost:5000'];
corseOption = {
    origin:function(origin,callback){
        if(originList.includes(origin) || !origin){
            callback(null,true);
        }
        else{
            callback(new Error("Origin not allowed"))
        }
    },
    optionSuccessStatus:200,
}

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (originList.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

app.use(credentials);
app.use(cors(corseOption));

app.use(express.urlencoded({extended:false}))

app.use(express.json());

app.use(express.static(path.join(__dirname,"frontEndFiles")));
app.use('/serverImages', express.static('serverImages'));

app.use("/signup",require("./routers/api/signUpRoute.js"));
app.use("/login",require("./routers/api/logInRoute.js"));
app.use("/uploadProfPic",require("./routers/api/uploadProf.js"));
app.use("/getUsers",require("./routers/api/getUsers.js"));
app.use("/postMessage",require("./routers/api/postMessage.js"))

app.use("/",require("./routers/LogInSign.js"));


app.use(function(err,req,res,next){
    console.log(`Error: ${err.message}`);
    res.status(500).send(err.message)
})

mongoose.connection.once("open",function(){
    console.log("Connected to Database")
    app.listen(PORT,function(){
        console.log("..Listening")
    })
})

