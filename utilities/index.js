const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}  

//Build HTML for each product
Util.buildProductPage = async function(data) {
  let grid
  if (data.length > 0) {
    grid = '<div id="product">'
    grid += '<img src="' + data[0].inv_image + '" alt="Image of ' + data[0].inv_make + " " + data[0].inv_model + ' on CSE Motors"/>'
    grid += '<div id="product-details">'
    grid += '<h2>' + data[0].inv_make + " " + data[0].inv_model + ' Details</h2>'
    grid += '<p><span class="bold-product">Price:</span> $' + new Intl.NumberFormat('en-US').format(data[0].inv_price) + '</p>'
    grid += '<p><span class="bold-product">Description: </span>' + data[0].inv_description + '</p>'
    grid += '<p><span class="bold-product">Color: </span>' + data[0].inv_color + '</p>'
    grid += '<p><span class="bold-product">Miles: </span>' + new Intl.NumberFormat('en-US').format(data[0].inv_miles) + '</p>'
    grid += '</div>'
    grid += '</div>'
  }else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
      res.locals.loggedin = false
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = true
     next()
    })
  } else {
   next()
  }
 }

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 // Check if admin is logged in
 Util.authorizeAdmin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    const jwt = require("jsonwebtoken");

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash("notice", "Please log in.");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }

      const { account_type } = accountData;

      if (account_type === "Admin" || account_type === "Employee") {
        return next();
      } else {
        req.flash("notice", "You do not have permission to access this page.");
        return res.redirect("/account/login");
      }
    });
  } else {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect("/account/login");
  }
};

module.exports = Util