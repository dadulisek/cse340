// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/inventory-validation")
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build detailed view of item
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildById));
// Route to get to management view
router.get("/", utilities.handleErrors(invController.builManagement));
//Route to Add Classificatoin
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
// Store the data (Can't see error message)
router.post("/add-classification", regValidate.addClassificationRules(), regValidate.checkClassificationData, utilities.handleErrors(invController.addClassification));
// Route to Add Inventory
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
// Store the new inventory
router.post("/add-inventory", regValidate.addVehicleRules(), regValidate.checkVehicleData, utilities.handleErrors(invController.addVehicle));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))
// For editing inventory data
router.get("/edit/:inv_id", utilities.handleErrors(invController.buildEditInventory))

//Sending edited data
router.post("/update/", regValidate.addVehicleRules(), regValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory))

// Delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDelete))

router.post("/delete/", utilities.handleErrors(invController.deleteInventory))

module.exports = router;