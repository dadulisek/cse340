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

module.exports = router;