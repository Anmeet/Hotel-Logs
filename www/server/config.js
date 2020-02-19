var path = require('path');

module.exports.config = {
    port:  (process.env && process.env.PORT) ? process.env.PORT : "3000",
    ip:  (process.env && process.env.IP) ? process.env.IP : "0.0.0.0",
    collectionName: "room_logs",
    dbName: "room_logs",
    dbUri: "mongodb+srv://root:root@dronelogger-7uan0.mongodb.net/test?retryWrites=true",
    publicPath: path.join(__dirname, '../'),
};

