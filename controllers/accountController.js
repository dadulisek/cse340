const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null
    })
  }

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }
  
  /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  // console.log("accountLogin Zacatek")
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


  //Build Management view
  async function buildManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
      title: "Management",
      nav,
    })
}

async function updateAccountView(req, res, next){
  let nav = await utilities.getNav()
  const accountId = req.params.accountId;

  try {
    const accountData = await accountModel.getAccountById(accountId);

    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/login");
    }

    res.render("account/update", {
      title: "Update Account",
      nav,
      accountData,
    });
  } catch (err) {
    console.error(err);
    req.flash("notice", "Error retrieving account data.");
    res.redirect("/account/login");
  }
}

async function updateAccountInfo(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  const updateResult = await accountModel.updateAccountInfo({
    account_id,
    account_firstname,
    account_lastname,
    account_email
  });

  if (updateResult) {
    req.flash("notice", "Account information updated.");
  } else {
    req.flash("notice", "Account update failed.");
  }

  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
  });
}

async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, new_password } = req.body;
  const hashedPassword = await bcrypt.hash(new_password, 10);

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword);

  if (updateResult) {
    req.flash("notice", "Password successfully updated.");
  } else {
    req.flash("notice", "Password update failed.");
  }

  const accountData = await accountModel.getAccountById(account_id);
  res.render("account/management", {
    title: "Account Management",
    nav,
    accountData,
  });
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildManagement, 
  updateAccountView, 
  updateAccountInfo, 
  updatePassword 
}