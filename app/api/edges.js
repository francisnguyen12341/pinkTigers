const pool = require("../utils/connection");
const app = require("express").Router();
const auth = require("../utils/auth");

app.get("/edges", async (req, res) => {
    let body = req.query;

    if (body.hasOwnProperty("note1") && body.hasOwnProperty("note2")) {
        pool.query(
            `SELECT id FROM edges 
            WHERE note1 = $1 AND note2 = $2`,
            [body.note1, body.note2]
        ).then((resp) => {
            if (resp.rowCount == 0) {
                res.status(201);
            }
            else {
                res.status(200);
            }

            res.send();
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send();
        });
    }
});

app.post("/edges", async (req, res) => {
    let body = req.body;

    if (body.hasOwnProperty("note1") && body.hasOwnProperty("note2")) {
        let note1 = body.note1;
        let note2 = body.note2;

        pool.query(
            `INSERT INTO edges(note1, note2) 
            VALUES($1, $2)
            RETURNING *`,
            [note1, note2],
        )
            .then((result) => {
                console.log("Edge Inserted Successfully");
                res.statusCode = 200;
                res.json({ id: result.rows[0].id });
            })
            .catch((error) => {
                console.log("Error creating edge:", error);
                res.statusCode = 500;
                res.send();
            });
    } else {
        console.log("Missing note1 or note2");
        res.status(400).json({ error: "Missing note1 or note2" });
    }
});

app.delete("/edges", async (req, res) => {
    let body = req.body;

    if (body.hasOwnProperty("note1") && body.hasOwnProperty("note2")) {
        pool.query(
            `DELETE FROM edges 
            WHERE note1 = $1 AND note2 = $2
            RETURNING *;`,
            [body.note1, body.note2]
        ).then(result => {
            if (result.rows.length > 0) {
                console.log(`Deleted edge between: ${body.note1} and ${body.note2}`);
                res.status(200);
                res.json({ id: result.rows[0].id });
            } else {
                console.log(`Edge ${body.note1} and ${body.note2} not found`);
                res.status(404);
                res.json({ error: "Edge not found." });
            }
        }).catch(err => {
            console.error("Error deleting edge:", err);
            res.status(500);
            res.json({ error: "Server error" });
        });
    }
});

module.exports = app;