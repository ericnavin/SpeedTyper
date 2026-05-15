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
app.use(bodyParser.urlencoded({ extended: false }));

const args = process.argv;
const uri = process.env.MONGO_CONNECTION_STRING;
const portNumber = 5000;

/*
    Mongoose Schema and Model

    This represents one saved typing score in MongoDB.
    Each score will have:
    - username
    - speed
    - mistakes
    - dateCreated
*/

const scoreSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    speed: {
        type: Number,
        required: true
    },

    mistakes: {
        type: Number,
        required: true
    },

    dateCreated: {
        type: Date,
        default: Date.now
    }
});

const Score = mongoose.model("Score", scoreSchema);

/*
    Connect to MongoDB using Mongoose.

    The connection string should be inside credentials/.env like this:

    MONGO_CONNECTION_STRING=mongodb+srv://username:password@clustername.mongodb.net/speedtyper?retryWrites=true&w=majority
*/

async function connectToMongoDB() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

/*
    Homepage
*/

app.get("/", (request, response) => {
    response.render("home");
});

/*
    Type Challenge

    For now, this renders your typing page.
    Later, you can pass generated Bacon Ipsum text here.
*/

app.get("/type", async (request, response) => {
    let paragraph = "Bacon ipsum dolor amet brisket ribeye ham hock sausage. Pork belly bacon meatball tenderloin short ribs.";

    try {
        const apiResponse = await fetch("https://baconipsum.com/api/?type=meat-and-filler&paras=1&format=json");
        const data = await apiResponse.json();

        paragraph = data[0];
    } catch (error) {
        console.error("Bacon API failed:", error);
    }

    response.render("type", {
        paragraph: paragraph
    });
});

/*
    Results Page

    Right now, this keeps your original behavior.
    It displays speed and mistakes as 0 until your typing page sends real values.
*/

app.post("/results", (request, response) => {
    let speed = Number(request.body.speed);
    let mistakes = Number(request.body.mistakes);

    const variables = {
        speed:  speed,
        mistakes: mistakes,
    };

    response.render("results", variables);
});

/*
    Save Score

    This route saves a score into MongoDB.

    IMPORTANT:
    Your results.ejs file needs a form that sends:
    - username
    - speed
    - mistakes

    using method="POST" and action="/save-score"
*/

app.get("/results", (request, response) => {
    const variables = {
        "mistakes": 0,
        "speed": 0,
    };

    response.render("results", variables);
});

app.post("/save-score", async (request, response) => {
    try {
        const username = request.body.username;
        const speed = Number(request.body.speed);
        const mistakes = Number(request.body.mistakes);

        if (!username) {
            return response.status(400).send("Username is required.");
        }

        if (Number.isNaN(speed) || Number.isNaN(mistakes)) {
            return response.status(400).send("Invalid speed or mistakes value.");
        }

        await Score.create({
            username: username,
            speed: speed,
            mistakes: mistakes,
            dateCreated : Date.now(),
        });

        response.redirect("/leaderboard");
    } catch (error) {
        console.error("Error saving score:", error);
        response.status(500).send("There was a problem saving your score.");
    }
});

/*
    Leaderboard

    This pulls scores from MongoDB instead of using fake hardcoded data.

    Sorting:
    1. Lowest mistakes first
    2. Highest speed second
    3. Oldest score first if there is a tie
*/

app.get("/leaderboard", async (request, response) => {
    try {
        const scores = await Score.find({})
            .sort({ mistakes: 1, speed: -1, dateCreated: 1 })
            .limit(10);

        let leaderboard = "";

        if (scores.length === 0) {
            leaderboard = `
                <tr>
                    <td colspan="4">No scores saved yet.</td>
                </tr>
            `;
        } else {
            scores.forEach((score, index) => {
                leaderboard += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${score.username}</td>
                        <td>${score.speed} WPM</td>
                        <td>${score.mistakes}</td>
                    </tr>
                `;
            });
        }

        const variables = {
            leaderboard: leaderboard,
        };

        response.render("leaderboard", variables);
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        response.status(500).send("There was a problem loading the leaderboard.");
    }
});

/*
    Start Server

    The server only starts after MongoDB connects successfully.
*/

if (args.length != 2) {
    process.exit(1);
} else {
    connectToMongoDB().then(() => {
        const server = app.listen(portNumber, err => {
            if (!err) {
                console.log(`Web server started and running at http://localhost:${portNumber}`);

                const prompt = "Stop to shutdown the server: ";
                process.stdout.write(prompt);

                process.stdin.on("readable", function () {
                    const input = process.stdin.read();
                    const command = input !== null ? input.trim() : null;

                    if (command !== null) {
                        if (command === "stop") {
                            process.stdout.write("Shutting down the server\n");

                            mongoose.disconnect();
                            process.exit(0);
                            // server.close(async () => {
                            //     await mongoose.connection.close();
                            //     process.exit(0);
                            // });
                        } else {
                            process.stdout.write(`Invalid command: ${command}\n`);
                            process.stdout.write(prompt);
                        }
                    }

                    process.stdin.resume();
                });
            } else {
                console.log("Starting server failed.");
            }
        });
    });
}

//get to search up form
app.get("/scoreSearch", async (request, response) => {
    response.render("findScore");
});

app.post("/scoreSearchResults", async (request, response) => {
    let user = request.body.username;
    try {
        const scores = await Score.find({username: user})
            .sort({ mistakes: 1, speed: -1, dateCreated: 1 })
            .limit(10);

        let leaderboard = "";

        if (scores.length === 0) {
            leaderboard = `
                <tr>
                    <td colspan="4">No scores saved yet by username: ${user}</td>
                </tr>
            `;
        } else {
            scores.forEach((score, index) => {
                leaderboard += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${score.username}</td>
                        <td>${score.speed} WPM</td>
                        <td>${score.mistakes}</td>
                    </tr>
                `;
            });
        }

        const variables = {
            leaderboard: leaderboard,
        };

        response.render("showScore", variables);
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        response.status(500).send("There was a problem loading the leaderboard.");
    }
});