const { Router } = require("express")

const userRouter = Router()

const userControllers = require("../controllers/userController")

userRouter.get("/sign-up", (req, res)=> res.render("sign-up", {
    title: "Sign Up"
}))

userRouter.post("/sign-up", userControllers.signUp )


module.exports = userRouter;