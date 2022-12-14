const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { db, pool } = require("./db");
const port = process.env.PORT || 5000;
const app = express();
const MySQLStore = require("express-mysql-session")(session);

app.use(cors());
// app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded());
// To save the session in database

const sessionStore = new MySQLStore({
  expiration: 10800000,
  createDatabaseTable: true,
  host: "162.241.85.25",
  user: "maymojes_meandmytree",
  password: "Te-jLMcyza]4",
  database: "maymojes_meandmytree",
});
// To create sessions
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "this is the secret",
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false,
    store: sessionStore,
  })
);

app.get("/", function (req, res) {
  // req.session.isAuth = true;
  let success = 0;
  try {
    pool.getConnection((err, conn) => {
      if (!err) {
        conn.query(
          `select * from customer_master where c_id=1`,
          (err, row, fields) => {
            if (!err) {
              if (row.length === 0) {
                return res.status(404).json({
                  success,
                  msg: "Customer record not found",
                });
              }
              success = 1;

              return res.send(`Hello! ${row[0].c_name}`);
            } else {
              return res.status(400).json({ success, err });
            }
          }
        );
      } else {
        res.json({ success, error: err });
      }
      conn.release();

      // Handle error after the release.
    });
  } catch (error) {
    res.status(500).json({
      success,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});

app.listen(port, function () {
  console.log("Started application on port %d", port);
});

// Available routes
app.use("/api/customer", require("./routes/profile"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/tree", require("./routes/tree"));
app.use("/api/transaction", require("./routes/transaction"));
app.use("/api/location", require("./routes/location"));
app.use("/api/review", require("./routes/review"));
app.use("/api/", require("./routes/authenticate"));
app.use("/api/", require("./routes/authenticateOtp"));
app.use("/api/", require("./routes/cart"));
