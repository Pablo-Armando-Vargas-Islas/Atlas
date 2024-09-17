//const Pool = require("pg").Pool;

//const pool = new Pool({
    //user: "postgres",
    //password: "admin",
    //host: "localhost",
    //port: 5432,
    //database: "Atlas"
//})

//module.exports = pool;


const Pool = require("pg").Pool;
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
