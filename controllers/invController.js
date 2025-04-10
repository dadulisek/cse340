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
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
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

// Add new vehicle to DB
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  // console.log("buildEditInventory Zacatek")
  const inv_id = parseInt(req.params.inv_id)
  // console.log(req.params.inv_id + "Testik")
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetailByInventoryId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  // console.log(itemData.inv_model + "Testo druhy")
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.buildDelete = async function (req, res, next) {
  // console.log("buildEditInventory Zacatek")
  const inv_id = parseInt(req.params.inv_id)
  // console.log(req.params.inv_id + "Testik")
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryDetailByInventoryId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData[0].classification_id)
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`
  // console.log(itemData.inv_model + "Testo druhy")
  res.render("./inventory/delete-confirmation", {
    title: "Delete " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price,
  })
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)
  console.log(req.body.inv_id)
  const {
    inv_make,
    inv_model,
    inv_price,
    inv_year,
  } = req.body
  const updateResult = await invModel.deleteInventory(inv_id)
  if (updateResult) {
    const itemName = inv_make + " " + inv_model
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirmation", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price
    })
  }
}

module.exports = invCont