let cookieParser = require("cookie-parser");
const express = require("express");
const authorize = require("./utils/auth");
const app = express();
const cors = require("cors");


// nodes graphic library; Cytoscape.js will be used
const cytoscape = require('cytoscape');
const pool = require("./utils/database");


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

//app.use, listen only to the vercel app. //adding my own specific deployment for my own testing
/* old app.use cors testing new one because i get a access denied with this one
app.use(cors({
    origin: ["https://pink-tigers.vercel.app"
    ], 
    credentials: true
}));
*/
//origin linked to both production and my current branch?
app.use(cors({
  origin: [
    "https://pink-tigers-git-francis-deployment-test-ftn23s-projects.vercel.app",
    "https://pink-tigers.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//app.options('*', cors());

//app.use(express.static("public")); commenting this because front end lives on Vercel not Railway.
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./api"));

app.get("/private", authorize, (req, res) => {
    console.log("YAYYY!! we did it! - vanessa and miya");
    return res.send("A private message\n");
});


/* local port  stuff below. reminder that connection.js is reading local port as well? it is the local sql data base oops in connection. below is local server hosting on lcoal machine.
app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});
*/

// Start server (Railway)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server running on port " + port);
});