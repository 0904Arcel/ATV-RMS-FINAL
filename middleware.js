// middleware.js

exports.checkAuthentication = (req, res, next) => {
    if (!req.session.Customer_id) {
      return res.redirect("/LoginPage.html"); // Redirect to login page if the user is not logged in
    }
    next(); // Continue to the next middleware or route handler if the user is authenticated
  };
  