const pool = require("../utils/connection");
const app = require("express").Router();

//end points for making notes
app.get("/notes", async (req, res) => {
  try {
    console.log("Fetching notes...");
    const result = await pool.query("SELECT id, name, x, y, text FROM notes");

    const nodes = result.rows.map(row => ({
        data: {
            id: String(row.id),
            label: row.name,
            text:row.text
        }, // positions need to be returned like this for frontend
        position: {
            x: Number(row.x),
            y: Number(row.y)
        }
    }));

    console.log("Query result:", nodes);
    res.json(nodes);
  } catch (err) {
    console.error("Error fetching notes:", err.message);
    console.error(err.stack);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/notes", async (req, res) => {
    let body = req.body;
    if (body.hasOwnProperty("name") && body.hasOwnProperty("x") && body.hasOwnProperty("y") && body.hasOwnProperty("text") && body.hasOwnProperty("folder_id")) {
        let name = body.name;
        let x = body.x;
        let y = body.y;
        let text = body.text;
        let folder_id = body.folder_id;

        console.log(name, x, y, text, folder_id);
        pool.query(
            `INSERT INTO notes(name, x, y, text, folder_id) 
            VALUES($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, x, y, text, folder_id],
        )
        .then((result) => {
            console.log("Node Inserted Successfully");
            res.statusCode = 200;
            res.json({ id : result.rows[0].id});
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

app.put("/notes-update-loc", async (req, res) => {
    const { x, y, id } = req.body;

    if (!id || x === undefined || y === undefined) {
        return res.status(400).json({ error: "Missing id, x, or y." });
    }

    try {
        const result = await pool.query(
            `UPDATE notes
             SET x = $1, y = $2
             WHERE id = $3
             RETURNING *`,
            [x, y, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Note not found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error updating note location:", error);
        res.status(500).json({ error: "Database update failed." });
    }
});


module.exports = app;