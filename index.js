const express = require("express");
const db = require("./db");

const port = process.env.PORT || 5000;
// Database connection
db.connect((err) => {
  if (err) {
    console.log(err);
  } else console.log("Connected Successfully");
});

let app = express();

app.use(express.json());
app.get("/", function (req, res) {
  let status = 0;

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
          return res.send(`Hello ! ${row[0].c_name}`);
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
app.use("/api/tree/transaction", require("./routes/tree_transaction"));
app.use("/api/location", require("./routes/location"));

setInterval(function () {
  db.query("SELECT 1");
}, 5000);
