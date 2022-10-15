// Importing express module
const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult, check } = require("express-validator");
const checkAuthentication = require("../middleware/checkSession");

// Add profile : Adding the customer
router.post(
  "/profile",
  [
    body("c_name", "Invalid Customer Name").notEmpty().isLength({ min: 5 }),
    body("c_add", "Invalid Customer address").notEmpty().isLength({ min: 10 }),
    body("c_mob", "Invalid Mobile number")
      .notEmpty()
      .isLength({ min: 10, max: 10 }),
  ],
  checkAuthentication,
  (req, res) => {
    const { c_name: name, c_add: address, c_dob: dob, c_mob: mob } = req.body;

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
      db.query(
        `insert into customer_master (c_name,c_add,c_dob,c_mob) values ("${name}","${address}",${dob},"${mob}")`,
        (err, row, fields) => {
          if (!err) {
            success = 1;
            return res.json({
              success,
              msg: "Profile added successfully",
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
// View profile : View the customer's profile
router.get("/profile/:id", checkAuthentication, (req, res) => {
  let success = 0;
  try {
    db.query(
      `select * from customer_master where c_id = ${req.params.id} `,
      (err, row, fields) => {
        if (!err) {
          if (row.length === 0) {
            return res.status(404).json({
              success,
              msg: "User not found",
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
});
// Update profile : Update the customer's profile
router.put(
  "/profile/:id",
  checkAuthentication,
  [
    body("c_name", "Invalid Customer Name").notEmpty().isLength({ min: 5 }),
    body("c_add", "Invalid Customer address").notEmpty().isLength({ min: 10 }),
    body("c_mob", "Invalid Mobile number")
      .notEmpty()
      .isLength({ min: 10, max: 10 }),
  ],
  (req, res) => {
    let success = 0;
    const { c_name: name, c_add: address, c_dob: dob, c_mob: mob } = req.body;

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
        `UPDATE customer_master SET c_name="${name}" , c_dob="${dob}" , c_mob=${mob} , c_add="${address}" WHERE c_id = ${req.params.id} `,
        (err, row, fields) => {
          if (!err) {
            if (row.affectedRows === 0) {
              return res.status(404).json({
                success,
                msg: "Update didn't happen!",
                reason: "Profile with this id doesn't exist",
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
