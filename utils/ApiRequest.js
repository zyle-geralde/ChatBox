class ApiRequest {
    constructor(req) {
        this.body = req.body || {};
        this.file = req.file;
    }

    missingFields(fields) {
        return fields.filter(f => !this.body[f]);
    }
}

module.exports = ApiRequest;
