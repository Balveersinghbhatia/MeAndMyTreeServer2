// Importing express module
const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult, check } = require("express-validator");
const checkAuthentication = require("../middleware/checkSession");

// Post request: Add Tree Record
router.post(
  "/",
  [
    body("t_type", "Invalid  type").notEmpty().isLength({ min: 4 }),
    body("t_price", "Invalid price").notEmpty(),
  ],
  checkAuthentication,
  (req, res) => {
    const { t_type: type, t_price: price } = req.body;
    console.log("Tree api");
    console.log(req.body);

    let success = 0;
    // if there is any errror in req body ie that if parameters are not validated response with bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      let msg = [];
      for (let i of errorsArray) {
        msg.push(i.msg);
      }
      return res.status(400).json({ success, msg });
    }
    try {
      // INSERT INTO `payment_master` (`p_id`, `p_amount`, `tr_id`, `p_status`, `p_type`, `response`, `time`) VALUES (NULL, '1000', '1', '1', '1', 'This is response', current_timestamp());
      db.query(
        `insert into tree_master (t_type,t_price) values ("${type}",${price})`,
        (err, row, fields) => {
          if (!err) {
            success = 1;
            return res.json({
              success: success,
              msg: "Tree record added",
            });
          } else {
            return res.status(400).json({ success, err });
          }
        }
      );
    } catch (error) {
      res
        .status(500)
        .json({ success, msg: "Internal Server Error", error: error.message });
    }
  }
);
// Get request: Get Tree Record
// There are two variants : id provided or not
// IF provided it will return the data of tree with that particular id
// If not then it will return the data of all the trees
router.get("/:id", checkAuthentication, (req, res) => {
  let success = 0;

  try {
    let tree_id = req.params.id;
    let query = "";
    if (tree_id === "0") {
      query = `select * from tree_master`;
    } else {
      query = `select * from tree_master where t_id=${tree_id}`;
    }
    db.query(query, (err, row, fields) => {
      if (!err) {
        if (row.length === 0) {
          return res.status(404).json({
            success: success,
            msg: "Tree record not found",
          });
        }
        success = 1;
        return res.json({
          success: success,
          details: row,
        });
      } else {
        return res.status(400).json({ success, err });
      }
    });
  } catch (error) {
    res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});
// Put request: Update Tree record
router.put(
  "/:id",
  [
    body("t_type", "Invalid  type").notEmpty().isLength({ min: 4 }),
    body("t_price", "Invalid price").notEmpty(),
  ],
  checkAuthentication,
  (req, res) => {
    let success = 0;
    const { t_type: type, t_price: price } = req.body;

    // if there is any errror in req body ie that if parameters are not validated response with bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      let msg = [];
      for (let i of errorsArray) {
        msg.push(i.msg);
      }
      return res.status(400).json({ success, msg });
    }
    try {
      db.query(
        `UPDATE tree_master SET t_type="${type}" , t_price=${price} WHERE t_id = ${req.params.id} `,
        (err, row, fields) => {
          if (!err) {
            if (row.affectedRows === 0) {
              return res.status(404).json({
                success,
                msg: "Update didn't happen!",
                reason: "Tree with this id doesn't exist",
              });
            }
            success = 1;
            return res.json({
              success,
              msg: row,
            });
          } else {
            return res.status(400).json({ success, err });
          }
        }
      );
    } catch (error) {
      res.status(500).json({
        success,
        msg: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
module.exports = router;
