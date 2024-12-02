/**
 * main Javascript file for the application
 *  this file is executed by the Node server
 */

// Import the http module, which provides an HTTP server
const http = require("http");

// Import the express module, which provides the express function
const express = require("express");

// Create an Express application with an HTTP server
const app = express();
const server = http.createServer(app);

// Create a new WebSocket server object using our created function
const {createSocketServer} = require("./server/socket/socket");
createSocketServer(server);

// Load environment variables from the .env file
const dotenv = require("dotenv");
dotenv.config({path: ".env"});

// Connect to the database
const connectDB = require("./server/database/connection");
connectDB();

const bodyParser = require('body-parser');

// Body Parser
app.use(bodyParser.json());

// Import the express-session module, which can manage sessions
const session = require('express-session');
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Add middleware to handle JSON in HTTP request bodies
app.use(express.json());

// Set the template engine to EJS
app.set("view engine", "ejs");

// Load assets
app.use("/css", express.static("assets/css"));
app.use("/img", express.static("assets/img"));
app.use("/js", express.static("assets/js"));

// app.use takes a function (next) that is added to the request chain
// When we call next(), it goes to the next function in the chain
// app.use(async (req, res, next) => {
//     // If the student is logged in, fetch the student object from the database
//     if (req.session.email === undefined && !req.path.startsWith("/auth")) {
//         res.redirect("/auth");
//         return;
//     }

//     next();
        
// });

// To keep the server file manageable, we will move routes to a separate file
// The router object is middleware
app.use("/", require("./server/routes/router"))

// Start the server on port 8080
server.listen(8080, () => {
    console.log("The server is listening on localhost:8080");
});