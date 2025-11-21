let cookieParser = require("cookie-parser");
const express = require("express");
const authorize = require("./utils/auth");
const app = express();

// nodes graphic library; Cytoscape.js will be used
const cytoscape = require('cytoscape');

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./api"));

app.get("/private", authorize, (req, res) => {
    console.log("YAYYY!! we did it! - vanessa and miya");
    return res.send("A private message\n");
});

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});