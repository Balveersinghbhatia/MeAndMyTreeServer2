const checkAuthentication = require("../middleware/checkSession");
const { body, validationResult } = require("express-validator");
const { pool } = require("../db");
const express = require("express");
const session = require("express-session");

const router = express.Router();
// Request to create cart
router.post(
  "/addtocart",
  [
    body("item_id", "Invalid item id").notEmpty(),
    body("item_qty", "Invalid item quantity").notEmpty(),
    body("item_price", "Invalid item price").notEmpty(),
    body("item_total_price", "Invalid item total price").notEmpty(),
    body("remarks", "Invalid remarks"),
  ],
  // checkAuthentication,
  (req, res) => {
    console.log(req.body);
    let success = 0;
    const { item_id, item_qty, item_price, item_total_price } = req.body;
    let remarks = req.body.remarks;
    if (remarks.length === 0) {
      remarks = "None ";
    }
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
      const user_id = req.session.user_id;
      // Adding the item to the cart
      db.query(
        // First Check if cart exists for particular user or not
        `select * from cart_master where user_id="${user_id}"`,
        (err, row) => {
          if (!err) {
            if (row.length === 0) {
              // Length zero means cart is not created for this user
              console.log("Cart doesn't exist for this user!");
              //Creating the cart
              db.query(
                `insert into cart_master (user_id,cart_remarks) values (${user_id},"Just Created")`,
                (err, row) => {
                  if (!err) {
                    console.log("Cart Created");
                    db.query(
                      `select cart_id from cart_master where user_id=${user_id}`,
                      (err, row) => {
                        if (!err) {
                          // Now let's add the item to the cart
                          const cart_id = row[0].cart_id;
                          console.log("Adding the acutall item to cart");
                          db.query(
                            `insert into cart_details (cart_id,item_id,cd_item_qty,cd_item_price,cd_item_totalprice,cd_remarks) values  (${cart_id},${item_id},${item_qty},${item_price},${item_total_price},"${remarks}")`,
                            (err, row) => {
                              if (!err) {
                                console.log("Added done");
                                // Updating the status of cart after adding the item
                                db.query(
                                  `select * from cart_master where user_id=${user_id}`,
                                  (err, row) => {
                                    if (!err) {
                                      console.log(row[0]);
                                      let {
                                        cart_total_items,
                                        cart_totalprice,
                                        cart_finalprice,
                                      } = row[0];
                                      if (
                                        cart_total_items === null ||
                                        cart_totalprice === null ||
                                        cart_finalprice === null
                                      ) {
                                        cart_total_items = 0;
                                        cart_totalprice = 0;
                                        cart_finalprice = 0;
                                      }

                                      db.query(
                                        `update cart_master set cart_total_items=${
                                          cart_total_items + 1
                                        },cart_totalprice=${
                                          cart_totalprice +
                                          item_price * item_qty
                                        },cart_finalprice=${
                                          cart_finalprice +
                                          item_price * item_qty
                                        },cart_remarks="Product Added" where user_id=${user_id} `,
                                        (err, row) => {
                                          if (!err) {
                                            console.log("Cart Master Updated");
                                          } else {
                                            console.log(
                                              "Error in updating cart master"
                                            );
                                            console.log(err);
                                          }
                                        }
                                      );
                                    } else {
                                      console.log(err);
                                    }
                                  }
                                );
                              } else {
                                console.log(err);
                              }
                            }
                          );
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    console.log(err);

                    // res.json(err);
                  }
                }
              );
            }
            //     console.log("reached here");
            else {
              console.log("Cart already there");
              db.query(
                `select cart_id from cart_master where user_id=${user_id}`,
                (err, row) => {
                  if (!err) {
                    // Now let's add teh item to the cart
                    const cart_id = row[0].cart_id;
                    console.log("Adding the acutall item to cart");
                    db.query(
                      `insert into cart_details (cart_id,item_id,cd_item_qty,cd_item_price,cd_item_totalprice,cd_remarks) values  (${cart_id},${item_id},${item_qty},${item_price},${item_total_price},"${remarks}")`,
                      (err, row) => {
                        if (!err) {
                          console.log("Added done");
                          // Updating the status of cart after adding the item
                          db.query(
                            `select * from cart_master where user_id=${user_id}`,
                            (err, row) => {
                              if (!err) {
                                console.log(row[0]);
                                let {
                                  cart_total_items,
                                  cart_totalprice,
                                  cart_finalprice,
                                } = row[0];
                                if (
                                  cart_total_items === null ||
                                  cart_totalprice === null ||
                                  cart_finalprice === null
                                ) {
                                  cart_total_items = 0;
                                  cart_totalprice = 0;
                                  cart_finalprice = 0;
                                }

                                db.query(
                                  `update cart_master set cart_total_items=${
                                    cart_total_items + 1
                                  },cart_totalprice=${
                                    cart_totalprice + item_price * item_qty
                                  },cart_finalprice=${
                                    cart_finalprice + item_price * item_qty
                                  } ,cart_remarks="Product Added" where user_id=${user_id} `,
                                  (err, row) => {
                                    if (!err) {
                                      console.log("Cart Master Updated");
                                    } else {
                                      console.log(
                                        "Error in updating cart master"
                                      );
                                      console.log(err);
                                    }
                                  }
                                );
                              } else {
                                console.log(err);
                              }
                            }
                          );
                        } else {
                          console.log(err);
                        }
                      }
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
            }
          } else {
            res.json(err);
          }
        }
      );

      res.send("ok");
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
router.get("/getcart/", checkAuthentication, (req, res) => {
  let success = 0;
  try {
    const user_id = req.session.user_id;
    pool.getConnection((err, conn) => {
      if (!err) {
        conn.query(
          `select cart_id from cart_master where user_id=${user_id}`,
          (err, row) => {
            if (!err) {
              if (row.length === 0) {
                res.json({ success, error: "No item in the cart" });
              } else {
                let cart_id = row[0].cart_id;
                conn.query(
                  `select * from cart_details where cart_id = ${cart_id}`,
                  (err, row) => {
                    if (!err) {
                      console.log("query ran success");
                      success = 1;
                      res.json({ success, msg: row });
                    } else {
                      res.json({ success, error: err });
                    }
                  }
                );
              }
            } else {
              res.json({ success, error: err });
            }
          }
        );
      } else {
        return res.status(400).json({ success, err });
      }
    });
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

router.get("/emptycart", checkAuthentication, (req, res) => {
  let success = 0;

  try {
    const user_id = req.session.user_id;
    db.query(
      `select cart_id from cart_master where user_id=${user_id}`,
      (err, row) => {
        if (!err) {
          if (row.length !== 0) {
            console.log("Deleting all records for cart id ", row[0].cart_id);
            let cart_id = row[0].cart_id;

            db.query(
              `delete from cart_details where cart_id = ${cart_id}`,
              (err, row) => {
                if (!err) {
                  success = 1;
                  res.json({ success, msg: "Cart is empty now!" });
                } else {
                  res.json({ success, error: err });
                }
              }
            );
          } else {
            console.log("Cart is already empty!");
            res.json({ success, msg: "Cart was already empty!" });
          }
        } else {
          res.json({ success, error: err });
        }
      }
    );
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
// router.post('/changeqty',[
//   body("item_id", "Invalid item id").notEmpty(),
//   body("item_qty", "Invalid item quantity").notEmpty(),
//   body("item_price", "Invalid item price").notEmpty(),
//   body("item_total_price", "Invalid item total price").notEmpty(),
//   body("remarks", "Invalid remarks"),
// ],)
module.exports = router;
