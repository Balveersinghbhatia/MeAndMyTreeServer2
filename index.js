const cors = require("cors");
const express = require("express");
var bodyParser = require("body-parser");
const session = require("express-session");
const db = require("./db");
const port = process.env.PORT || 5000;
const app = express();
const MySQLStore = require("express-mysql-session")(session);

app.use(cors());
app.use(express.json());

// app.use(express.urlencoded());
// To save the session in database
const sessionStore = new MySQLStore(
  {
    expiration: 10800000,
    createDatabaseTable: true,
  },
  db
);
// To create sessions
app.use(
  session({
    secret: "this is the secret",
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
  })
);

app.get("/", function (req, res) {
  // req.session.isAuth = true;

  try {
    db.query(
      `select * from customer_master where c_id=1`,
      (err, row, fields) => {
        if (!err) {
          if (row.length === 0) {
            return res.status(404).json({
              status: status,
              msg: "Customer record not found",
            });
          }
          status = 1;
          return res.send(`Hello! ${row[0].c_name}`);
        } else {
          return res.status(400).json({ status, err });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
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
app.use("/api/", require("./routes/authenticate"));
