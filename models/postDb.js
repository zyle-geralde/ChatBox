const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    post:{
        type:String,
        required:true
    },
    postDate:{
        type:String,
        required:true
    },
    sender:{
        type:String,
        required:true
    },
    receiver:{
        type:String,
        required:true
    },
})

module.exports = mongoose.model("post",PostSchema)