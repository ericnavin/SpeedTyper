//main
"use strict";
const express = require("express");
const app = express();
const path = require("path");
let portNumber = process.argv[2];
const bodyParser = require("body-parser");
require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

//pages home
app.get("/", (request, response) => {
    response.render("home");
});

//test
app.get("/challenge", (request, response) => {
    response.render("typerTest");
});

//score
app.get("/getScores", (request, response) => {
    response.render("scores");
});

//score
app.post("/getScores", (request, response) => {
    var leaderboard = "<add score from mongoDB>";
    var variables = {leaderboard: leaderboard};
   response.render("leaderboard", variables);
});