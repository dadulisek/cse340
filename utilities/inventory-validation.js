const utilities = require('.');
const { body, validationResult } = require('express-validator');
const validate = {};

validate.addClassificationRules = () => {
    return [
      // classidication_name is required and must be string
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .isAlpha('en-US')
        .matches(/^[a-zA-Z]+$/)
        .withMessage("Please provide a classification name with only alphabetic characters and not blank spaces."), // on error this message is sent.
    ]
}

validate.checkClassificationData = async (req, res, next) => {
    const { classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
  }

module.exports = validate