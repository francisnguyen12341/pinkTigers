const router = require("express").Router();

const folders = require("./folders.js");
const notes = require("./notes.js");
const tokens = require("./tokens.js");
const users = require("./users.js");

router.use("/", folders);
router.use("/", notes);
//router.use("/", tokens);
router.use("/", users);

module.exports = router;