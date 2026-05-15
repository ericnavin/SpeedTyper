const express = require('express');
const router = express.Router();
//get to search up form
router.get("/scoreSearch", async (request, response) => {
    response.render("findScore");
});

router.post("/scoreSearchResults", async (request, response) => {
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

        response.render("showSCore", variables);
    } catch (error) {
        console.error("Error loading leaderboard:", error);
        response.status(500).send("There was a problem loading the leaderboard.");
    }
});

module.exports = router;