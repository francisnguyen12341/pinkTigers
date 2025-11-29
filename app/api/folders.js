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
    if (body.hasOwnProperty("name")) {
        let name = body.name;
        // Creating non-root folder
        if (body.hasOwnProperty("parent_id")) {
            let parent_id = body.parent_id;
            pool.query(
                `INSERT INTO folders(name, parent_id) 
                VALUES($1, $2)
                RETURNING *`,
                [name, parent_id],
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
                `INSERT INTO folders(name) 
                VALUES($1)
                RETURNING *`,
                [name],
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
        console.log("Missing name");
        res.status(400).json({ error: "Missing name." });
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

async function createNavBar() {
    try {
        let sideNav = "";

        // Get all folders
        let result = await pool.query(`SELECT * FROM folders`);
        let allFolders = result.rows;

        // Create object for folder hierarchy (to know which folders have children)
        let folderHierarchy = {};
        for (let folder of allFolders) {
            if (folder.parent_id != null) {
                if(!folderHierarchy[folder.parent_id]) {
                    folderHierarchy[folder.parent_id] = [];
                }
                folderHierarchy[folder.parent_id].push(folder);
            }
        }

        // Go through all folders and generate HTML for the folder side nav
        for (let folder of allFolders) {
            // Single Top Level Folder: Has no children and is not a child of anyone else
            if (!folderHierarchy[folder.id] && !isAChild(folder, folderHierarchy)) {
                sideNav += `<a href="#${folder.name}">${folder.name}</a>`;
            } // Top Level Folder: Has children and is not a child of anyone else
            else if (folderHierarchy[folder.id] && !isAChild(folder, folderHierarchy)) {
                sideNav += await createChildren(folder, folderHierarchy);
            }
        }
        return sideNav;
    } catch (error) {
        console.error("Error in creating nav bar:", error);
    }
}

function isAChild(folder, folderHierarchy) {
    // for each key-value pair of folderHierarchy
    for(let folderId in folderHierarchy) {
        let folderChildren = folderHierarchy[folderId]
        // cycle through all children of a given folder
        for(let child of folderChildren) {
            // inputted folder is a child of another folder
            if(child.id === folder.id) {
                return true;
            }
        }
    }
    return false;
}

async function createChildren(folder, folderHierarchy) {
    sideNavChildren = "";
    sideNavChildren += `
                <button class="dropdown-btn ${folder.name}"> ${folder.name}
                    <i class="fa fa-caret-down"></i>
                </button>
                <div class="dropdown-container">`
    // Go through all child folders of a given folder
    for(let childFolder of folderHierarchy[folder.id]) {
        // The child folder has no child folders under it
        if(!folderHierarchy[childFolder.id]) {
            sideNavChildren += `<a href="#${childFolder.name}">${childFolder.name}</a>`;
        }
        // The child folder has more child folders under it (nested children)
        else {
            sideNavChildren += await createChildren(childFolder, folderHierarchy);
        }
    }
    // Terminate dropdown-container
    sideNavChildren += `</div>`
    return sideNavChildren;
}

app.get("/sidenav", async (req, res) => {
    try {
        const navBar = await createNavBar();
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.send(`
            <div class="sidenav">
                ${navBar}
            </div>
        `);
    } catch (error) {
        console.error("Error generating sidebar:", error);
        res.status(500).json({ error: "Error generating sidebar" });
    }
});

module.exports = app;