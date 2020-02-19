var path = require('path');

module.exports.config = {
    port:  (process.env && process.env.PORT) ? process.env.PORT : "3000",
    ip:  (process.env && process.env.IP) ? process.env.IP : "0.0.0.0",
    collectionName: "dronelogs",
    dbName: "dronelogs",
    dbUri: "mongodb+srv://sunil123:sunil123@dronelogs-l5uti.mongodb.net/test?retryWrites=true",
    publicPath: path.join(__dirname, '../'),
};

