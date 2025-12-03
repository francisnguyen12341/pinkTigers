const pool = require("../utils/connection");
const app = require("express").Router();
const upload = require("../utils/upload");

app.post("/image-upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, error: "No image uploaded" });
    }

    res.status(200);
    res.json({
        data: {
            filePath: `/uploads/${req.file.filename}`
        }
    });
    
});


module.exports = app;