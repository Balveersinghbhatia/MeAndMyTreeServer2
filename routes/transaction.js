const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const checkAuthentication = require("../middleware/checkSession");

// Post request: Add Tree Record
router.post(
  "/",
  [
    body("t_id", "Invalid tree id").notEmpty(),
    body("l_id", "Invalid location id").notEmpty(),
    body("c_id", "Invalid customer id").notEmpty(),
    body("o_id", "Invalid occasion id").notEmpty(),
  ],
  checkAuthentication,
  (req, res) => {
    const { t_id, l_id, c_id, o_id } = req.body;

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
        `insert into transaction_master (t_id,o_id,l_id,c_id) values (${t_id},${o_id},${l_id},${c_id})`,
        (err, row, fields) => {
          if (!err) {
            success = 1;
            return res.json({
              success,
              msg: "Transaction record added",
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
// Get request: Get Tree Record
router.get("/:id", checkAuthentication, (req, res) => {
  let success = 0;

  try {
    db.query(
      `select * from transaction_master where tr_id=${req.params.id}`,
      (err, row, fields) => {
        if (!err) {
          if (row.length === 0) {
            return res.status(404).json({
              success,
              msg: "Transaction record not found",
            });
          }
          success = 1;
          return res.json({
            success,
            details: row,
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
});
// Put request: Update Tree record
router.put(
  "/:id",
  checkAuthentication,
  [
    body("t_id", "Invalid tree id").notEmpty(),
    body("l_id", "Invalid location id").notEmpty(),
    body("c_id", "Invalid customer id").notEmpty(),
    body("o_id", "Invalid occasion id").notEmpty(),
  ],
  (req, res) => {
    let success = 0;
    const { t_id, l_id, c_id, o_id } = req.body;

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
        `UPDATE transaction_master SET t_id="${t_id}" , c_id=${c_id} ,o_id=${o_id},l_id=${l_id} WHERE tr_id = ${req.params.id} `,
        (err, row, fields) => {
          if (!err) {
            if (row.affectedRows === 0) {
              return res.status(404).json({
                success,
                msg: "Update didn't happen!",
                reason: "Transaction with this id doesn't exist",
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
