const pool = require("./connection");

let authorize = (req, res, next) => {
    let { token } = req.cookies;
    if (token === undefined) {
        res.redirect("/login");
        return;
    }
    pool.query(`SELECT * FROM tokens WHERE token = $1`, [token]).then((result) => {
        if (result.rows.length > 0) {
            next();
        }
        else {
            res.redirect("/login");
            return;
        }
    }).catch((error) => {
        console.log(error);
        res.statusCode = 500;
        res.send();
    });
};

module.exports = authorize;