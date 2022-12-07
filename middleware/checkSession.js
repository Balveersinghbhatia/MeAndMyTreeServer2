const jwt = require("jsonwebtoken");

require("dotenv").config;
const checkAuthentication = (req, res, next) => {
  /* Middle ware can:
	  Execute any code.
    Make changes to the request and the response objects.
    End the request-response cycle.
    Call the next middleware in the stack.  */

  // This will be used to check if user is authenticated by checking if session is there in the request
  console.log(req.session.id);
  try {
    if (req.session.isAuth || req.cookie.isAuth) {
      next();
    } else {
      res.status(401).send({
        Message: "User is not authenticated - No Session Cookie",
      });
    }
  } catch (error) {
    res.status(401).send({
      Message: "User is not authenticated - No Session Cookie",
      Error: error,
    });
  }
  // next will call the async funciton next to the middle ware
};

module.exports = checkAuthentication;
