// Importing express module
const express = require("express");
const db = require("../db");
const session = require("express-session");
require("dotenv").config();
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const checkAuthentication = require("../middleware/checkSession");

// Login  : With username and password
router.post(
  "/register",
  [
    body("username", "Invalid Username").notEmpty().isLength({ min: 5 }),
    body("password", "Invalid Password").notEmpty().isLength({ min: 8 }),
    body("email", "Invalid email").notEmpty().isEmail(),
  ],

  (req, res) => {
    const { username, password, email } = req.body;
    console.log("Register Api");
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
      // Check if user exists
      db.query(
        `select * from login_master where username="${username}"`,
        (err, row) => {
          if (!err) {
            if (row.length === 0) {
              // Length zero means no entry with usename,means user doesn't exist before
              // Creating salt for bcrypt
              const salt = bcrypt.genSaltSync(10);
              // Creating hashed password with salt
              const secPas = bcrypt.hashSync(password, salt);

              //  inserting the username, password and email into the databse
              // IE storing/creating the user

              db.query(
                `insert into login_master (username,password,email) values ("${username}","${password}","${email}")`,
                (err, row, fields) => {
                  if (!err) {
                    success = 1;
                    return res.json({
                      success: success,
                      msg: "User created successfully",
                    });
                  } else {
                    return res.success(200).json({ success, err });
                  }
                }
              );
              // Storing the session
            } else {
              res.json({ success, msg: "This username already exists" });
            }
          } else {
            res.json(err);
          }
        }
      );
    } catch (error) {
      res.success(500).json({
        success,
        msg: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
router.post(
  "/login",
  [
    body("username", "Bhai mere sahi se user name dal pls").isLength({
      min: 5,
    }),
    body("password", "Bhai mere sahi se password dal").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    // console.log("Login Api");
    // console.log(req.body);

    let success = false;
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    // IF no error in the body then proceed ahead.
    try {
      const { username, password } = req.body;
      // Check for user
      let user = null;
      db.query(
        `select * from login_master where username="${username}"`,
        async (err, row) => {
          if (!err) {
            if (row.length === 0) {
              // length zero means user doesn't exist so it has to first register
              res.json({ success, msg: "User not found", notfound: true });
            } else {
              user = row[0];
              console.log(user);
              // console.log(password);
              // if user exists, check for password match
              const passwordCompare = await bcrypt.compare(
                password,
                user.password
              );

              if (password !== user.password) {
                res.json({
                  success,
                  error: "Please login with correct crendentials -p",
                });
              } else {
                // res.send(user);
                req.session.isAuth = true;
                req.session.user_id = user.user_id;
                success = true;
                res.json({ success, msg: "User Logged In" });
              }
            }
          } else {
            res.json(err);
          }
        }
      );
      // if (user === null) {
      //   res.json({
      //     success,
      //     error: "Please login with correct crendentials",
      //   });
      // } else {
      //   // if user exists, check for password match
      //   const passwordCompare = await bcrypt.compare(password, user.password);
      //   if (passwordCompare === false) {
      //     res.json({
      //       success,
      //       error: "Please login with correct crendentials -p",
      //     });
      //   } else {
      //     // if email and password are correct then return token
      //     const authData = {
      //       user: {
      //         id: user.id,
      //       },
      //     };
      //     // Creating token
      //     // It takes two parameters, data with which we will authenticate and our signature
      //     const authToken = jwt.sign(authData, JWT_Secret);
      //     // res.send(user);
      //     success = true;
      //     res.json({ success, authToken });
      //   }
      // }
    } catch (error) {
      // if some error occures in above code then do this.
      console.error(error.message);
      res.status(500).json({
        success,
        msg: "Internal Server Error",
        error: error.message,
      });
    }
  }
);
router.get("/logout", checkAuthentication, (req, res) => {
  try {
    req.session.destroy();
    res.send("User logged out successfully!");
  } catch (error) {
    // if some error occures in above code then do this.
    console.error(error.message);
    res.status(500).json({
      success,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
});
module.exports = router;
