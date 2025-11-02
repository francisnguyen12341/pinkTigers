const crypto = require('crypto');

const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());

// Add server endpoints here

// QUICK CURL TESTS
// create-account: curl -X POST http://localhost:3000/create-account --json '{"username":"vanessa","password":"rawr"}'
// delete-account: curl -X DELETE http://localhost:3000/delete-account -H "Content-Type: application/json" -d '{"username": "vanessa"}'

app.post("/create-account", (req, res) => {
    let reqBody = req.body;

    if ((reqBody.hasOwnProperty("username")) && (reqBody.hasOwnProperty("password"))) {
        let userName = reqBody.username;
        let passHash = crypto.createHash('sha256').update(reqBody.password).digest('hex');

        pool.query(`INSERT INTO users (username, password) VALUES ($1, $2);`, [ userName, passHash ]).then(() => {
            console.log(`Successfully added user: ${userName}`);
            res.status(200);
            res.send();
        }).catch(err => {
            console.log("Error inserting user:", err);
            res.status(500)
            res.send();
        });
    } else {
        console.log("Missing username or password");
        res.status(404);
        res.send();
    }
});

app.delete("/delete-account", (req, res) => {
    let reqBody = req.body;

    if (reqBody.hasOwnProperty("username")) {
        let userName = reqBody.username;

        pool.query('DELETE FROM users WHERE username = $1 RETURNING *;', [userName])
            .then(result => {
                if (result.rows.length > 0) {
                    console.log(`Deleted user: ${userName}`);
                    res.status(200)
                    res.json({ message: `Account for ${userName} has been deleted successfully.` });
                } else {
                    console.log(`User not found: ${userName}`);
                    res.status(404)
                    res.json({ error: "User not found." });
                }
            })
            .catch(err => {
                console.error("Error deleting user:", err);
                res.status(500)
                res.json({ error: "Server error" });
            });
    } else {
        console.log("Missing username");
        res.status(400).json({ error: "Missing username." });
    }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});