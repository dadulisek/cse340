const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


// Build view of single iteam !!!!!!!!
invCont.buildById = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getProductById(inv_id)
  const grid = await utilities.buildProductPage(data)
  let nav = await utilities.getNav()
  const year = data[0].inv_year
  const make = data[0].inv_make
  const model = data[0].inv_model
  res.render("./inventory/classification", {
    title: year + " " + make + " " + model,
    nav,
    grid
  })
}

//Buid Management view
invCont.builManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

//Build Add Classification view
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

// Add the new class to the classification table
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const regResult = await invModel.addClassificationToDB(classification_name)

  if (regResult) {
    req.flash("notice", `The ${classification_name} classification was succesfully added`);
    res.status(201).render('inventory/management', {
      title: 'Vehicle Management',
      nav,
      errors: null,

    });
  } else {
    req.flash("notice", "Sorry, the proccess failed.")
    res.status(501).render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      errors: null,

    });
  }
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let dropMenu = await utilities.buildClassificationList()

  res.render("./inventory/add-inventory", {
    title: "Add New Inventory Item",
    nav,
    dropMenu,
    errors: null,
  })
}

invCont.addVehicle = async function(req, res){
  const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
  } = req.body

  const dbResult = await invModel.addVehicle(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
  )

  if(dbResult){
      req.flash(
          "notice", 
          `${inv_year} ${inv_make} ${inv_model} successfully added to inventory.`
      )
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management",{
          title:"Inventory Management",
          nav,
      })
  } else {
      let nav = await utilities.getNav()
      let classificationMenu = await utilities.buildClassificationMenu(classification_id)
      req.flash("notice", "Sorry, the vehicle creation failed.")
      res.status(501).render("inventory/add-inventory",{
          title:"Add Vehicle",
          nav,
          classificationMenu,
          errors:null,
          inv_make,
          inv_model,
          inv_year,
          inv_description,
          inv_image,
          inv_thumbnail,
          inv_price,
          inv_miles,
          inv_color
      })
  }
}

module.exports = invCont