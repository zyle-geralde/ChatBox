require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const exp = require('constants');
const mongoose = require("mongoose");
const connectDB = require("./controllers/connection.js")
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3500;

// Create an HTTP server and attach it to the Express app
const server = http.createServer(app);

// Create a Socket.IO server and attach it to the HTTP server
const io = socketIo(server);

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

const users = {}
// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log("New Socket ID: ",socket.id);
    //This is just practice
    /*socket.on("message",(post,num)=>{
        console.log(`Received: ${post}:${num}`)

        //send message back to all client including the sender
        //socket.broadcast.emit("receivemess",post);

        //send message back to all the client not including the sender
        io.emit("receivemess",post);
    })*/

    //Triggers When user joins
    socket.on("join",function(username){
        users[username] = socket.id
        socket.username = username
        console.log(`${username} joined`)
    })


    socket.on('private_message', (data) => {
        const { to, message } = data;
        const recipientSocketId = users[to];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('private_message', {
                from: socket.username,
                message
            });
        }

        socket.emit('private_message', {
            from: socket.username,
            message
        });
    });
});


app.use(function(err,req,res,next){
    console.log(`Error: ${err.message}`);
    res.status(500).send(err.message)
})

mongoose.connection.once("open",function(){
    console.log("Connected to Database")
    server.listen(PORT,function(){
        console.log(`Server is listening on http://localhost:${PORT}`);
    })
})


