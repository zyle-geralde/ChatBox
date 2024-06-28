const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    imageSrc:{
        type:String
    }
})

module.exports = mongoose.model("user",UserSchema);