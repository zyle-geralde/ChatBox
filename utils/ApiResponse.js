class ApiResponse {
    constructor(res) {
        this.res = res;
    }

    success(data = {}, status = 200) {
        return this.res.status(status).json({ success: true, data });
    }

    fail(message, status = 400) {
        return this.res.status(status).json({ success: false, error: message });
    }
}

module.exports = ApiResponse;
