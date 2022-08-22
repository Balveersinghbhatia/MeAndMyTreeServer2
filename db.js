const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "treePlantation",
// });
const db = mysql.createConnection({
  host: "162.241.85.25",
  user: "maymojes_meandmytree",
  password: "MyTree123*",
});

module.exports = db;
