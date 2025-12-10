# pinkTigers
Git Repository for Pink Tigers Webpage Project

# Running Locally
1. Run `npm install` to install the appropriate packages
2. Create a env.json in the root directory
```json
{
	"user": "postgres",
	"host": "localhost",
	"database": "obsidianclone",
	"password": "",
	"port": 5432
}
```
3. In app/server.js, change the file contents to:
```javascript
/*
    Date: 11/30/2025
    Comments from Francis for post Francis development and deployment of backend data base.
    Previously, we had our pool database set up in our server. I moved it over to its own .js file called database in utils
    I also added in const pool = require("./utils/database"). I forgot why.
*/


let cookieParser = require("cookie-parser");
const express = require("express");
const authorize = require("./utils/auth");
const app = express();
const cors = require("cors");


// nodes graphic library; Cytoscape.js will be used
const cytoscape = require('cytoscape');
const pool = require("./utils/database");



//cors validation. I have two origins listed: one for my local, and one for dev-main.
app.use(cors({
  origin: [
    "https://pink-tigers-git-francis-deployment-test-ftn23s-projects.vercel.app",
    "https://pink-tigers.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.static("public")); // commenting this because front end lives on Vercel not Railway. I think this was used for local testing too idk
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./api"));

app.get("/private", authorize, (req, res) => {
    console.log("YAYYY!! we did it! - vanessa and miya");
    return res.send("A private message\n");
});


// local port stuff for hosting server in local machine. commented out for deployment usage stuff below.
const port = 3000;
const hostname = "localhost";
app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});


// Start server (Railway)
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log("Server running on port " + port);
// });
```
4. In app/api/users.js, change `const { pool } = require("../utils/database")` to `const pool = require("../utils/connection")`
5. In app/public/login.js, change `const backend = window.ENV.BACKEND_URL;` to `const backend = "";`
6. Uncomment code in `app/utils/connection.js`
7. Run `npm run runTest` to automatically create database and tables (this deletes the database as well, if it existed)
8. Go to http://localhost:3000/login.html and create an account (anything works)
9. Go to http://localhost:3000/mindmapwnav.html and create folders, notes, and edges
10. Folder Side Nav: Single click on a dropdown to expand a folder's subfolders. Double click on a folder to set it as the active folder. Add/update/remove folders using the appropriate buttons.
11. Notes: Double click on a note to edit its contents. Right click on a note to rename or delete it. Single click on two nodes to add an edge between them. Single click the two nodes again to remove the edge between them.

# Setup
### Installing Packages
```bash
npm install
```

### Create Database
1. Add your postgres password to env.json
2. If needed, update package.json scripts depending on your environment
3. Run the following command:
```bash
npm run setup
```

### Drop Database
```bash
npm run drop
```

### Run Server
```bash
npm run start
```
