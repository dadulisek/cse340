// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')
//Routes to do stuff
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Process the login attempt
router.
post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
// Build managment view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.updateAccountView))


router.post(
  "/update-info",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// POST: handle password change
router.post(
  "/update-password",
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  // req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
});

module.exports = router;