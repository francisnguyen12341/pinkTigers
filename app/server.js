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

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});