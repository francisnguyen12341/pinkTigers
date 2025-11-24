const pool = require("../utils/connection");
const app = require("express").Router();

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

app.post("/notes", async (req, res) => {
    let body = req.body;
    if (body.hasOwnProperty("name") && body.hasOwnProperty("text") && body.hasOwnProperty("folder_id")) {
        let name = body.name;
        let text = body.text;
        let folder_id = body.folder_id;
        pool.query(
            `INSERT INTO notes(name, text, folder_id) 
            VALUES($1, $2, $3)
            RETURNING *`,
            [name, text, folder_id],
        )
        .then((result) => {
            console.log("Inserted:");
            console.log(result.rows);
            res.statusCode = 200;
            res.send();
        })
        .catch((error) => {
            console.log("Error creating note:", error);
            res.statusCode = 500;
            res.send();
        });
    } else {
        console.log("Missing name, text, and/or folder_id");
        res.status(400).json({ error: "Missing name, text, and/or folder_id." });
    }
});

app.put("/notes", async (req, res) => {
    let body = req.body;
    if (body.hasOwnProperty("name") && body.hasOwnProperty("text") && body.hasOwnProperty("folder_id")) {
        let name = body.name;
        let text = body.text;
        let folder_id = body.folder_id;
        pool.query(
            `INSERT INTO notes(name, text, folder_id) 
            VALUES($1, $2, $3)
            RETURNING *`,
            [name, text, folder_id],
        )
        .then((result) => {
            console.log("Inserted:");
            console.log(result.rows);
            res.statusCode = 200;
            res.send();
        })
        .catch((error) => {
            console.log("Error creating note:", error);
            res.statusCode = 500;
            res.send();
        });
    } else {
        console.log("Missing name, text, and/or folder_id");
        res.status(400).json({ error: "Missing name, text, and/or folder_id." });
    }
});

module.exports = app;