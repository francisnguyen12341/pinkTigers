const pool = require("../utils/connection");
const app = require("express").Router();
const auth = require("../utils/auth");

app.get("/get-user-folders", auth, (req, res) => {
    let { token } = req.cookies;
    
    let username;
    let mainFolderID;

    pool.query(`SELECT username FROM tokens WHERE token = $1`, [token]).then((result) => {
        if (result.rows.length > 0) {
           username = result.rows[0].username;
           console.log("Found username: " + username);
        }
    }).catch((error) => {
        console.log(error);
        res.status(500);
        res.send();
    });

    pool.query(`SELECT main_folder_id FROM users WHERE username = $1`, [username]).then((result) => {
        console.log(result.rows);

        if (result.rows.length > 0) {
            mainFolderID = result.rows[0].main_folder_id;
            console.log("Found mainFolderID: " + mainFolderID);
        }
    }).catch((error) => {
        console.log(error);
        res.status(500);
        res.send();
    });

    let mainFolderName;

    pool.query(`SELECT name FROM folders WHERE id = $1;`, [mainFolderID]).then(result => {
        mainFolderName = result.rows[0].name;
        console.log("Found mainFolderName: " + mainFolderName);
    }).catch((error) => {
        console.log(error);
        res.status(500);
        res.send();
    });

    let recursiveSearch = (folder_id) => {
        let folders = [];

        pool.query(`SELECT (id, name) FROM folders WHERE parent_id = $1;`, [folder_id]).then(result => {
            for (let row of result.rows) {
                folders.push({
                    folderName: row.name,
                    folders: recursiveSearch(row.id),
                });
            }
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send();
        });

        return folders;
    };

    res.status(200);
    res.json({
        username,
        folders: recursiveSearch(mainFolderID),
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