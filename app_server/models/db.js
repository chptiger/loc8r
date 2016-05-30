var mongoose = require( 'mongoose' );
var readLine = require ("readline");
var gracefulShutdown;
//Defined a database connection string
var dbURI = 'mongodb://localhost/Loc8r';

//Opened a Mongoose connection at application startup
mongoose.connect(dbURI);

//Monitored the Mongoose connection events
//console print connect infomation
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

//Monitored some Node process events so that we can close the Mongoose connection when the application ends
//listening for SIGINT for windows
if (process.platform === "win64"){
    var rl = readLine.createInterface ({
        input: process.stdin,
        output: process.stdout
    });
    rl.on ("SIGINT", function (){
        process.emit ("SIGINT");
    });
}

//CAPTURING THE PROCESS TERMINATION EVENTS
gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

//three event listeners and one function to close the database connection.
process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    });
});
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app shutdown', function () {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./locations');