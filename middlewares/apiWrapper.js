const ApiRequest = require("../utils/ApiRequest.js");
const ApiResponse = require("../utils/ApiResponse.js");

module.exports = function apiWrapper(req, res, next) {
    req.api = new ApiRequest(req);
    res.api = new ApiResponse(res);
    next();
};
