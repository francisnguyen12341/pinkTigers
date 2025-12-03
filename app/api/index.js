const router = require("express").Router();

const folders = require("./folders.js");
const notes = require("./notes.js");
const users = require("./users.js");
const edges = require("./edges.js");
const images = require("./images.js");

router.use("/", folders);
router.use("/", notes);
router.use("/", users);
router.use("/", edges);
router.use("/", images);

module.exports = router;