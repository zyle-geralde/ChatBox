const uploadPicme = require("../middlewares/uploadPic.js");
const UserDb = require("../models/userDB.js");
require("dotenv").config();

// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getStorage, ref, getDownloadURL, uploadBytesResumable } = require("firebase/storage");

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

// Initialize Firebase
initializeApp(firebaseConfig);

const storage = getStorage();

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date + ' ' + time;
};

const uploadFile = async (file) => {
    try {
        const dateTime = giveCurrentDateTime();
        const storageRef = ref(storage, `files/${file.originalname} ${dateTime}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);

        // Grab the public URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        throw new Error('Failed to upload file: ' + error.message);
    }
};

const uploadFileController = async (req, res) => {
    if(!req.file){
        return res.status(400).json({"message":"No file uploaded"}); //status 400 - Bad request(lacks parameters)
    }
    try {
        const downloadURL = await uploadFile(req.file);

        const foundUser = await UserDb.findOne({username:req.body.username}).exec();
        if(foundUser){
            foundUser.imageSrc = downloadURL;
            await foundUser.save();
            res.status(200).json({"message":"File uploaded Successfuly","src":downloadURL});
        }
        else{
            return res.status(404).json({"message":"User Not Found"});
        }
    } catch (error) {
        res.status(500);
        return res.json({"message":err.message})
    }
};

module.exports = {uploadFileController};
