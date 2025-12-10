/*
    Date: 11/30/2025
    Comments from Francis for post Francis development and deployment of backend data base.
    Previously, we had pool (postgres database library variable) directed to ../utils/connection. 
    Looked like this: //const pool = require("../utils/connection");
    This is done presumably for local system testing since its connected  to local psql database on your local machine.
    With this change, my commit will most likely have commmented out ALL code inside of connection.js
    Note from Francis: I am changing the route text to be to localbranch address, may need to change it for production

*/

// QUICK CURL TESTS
// create-account: curl -X POST http://localhost:3000/create-account --json '{"username":"vanessa","password":"rawr"}'
// delete-account: curl -X DELETE http://localhost:3000/delete-account -H "Content-Type: application/json" -d '{"username": "vanessa"}'
// get-user-folders: curl "http://localhost:3000/get-user-folders?username=vanessa"
// logout: curl --cookie "token=thegeneratedtoken" -X DELETE http://localhost:3000/logout
// login: curl -X POST http://localhost:3000/login --json '{"username":"vanessa","password":"rawr"}'


// const { pool } = require("../utils/database")
const pool = require("../utils/connection")
const app = require("express").Router();
let argon2 = require("argon2");
const crypto = require('crypto');


function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}

let cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
};


app.post("/create-account", async (req, res) => {
    let reqBody = req.body;

    if ((reqBody.hasOwnProperty("username")) && (reqBody.hasOwnProperty("password"))) {
        let userName = reqBody.username;
        let password = reqBody.password;
        let passHash = await argon2.hash(password);
        let insertSuccess = false;

        await pool.query(`INSERT INTO users (username, password) VALUES ($1, $2);`, [userName, passHash]).then(() => {
            console.log(`Successfully added user: ${userName}`);
            insertSuccess = true;
        }).catch(err => {
            if (err.code === "23505") {
                // Username already exists

                res.status(400);
                res.json({
                    error: "Username already exists",
                });
            }

            console.log("Error inserting user:", err);
            res.status(500);
            res.send();
        });

        if (!insertSuccess) {
            return;
        }

        let rootFolderId;
        await pool.query(`INSERT INTO folders (name, parent_id) VALUES ($1, $2) RETURNING id;`, ["root", null]).then((result) => {
            rootFolderId = result.rows[0].id;
            console.log(`Successfully added root folder`);
        }).catch(err => {
            console.log("Error inserting root folder:", err);
            res.status(500);
            res.send();
        });

        if (rootFolderId) {
            await pool.query(`UPDATE users SET main_folder_id = $1 WHERE username = $2;`, [rootFolderId, userName])
                .then(() => {
                    console.log(`Successfully updated user ${userName} with main_folder_id ${rootFolderId}`);
                })
                .catch(err => {
                    console.log("Error updating user's main_folder_id:", err);
                    res.status(500);
                    res.send();
                });
        }

        let token = makeToken();

        await pool.query(`INSERT INTO tokens (token, username) VALUES ($1, $2);`, [token, userName]).then(() => {
            console.log(`Successfully added user ${userName} with token ${token}`);
        }).catch(err => {
            console.log("Error inserting user and token:", err);
            res.status(500);
            res.send();
        });
        return res.cookie("token", token, cookieOptions).send(); // TODO
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
                    res.status(200);
                    res.json({ message: `${userName} has been deleted successfully.` });
                } else {
                    console.log(`User not found: ${userName}`);
                    res.status(404);
                    res.json({ error: "User not found." });
                }
            })
            .catch(err => {
                console.error("Error deleting user:", err);
                res.status(500);
                res.json({ error: "Server error" });
            });
    } else {
        console.log("Missing username");
        res.status(400).json({ error: "Missing username." });
    }
});

app.post("/login", async (req, res) => {
    let reqBody = req.body;

    if ((reqBody.hasOwnProperty("username")) && (reqBody.hasOwnProperty("password"))) {
        let { username, password } = reqBody;

        let result;
        try {
            result = await pool.query(
                "SELECT password FROM users WHERE username = $1",
                [username],
            );
        } catch (error) {
            console.log("SELECT FAILED", error);
            return res.status(500).json({error : "Internal server error"});
        }

        // username doesn't exist
        if (result.rows.length === 0) {
            return res.status(400).json({error : "Username does not exist"});
        }
        let hash = result.rows[0].password;

        let verifyResult;
        try {
            verifyResult = await argon2.verify(hash, password);
        } catch (error) {
            console.log("VERIFY FAILED", error);
            return res.status(500).json({error : "Internal error"});
        }

        // password didn't match
        console.log(verifyResult);
        if (!verifyResult) {
            console.log("Credentials didn't match");
            return res.status(400).json({error : "Invalid username or password"});
        }

        let token = makeToken();

        await pool.query(`INSERT INTO tokens (token, username) VALUES ($1, $2);`, [token, username]).then(() => {
            console.log(`Successfully added user ${username} with token ${token}`);
            // res.status(200);
            // res.send();
        }).catch(err => {
            console.log("Error inserting user and token:", err);
            res.status(500);
            res.send();
        });
        return res.cookie("token", token, cookieOptions).send();

    } else {
        console.log("Missing username or password");
        res.status(404);
        res.send();
    }
});

app.delete("/logout", (req, res) => {
    let { token } = req.cookies;

    if (token === undefined) {
        console.log("Already logged out");
        return res.status(400).json({error : "Already logged out"});
    }

    pool.query('DELETE FROM tokens WHERE token = $1 RETURNING *;', [token])
        .then(result => {
            if (result.rows.length > 0) {
                console.log(`Deleted token: ${token}`);
            } else {
                console.log(`Token not found: ${token}`);
                res.status(404);
                res.json({ error: "Token not found." });
            }
        })
        .catch(err => {
            console.error("Error deleting token:", err);
            res.status(500);
            res.json({ error: "Server error" });
        });
    return res.clearCookie("token", cookieOptions).send();
});

module.exports = app;