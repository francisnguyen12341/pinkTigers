// PostgreSQL connection from railway back end to rail way database
const pg = require("pg");

const Pool = pg.Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});



/* changing this because this uses local system file environment variables. need to use it on railway
const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
    console.log(`Connected to database ${env.database}`);
});
*/



//adding this below because our roots files need access to postgres sql. each file needs access to pool/database and this export allows other files to access it.
module.exports = { pool };

