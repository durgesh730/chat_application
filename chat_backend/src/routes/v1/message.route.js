const express = require("express")
const router = express.Router()
const validate = require("../../middleware/validate")
const { AuthController } = require("../../controllers")
const { AuthValidation } = require("../../validations")

router
    .route("/register")
    .post(validate(AuthValidation.newRegister),
        AuthController.newRegister)

module.exports = router