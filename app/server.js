// /*
//     Date: 11/30/2025
//     Comments from Francis for post Francis development and deployment of backend data base.
//     Previously, we had our pool database set up in our server. I moved it over to its own .js file called database in utils
//     I also added in const pool = require("./utils/database"). I forgot why.
// */


// let cookieParser = require("cookie-parser");
// const express = require("express");
// const authorize = require("./utils/auth");
// const app = express();
// const cors = require("cors");


// // nodes graphic library; Cytoscape.js will be used
// const cytoscape = require('cytoscape');
// const pool = require("./utils/database");



// //cors validation. I have two origins listed: one for my local, and one for dev-main.
// app.use(cors({
//   origin: [
//     "https://pink-tigers-git-francis-deployment-test-ftn23s-projects.vercel.app",
//     "https://pink-tigers.vercel.app"
//   ],
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.use(express.static("public")); 
// // commenting this because front end lives on Vercel not Railway. I think this was used for local testing too idk
// app.use(express.json());
// app.use(cookieParser());

// app.use("/", require("./api"));

// app.get("/private", authorize, (req, res) => {
//     console.log("YAYYY!! we did it! - vanessa and miya");
//     return res.send("A private message\n");
// });


// /* local port stuff for hosting server in local machine. commented out for deployment usage stuff below.
// app.listen(port, hostname, () => {
//     console.log(`Listening at: http://${hostname}:${port}`);
// });
// */

// // Start server (Railway)
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log("Server running on port " + port);
// });


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