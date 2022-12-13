// Importing express module
const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult, check } = require("express-validator");
const checkAuthentication = require("../middleware/checkSession");

// Post request: Add Review Record
router.post(
  "/",
  [
    body("c_id", "Invalid  customer id").notEmpty(),
    body("t_id", "Invalid tree id").notEmpty(),
    body("rating", "Invalid rating").notEmpty(),
    body("comment", "Invalid comment").notEmpty(),
  ],
  checkAuthentication,
  (req, res) => {
    const { c_id, t_id, rating, comment } = req.body;
    console.log("Review api");
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
        `insert into review (c_id,t_id,rating,comment) values (${c_id},${t_id},${rating},"${comment}")`,
        (err, row, fields) => {
          if (!err) {
            success = 1;
            return res.json({
              success: success,
              msg: "Review record added",
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
// Get request: Get Review Record
// There are two variants : id provided or not
// IF provided it will return the data of review with that particular id
// If not then it will return the data of all the review
router.get("/:id", checkAuthentication, (req, res) => {
  let success = 0;

  try {
    let review_id = req.params.id;
    let query = "";
    if (review_id === "0") {
      query = `select * from review`;
    } else {
      query = `select * from review where review_id=${review_id}`;
    }
    db.query(query, (err, row, fields) => {
      if (!err) {
        if (row.length === 0) {
          return res.status(404).json({
            success: success,
            msg: "Review record not found",
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
// Put request: Update Review record
router.put(
  "/:id",
  [
    body("c_id", "Invalid  customer id").notEmpty(),
    body("t_id", "Invalid tree id").notEmpty(),
    body("rating", "Invalid rating").notEmpty(),
    body("comment", "Invalid comment").notEmpty(),
  ],
  checkAuthentication,
  (req, res) => {
    let success = 0;
    const { c_id, t_id, rating, comment } = req.body;

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
        `UPDATE review SET c_id=${c_id} , t_id=${t_id} , rating=${rating} , comment="${comment}" WHERE review_id = ${req.params.id} `,
        (err, row, fields) => {
          if (!err) {
            if (row.affectedRows === 0) {
              return res.status(404).json({
                success,
                msg: "Update didn't happen!",
                reason: "Review with this id doesn't exist",
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
