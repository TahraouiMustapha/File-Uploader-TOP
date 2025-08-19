const { Router } = require("express")

const authRouter = Router()

const userControllers = require("../controllers/userController")
const passport = require("passport")

authRouter.get("/sign-up", (req, res)=> res.render("sign-up", {
    title: "Sign Up"
}))

authRouter.get("/log-in", (req, res)=> res.render("log-in", {
    title: "Log In"
}))

authRouter.post("/sign-up", userControllers.signUp )

authRouter.post("/log-in", passport.authenticate("local", {
    successRedirect: "/", 
    failureRedirect: "/users/log-in", 
    failureFlash: true, 
}))


module.exports = authRouter;