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
app.use(bodyParser.urlencoded({extended:false}));

const args = process.argv;
const uri = process.env.MONGO_CONNECTION_STRING;

// TODO: we'll use mongoose to connect to the DB (b/c connection string has db name), do our thing, and then disconnect
// use mongoose.model to access collection

// Homepage
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