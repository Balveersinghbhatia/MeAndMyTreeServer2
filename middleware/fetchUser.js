const jwt = require("jsonwebtoken");

require("dotenv").config;
const getUser = (req, res, next) => {
  /* Middle ware can:
	  Execute any code.
    Make changes to the request and the response objects.
    End the request-response cycle.
    Call the next middleware in the stack.  */

  // Get the user from jwt token and add id to req object
  // jwt is to be send in the header
  const token = req.header("auth-token");
  if (!token) {
    res
      .status(401)
      .send({ error: "Please authenticate using valid token -not present" });
  }
  try {
    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(data);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using valid token" });
  }
  // next will call the async funciton next to the middle ware
};

module.exports = getUser;
