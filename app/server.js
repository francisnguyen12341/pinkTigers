const crypto = require('crypto');
let argon2 = require("argon2");
let cookieParser = require("cookie-parser");
const pg = require("pg");
const express = require("express");
const app = express();
const cors = require("cors");

// nodes graphic library; Cytoscape.js will be used
const cytoscape = require('cytoscape');


/* changing for Railway back end
const port = 3000;
const hostname = "localhost";
*/
//rail way port
//const port = process.env.PORT || 3000;


/* changing this because this uses local system file environment variables. need to use it on railway
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
    console.log(`Connected to database ${env.database}`);
});
*/

//app.use, listen only to the vercel app.
app.use(cors({
    origin: ["https://pink-tigers-git-francis-deployment-test-ftn23s-projects.vercel.app/"], 
    credentials: true
}));

// PostgreSQL connection from railway back end to rail way database
const Pool = pg.Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Start server (Railway)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});

//test commit

//app.use(express.static("public")); commenting this because front end lives on Vercel not Railway.
app.use(express.json());
app.use(cookieParser());

// Add server endpoints here

function makeToken() {
    return crypto.randomBytes(32).toString("hex");
}

let cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
};


// QUICK CURL TESTS
// create-account: curl -X POST http://localhost:3000/create-account --json '{"username":"vanessa","password":"rawr"}'
// delete-account: curl -X DELETE http://localhost:3000/delete-account -H "Content-Type: application/json" -d '{"username": "vanessa"}'
// get-user-folders: curl "http://localhost:3000/get-user-folders?username=vanessa"
// logout: curl --cookie "token=thegeneratedtoken" -X DELETE http://localhost:3000/logout
// login: curl -X POST http://localhost:3000/login --json '{"username":"vanessa","password":"rawr"}'

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

let authorize = (req, res, next) => {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.sendStatus(403);
    }
    pool.query(`SELECT * FROM tokens WHERE token = $1`, [token]).then((result) => {
        if (result.rows.length > 0) {
            next();
        }
        else {
            return res.sendStatus(403);
        }
    }).catch((error) => {
        console.log(error);
        res.statusCode = 500;
        res.send();
    });
};

app.get("/private", authorize, (req, res) => {
    console.log("YAYYY!! we did it! - vanessa and miya");
    return res.send("A private message\n");
});


app.get("/get-user-folders", (req, res) => {
    let username = req.query.username;

    if (!username) {
        res.json({ error: "Username is required" });
        res.status(400);
        return;
    }

    // plan here: query for the user's folders whenever we figure out how notes are implemented and then basically send back the whole folder system
    pool.query('SELECT id FROM users WHERE username = $1;', [username])
        .then(result => {
            if (result.rows.length > 0) {
                let userId = result.rows[0].id;

                let userInfo = {
                    userName: username,
                    userId: userId,
                    // this part will prob need to be change
                    folders: {
                        "folderName": "RootFolder",
                        "folders": [
                            {
                                "folderName": "Subfolder1",
                                "folders": []
                            },
                            {
                                "folderName": "Subfolder2",
                                "folders": []
                            },
                            {
                                "folderName": "Subfolder3",
                                "folders": []
                            }
                        ]
                    }
                };

                res.status(200);
                res.setHeader("Content-Type", "text/json");
                res.json(userInfo);
            } else {
                res.status(404);
                res.json({ error: "User not found" });
            }
        })
        .catch(err => {
            console.error("Error querying user:", err);
            res.status(500);
            res.json({ error: "Server error" });
        });
});

app.get("/folder", (req, res) => {
    let query = req.query;
    if (query.hasOwnProperty("name")) {
        // endpoint response will need to be changed to better suit /get-user-folders endpoint
        // maybe want to return the notes in the folder?
        let name = query.name;
        pool.query(`SELECT * FROM folders WHERE name = $1`, [name]).then((result) => {
            console.log("Retrieved:");
            console.log(result.rows);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/json");
            res.json({ folder: result.rows });
        }).catch((error) => {
            console.log(error);
            res.statusCode = 500;
            res.send();
        });
    }
    else {
        console.log("Missing name");
        res.status(400).json({ error: "Missing name." });
    }
});

app.post("/folder", (req, res) => {
    let body = req.body;
    if (body.hasOwnProperty("name") && body.hasOwnProperty("user_id")) {
        let name = body.name;
        let user_id = body.user_id;
        // Creating non-root folder
        if (body.hasOwnProperty("parent_id")) {
            let parent_id = body.parent_id;
            pool.query(
                `INSERT INTO folders(name, user_id, parent_id) 
                VALUES($1, $2, $3)
                RETURNING *`,
                [name, user_id, parent_id],
            )
                .then((result) => {
                    console.log("Inserted:");
                    console.log(result.rows);
                    res.statusCode = 200;
                    res.send();
                })
                .catch((error) => {
                    console.log("Error creating folder:", error);
                    res.statusCode = 500;
                    res.send();
                });
        }
        // Creating root folder
        else {
            pool.query(
                `INSERT INTO folders(name, user_id) 
                VALUES($1, $2)
                RETURNING *`,
                [name, user_id],
            )
                .then((result) => {
                    console.log("Inserted:");
                    console.log(result.rows);
                    res.statusCode = 200;
                    res.send();
                })
                .catch((error) => {
                    console.log("Error creating folder:", error);
                    res.statusCode = 500;
                    res.send();
                });
        }
    }
    else {
        console.log("Missing name or user_id");
        res.status(400).json({ error: "Missing or user_id." });
    }
});

app.delete("/folder", (req, res) => {
    let query = req.query;
    if (query.hasOwnProperty("name")) {
        let name = query.name;
        pool.query(
            `DELETE FROM folders WHERE name = $1
            RETURNING *`,
            [name],
        )
            .then((result) => {
                if (result.rows.length > 0) {
                    console.log(`Deleted folder: ${name}`);
                    res.status(200);
                    res.setHeader("Content-Type", "text/json");
                    res.json({ message: `${name} has been deleted successfully.` });
                } else {
                    console.log(`Folder not found: ${name}`);
                    res.status(404);
                    res.setHeader("Content-Type", "text/json");
                    res.json({ error: "Folder not found." });
                }
            })
            .catch((error) => {
                console.log("Error deleting folder:", error);
                res.status(500);
                res.setHeader("Content-Type", "text/json");
                res.json({ error: "Server error" });
            });
    } else {
        console.log("Missing name");
        res.status(400).json({ error: "Missing name." });
    }
});


//end points for making notes
app.get("/notes", async (req, res) => {
  try {
    console.log("Fetching notes...");
    const result = await pool.query("SELECT id, name, text FROM notes");
    console.log("Query result:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching notes:", err.message);
    console.error(err.stack);
    res.status(500).json({ error: "Server error" });
  }
});


/* old local port hosting
app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
*/