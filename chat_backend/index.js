// <---------------------- load env vars ----------------------------->
require("dotenv").config({ path: "src/config/env/config.env" });
const process = require('process');

const server = require("./server");

server.on("listening", () => {
    console.log(`Cluster ==========> Server ${process.pid} is running`);
});

