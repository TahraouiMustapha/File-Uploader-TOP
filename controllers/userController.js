const { body, validationResult } = require("express-validator")
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")

// import db funcs
const prisma = require("../db/queries")

const errorMessages = {
    empty: "can not be empty", 
    length: "must be at least 8 characteres long"
}

const signUpValidate = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage(`Username ${errorMessages.empty}`)
        .isEmail()
        .withMessage("Please enter a valid email address"), 
    body("password")
        .trim()
        .notEmpty()
        .withMessage(`Password ${errorMessages.empty}`)
        .isLength({min:8})
        .withMessage(`Password ${errorMessages.length}`), 
    body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage(`Confirm password ${errorMessages.empty}`)
        .custom((value, {req}) => {
            const { password } = req.body;
            if(value !== password) {
                throw new Error("Passwords do not match.")
            }

            return true;
        })       
]

const signUp = [
    signUpValidate, 
    asyncHandler(async (req, res)=> {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(404).render("sign-up", {
                title: "Sign Up", 
                errors: errors.array()
            })
        }

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10)
        
        await prisma.createUser(username, hashedPassword)

        res.redirect("/users/log-in")
    })
]


module.exports = {
    signUp
}