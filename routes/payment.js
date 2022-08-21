const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Post request: Add Payment Record
router.post(
  "/",
  [
    body("p_amount", "Invalid  amount").notEmpty(),
    body("tr_id", "Invalid transaction_id").notEmpty(),
    body("p_status", "Invalid status ").notEmpty(),
    body("p_type", "Invalid type").notEmpty(),
    body("response", "Invalid response").notEmpty().isLength({ min: 5 }),
  ],
  (req, res) => {
    const {
      p_amount: p_amount,
      tr_id: transaction_id,
      p_status: p_status,
      p_type: p_type,
      response: response,
    } = req.body;

    let status = 0;
    // if there is any errror in req body ie that if parameters are not validated response with bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      let msg = [];
      for (let i of errorsArray) {
        msg.push(i.msg);
      }
      return res.status(400).json({ status, msg });
    }
    try {
      // INSERT INTO `payment_master` (`p_id`, `p_amount`, `tr_id`, `p_status`, `p_type`, `response`, `time`) VALUES (NULL, '1000', '1', '1', '1', 'This is response', current_timestamp());
      db.query(
        `insert into payment_master (p_amount,tr_id,p_status,p_type,response) values (${p_amount},${transaction_id},${p_status},"${p_type}","${response}")`,
        (err, row, fields) => {
          if (!err) {
            status = 1;
            return res.json({
              status: status,
              msg: "Payment record added",
            });
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
  }
);
// Get request: Get Payment Record
router.get(
  "/:id",

  (req, res) => {
    let status = 0;

    try {
      db.query(
        `select * from payment_master where p_id=${req.params.id}`,
        (err, row, fields) => {
          if (!err) {
            if (row.length === 0) {
              return res.status(404).json({
                status: status,
                msg: "Payment record not found",
              });
            }
            status = 1;
            return res.json({
              status: status,
              details: row,
            });
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
  }
);

module.exports = router;
