const express = require("express");
const db = require("./db");

const port = 10000;
// Database connection
db.connect((err) => {
  if (err) {
    console.log(err);
  } else console.log("Connected Successfully");
});

let app = express();

app.use(express.json());
app.get("/", function (request, response) {
  response.send("Hello World!");
});
app.listen(port, function () {
  console.log("Started application on port %d", port);
});

// Available routes
app.use("/api/customer", require("./routes/profile"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/tree", require("./routes/tree"));
app.use("/api/tree/transaction", require("./routes/tree_transaction"));
