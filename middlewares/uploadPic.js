const multer = require("multer");

// Setting up multer as a middleware to grab photo uploads
const upload = multer({ storage: multer.memoryStorage() });

//multer allows you to easily manage files that is passed from front end to backend

/*var newfile;*/
/*this storage will determine how uploaded files are stored in the server's disk 
such as where it will be placed and what filename will it have*/
/*const storage = multer.diskStorage({
    destination:function(req,file,cb){
        //cb(callback)-this will be called once you have determined your destination or filaname etc.
        cb(null,"./serverImages");
    },
    filename:function(req,file,cb){
        newfile = Date.now() + path.extname(file.originalname)
        cb(null,newfile);
    }
}) */

/*const upload = multer({storage:storage});*/


module.exports = {uploadIndx: upload};
