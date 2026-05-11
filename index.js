"use strict";

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv").config({
   path: path.resolve(__dirname, "credentials/.env"),
   quiet: true,
});

const app = express();

process.stdin.setEncoding("utf8");
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:false}));

const args = process.argv;
const uri = process.env.MONGO_CONNECTION_STRING;
const portNumber = 5000;

// TODO: we'll use mongoose to connect to the DB (b/c connection string has db name), do our thing, and then disconnect
// use mongoose.model to access collection

if (args.length != 2) {
    process.exit(1);
} else {
    app.listen(portNumber, err => {
        if (!err) {
            console.log(`Web server started and running at http://localhost:${portNumber}`);

            // Handle user command-line inputs
            const prompt = "Stop to shutdown the server: ";
            process.stdout.write(prompt);
            process.stdin.on("readable", function () {
                const input = process.stdin.read();
                const command = input !== null ? input.trim() : null;
                if (command !== null) {
                    if (command === "stop") {
                        process.stdout.write("Shutting down the server");
                        process.exit(0);
                    } else {
                        process.stdout.write(`Invalid command: ${command}\n`);
                    }
                }

                process.stdout.write(prompt);
                process.stdin.resume();
            });
        } else {
            console.log("Starting server failed.");
        }
    });

    // Homepage
    app.get("/", (request, response) => {
        response.render("home");
    });

    // Type Challenge Page
    app.get("/type", (request, response) => {
        response.render("type");
    });

    // Leaderboard
    app.get("/leaderboard", (request, response) => {
        response.render("leaderboard");
    });

    

    // //test
    // app.get("/challenge", (request, response) => {
    //     response.render("typerTest");
    // });

    // //score
    // app.get("/getScores", (request, response) => {
    //     response.render("scores");
    // });

    // //score
    // app.post("/getScores", (request, response) => {
    //     var leaderboard = "<add score from mongoDB>";
    //     var variables = {leaderboard: leaderboard};
    //     response.render("leaderboard", variables);
    // });
}