const router = require("express").Router();

const folders = require("./folders.js");
const notes = require("./notes.js");
const users = require("./users.js");

router.use("/", folders);
router.use("/", notes);
router.use("/", users);

module.exports = router;
//test commit