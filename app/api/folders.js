const pool = require("../utils/connection");
const app = require("express").Router();

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

// const selectedFolder;
// default to root folder?

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

module.exports = app;