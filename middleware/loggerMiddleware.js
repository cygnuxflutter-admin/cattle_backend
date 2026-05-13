const fs = require('fs');
const path = require('path');
const Api_logs = require('../model/api_logs');
const dbService = require('../utils/dbService');
const logFilePath = path.join(__dirname, 'api.log');


const MAX_LOG_ENTRIES = 11000;

async function loggerMiddleware(req, res, next) {
    try {
        const { method, url, body } = req;

        const startTime = new Date();

        const originalJson = res.json;
        const originalSend = res.send;

        let responseBody;

        res.json = function (data) {
            responseBody = data;
            originalJson.call(this, data);
        };

        res.send = function (data) {
            responseBody = data;
            originalSend.call(this, data);
        };

        await next();

        const duration = new Date() - startTime;

        const { statusCode } = res;

        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toISOString().split('T')[1].split('.')[0];

        const logEntry = {
            date: date,
            time: time,
            api_name: method,
            api_url: url,
            json_request: JSON.stringify(body),
            status_code: statusCode,
            json_response: JSON.stringify(responseBody),
            duration: duration
        };

        await dbService.create(Api_logs, logEntry);

        const totalRecords = await Api_logs.countDocuments();

        if (totalRecords > MAX_LOG_ENTRIES) {
            const recordsToDelete = 5000;
            const oldestRecords = await Api_logs.find().sort({ DateTime: 1 }).limit(recordsToDelete);

            const recordIdsToDelete = oldestRecords.map(record => record._id);

            await Api_logs.deleteMany({ _id: { $in: recordIdsToDelete } });

            console.log(`Deleted ${recordsToDelete} older log entries`);
        }

    } catch (error) {
        console.error('Error in loggerMiddleware:', error);
        next(error);
    }
}


module.exports = loggerMiddleware;