//<----------------------- Database connect ---------------------->
require("./src/database/init");

const app = require('./app');
const cluster = require('cluster');
const setupSocketIO = require("./socket");

//<-------------------- Express App setup ----------------------->
const PORT = process.env.PORT || 5500;

// Check if running in a clustered environment
const effectivePort = cluster.worker ? PORT + cluster.worker.id : PORT;

const server = app.listen(effectivePort, async () => {
    console.log(`Server is running on Port: ${effectivePort}`);
});


setupSocketIO(server);
//<-------------- Handle unhandled promise rejections ------------->

process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection at: ${promise} - reason: ${err.message}`);
    // Close server & exit process
    server.close(() => {
        console.log("Server closed due to unhandled promise rejection");
        process.exit(1);
    });
});

module.exports = server;
