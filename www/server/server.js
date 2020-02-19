var express = require('express'),
    path = require('path'),
    http = require('http'),
    MongoClient = require('mongodb').MongoClient,
    bodyParser = require('body-parser'),
    fs = require('fs'),
    config  = require('./config').config;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(config.publicPath));

var dbObject = null,
    filePath = path.join(__dirname, '../logs/log.dat');
    collectionName = config.collectionName;

/*
    Create a http server
*/
function createServer() {
    var httpServer = http.createServer(app);
        
    httpServer.listen(config.port, config.ip, function(err) {
        if (err) {
            console.log(`Error occurred while creating a server => ${err} !!`);
            return process.exit(1);
        }
        return console.log(`Server running at http://${config.ip}:${config.port}`);
    });
}

/*
    Start the process
*/
function start() {
    MongoClient.connect(`${config.dbUri}/${config.dbName}`, function(err, db) {
        if (err) {
            console.log(`Unable to connect to ${databaseUri} => ${err} !!`);
            return process.exit(1);
        }
        
        try {
            dbObject = db.db(config.dbName);
            
            dbObject.createCollection(collectionName, function(e, res) {
                if (e) {
                    console.log(`Unable to create db collection => ${e} !!`);
                    return process.exit(1);
                }
                console.log(`Collection ${collectionName} has been created!`);
                return createServer();
            });
        } catch (e) {
            console.log(`Error while creating db collection => ${e} !!`);
            return process.exit(1);
        }
    });
}
start();

/*
    Return index page
*/
app.get('/', function(req, res) {
    res.sendFile(path.join(config.publicPath, 'index.html'));
});

/*
    Return the logs
*/
app.get('/search/:hotellogs', function (req, res) {
    if (!dbObject) {
        return res.status(500).end();
    }

    var hotel = (req.params && req.params.hotellogs) ? req.params.hotellogs : null;
    if (!hotel) {
        return res.status(400).end();
    }

    console.log(`Search logs :: ${hotel}`);
    dbObject.collection(collectionName)
        .find({ hotel })
        .toArray(function(err, data) {
            if (err) {
                console.log(`Error while finding logs => ${err} !!`);
                return res.status(500).end();
            }
            console.log(`Found logs :: ${JSON.stringify(data, null, 2)}`);
            return res.status(200).send({ data });
        });
});

/*
    Save the logs
*/
app.post('/hotelLogs/:hotellogs/hotellogs', function(req, res) {
    if (!dbObject) {
        return res.status(500).end();
    }
    
    var data = req.body && req.body.data ? req.body.data : null;
    if (data && data.length > 0) {
        console.log(`Req.body => ${JSON.stringify(data, null, 2)}`);
        dbObject.collection(collectionName)
            .insert(data, function(err, record) {
                if (err) {
                    console.log(`Error while inserting logs => ${err} !!`);
                    return res.status(500).end();
                }

                try {
                    var logStream = fs.createWriteStream(filePath, {'flags': 'a'});
                    
                    data.forEach(function(element) {
                        logStream.write(JSON.stringify(element));
                    });
                    logStream.end();
                    
                    console.log("Successfully wrote to log.dat file!!");
                    return res.status(200).send({ success: true });
                } catch(e) {
                    console.log(`Error while writing log to log.dat => ${e} !!`);
                    return res.status(500).end();
                }
            });
    } else {
        return res.status(400).end();
    }
});


