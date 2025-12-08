const pool = require("../utils/connection");
const app = require("express").Router();
const auth = require("../utils/auth");

app.get("/edges", async (req, res) => {
    let body = req.query;

    if (body.hasOwnProperty("note1") && body.hasOwnProperty("note2")) {
        console.log(`Checking edge between note1: ${body.note1} and note2: ${body.note2}`);

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

app.get("/edges-all", async (req, res) => {
    let query = req.query;
    if (query.hasOwnProperty("folder_id")) {
        pool.query(`
            SELECT id, note1, note2 
            FROM edges
            WHERE note1 IN (SELECT id FROM notes WHERE folder_id = $1)
            OR note2 IN (SELECT id FROM notes WHERE folder_id = $1)
        `, [query.folder_id]).then(result => {
            const edges = result.rows.map(row => ({
                group: 'edges',
                data: {
                    id: `edge-${row.id}`,
                    source: String(row.note1),
                    target: String(row.note2)
                }
            }));

            res.json(edges);
        }).catch((error) => {
            console.log(error);
            res.status(500);
            res.send();
        });
    }
    else {
        pool.query(`
            SELECT id, note1, note2 
            FROM edges
        `).then(result => {
            const edges = result.rows.map(row => ({
                group: 'edges',
                data: {
                    id: `edge-${row.id}`,
                    source: String(row.note1),
                    target: String(row.note2)
                }
            }));

            res.json(edges);
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
                console.log(`Edge Inserted Successfully`);
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
                console.log(`Edge ${body.note1} and ${body.note2} deleted`);
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