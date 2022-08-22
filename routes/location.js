const express = require("express");
const db = require("../db");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Post request: Add Tree Record
router.post(
  "/",
  [
    body("l_address", "Invalid  address").notEmpty().isLength({ min: 10 }),
    body("l_size", "Invalid size").notEmpty(),
    body("l_longitude", "Invalid longitude").notEmpty(),
    body("l_latitude", "Invalid latitude").notEmpty(),
    body("l_name", "Invalid name").notEmpty(),
    body("l_ownership", "Invalid ownership").notEmpty(),
  ],
  (req, res) => {
    const { l_address, l_size, l_longitude, l_latitude, l_name, l_ownership } =
      req.body;

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
        `insert into location_master (l_address,l_size,l_longitude,l_latitude,l_name,l_ownership) values ("${l_address}","${l_size}","${l_longitude}","${l_latitude}","${l_name}","${l_ownership}")`,
        (err, row, fields) => {
          if (!err) {
            status = 1;
            return res.json({
              status: status,
              msg: "Location record added",
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
// Get request: Get Tree Record
router.get(
  "/:id",

  (req, res) => {
    let status = 0;
    try {
      db.query(
        `select * from location_master where l_id=${req.params.id}`,
        (err, row, fields) => {
          if (!err) {
            if (row.length === 0) {
              return res.status(404).json({
                status: status,
                msg: "Location record not found",
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
// Put request: Update Tree record
router.put(
  "/:id",
  [
    body("l_address", "Invalid  address").notEmpty().isLength({ min: 10 }),
    body("l_size", "Invalid size").notEmpty(),
    body("l_longitude", "Invalid longitude").notEmpty(),
    body("l_latitude", "Invalid latitude").notEmpty(),
    body("l_name", "Invalid name").notEmpty(),
    body("l_ownership", "Invalid ownership").notEmpty(),
  ],
  (req, res) => {
    let status = 0;
    const { l_address, l_size, l_longitude, l_latitude, l_name, l_ownership } =
      req.body;

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
      db.query(
        `UPDATE location_master SET l_address="${l_address}" , l_size="${l_size}",l_latitude="${l_latitude}",l_longitude="${l_longitude}",l_name="${l_name}",l_ownership="${l_ownership}" WHERE l_id = ${req.params.id} `,
        (err, row, fields) => {
          if (!err) {
            if (row.affectedRows === 0) {
              return res.status(404).json({
                status: status,
                msg: "Update didn't happen!",
                reason: "Location with this id doesn't exist",
              });
            }
            status = 1;
            return res.json({
              status: status,
              msg: row,
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
