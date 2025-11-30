// PostgreSQL connection from railway back end to rail way database
const pg = require("pg");

const Pool = pg.Pool;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

//adding this below because our roots files need access to postgres sql. each file needs access to pool/database and this export allows other files to access it.
module.exports = pool;
