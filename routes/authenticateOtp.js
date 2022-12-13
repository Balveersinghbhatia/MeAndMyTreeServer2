const express = require("express");
const twilio = require("twilio");
const router = express.Router();
const crypto = require("crypto");
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const cookieParser = require("cookie-parser");
const db = require("../db");
const TWILLIO_ACCOUNT_SID = process.env.TWILLIO_ACCOUNT_SID;
const TWILLIO_AUTH_TOKEN = process.env.TWILLIO_AUTH_TOKEN;
const client = twilio(TWILLIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN);

const JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN;
const JWT_REFERST_TOKEN = process.env.JWT_REFERST_TOKEN;
const SMS_SECRET_KEY = process.env.SMS_SECRET_KEY;

// Post request: Send number and get a otp
router.post(
  "/sendOTP",
  [body("c_number", "Invalid  customer no").notEmpty()],
  (req, res) => {
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
      const { c_number: phone } = req.body;
      //generating a random otp
      const otp = Math.floor(100000 + Math.random() * 900000);
      //time to live
      const ttl = 2 * 60 * 1000;
      //otp expires in
      const expires = Date.now() + ttl;
      const data = `${phone}.${otp}.${expires}`;
      const hash = crypto
        .createHmac("sha256", SMS_SECRET_KEY)
        .update(data)
        .digest("hex");

      const fullHash = `${hash}.${expires}`;
      success = 1;
      client.messages
        .create({
          body: `Your one time login password for meandmytree is ${otp}`,
          from: +18087365766,
          to: phone,
        })
        .then((msg) => {
          console.log("Otp sent success");
          success = 1;
        })
        .catch((err) => {
          return res.status(400).json({
            success,
            msg: "OTP didn't sent",
            error: err,
          });
        });
      creating a entry for this number as user
      db.query(
        `select * from otp_login_master where phone_no ="${phone}"`,
        (err, row) => {
          if (!err) {
            if (row.length === 0) {
              console.log("User is logging for the first time");
              db.query(
                `insert into otp_login_master (phone_no) values ("${phone}")`,
                (err, row) => {
                  if (!err) {
                    return res.status(200).json({
                      success,
                      msg: "OTP sent successfully",
                      hash: fullHash,
                      otp,
                    });
                  } else {
                    return res.json(err);
                  }
                }
              );
            } else {
              // console.log("User is not logging for the first time");
              return res.status(200).json({
                success,
                msg: "OTP sent successfully",
                hash: fullHash,
                otp,
              });
            }
          } else {
            return res.json(err);
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
// Post request: Send otp and verify it.
router.post(
  "/verifyOTP",
  [
    body("c_number", "Invalid  customer no").notEmpty(),
    body("c_otp", "Invalid otp").notEmpty(),
    body("hash", "Invalid hash").notEmpty(),
  ],
  (req, res) => {
    let success = 0; // if there is any errror in req body ie that if parameters are not validated response with bad request
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
      const { c_number: phone, c_otp: otp, hash } = req.body;

      db.query(
        `select * from otp_login_master where phone_no ="${phone}"`,
        (err, row) => {
          if (!err) {
            if (row.length === 0) {
              // It means he has not asked for a otp but verifying it so:
              return res.json({ success, msg: "Request Otp First" });
            } else {
              const user_ids = row[0].user_id;
              const [hashValue, expires] = hash.split(".");
              const now = Date.now();
              if (now > parseInt(expires)) {
                return res
                  .status(504)
                  .send({ success, msg: "Timeout. Please try again" });
              }
              const data = `${phone}.${otp}.${expires}`;
              const newCalculatedHash = crypto
                .createHmac("sha256", SMS_SECRET_KEY)
                .update(data)
                .digest("hex");

              if (newCalculatedHash === hashValue) {
                // console.log("user confirmed");

                req.session.isAuth = true;
                success = 1;
                res.cookie("isAuth", true);
                // Now giving user his/her user_id registered for his phone number
                req.session.user_id = user_ids;
                res.status(200).json({ success, msg: "OTP verified!" });
              } else {
                res.status(400).json({ success, msg: "Incorrect Otp" });
              }
            }
          } else {
            return res.json(err);
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
