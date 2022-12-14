const mysql = require("mysql");

const db = mysql.createConnection({
  host: "162.241.85.25",
  user: "maymojes_meandmytree",
  password: "MyTree123*",
  database: "maymojes_meandmytree",
});

const pool = mysql.createPool({
  host: "162.241.85.25",
  user: "maymojes_meandmytree",
  password: "Te-jLMcyza]4",
  database: "maymojes_meandmytree",
});
// module.exports.myConnection = myConnection;
// module.exports.dbOptions = dbOptions;
module.exports.pool = pool;
module.exports.db = db;
