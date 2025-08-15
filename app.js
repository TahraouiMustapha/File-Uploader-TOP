const express = require("express")
const path = require("path")
const expressSession = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const { PrismaClient } = require('@prisma/client');
const app = express()
require("dotenv").config()


// import routers
const userRouter = require("./routes/userRouter")

// views config
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// sessions config
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000
        }, 
        secret: 'my secret', 
        resave: true, 
        saveUninitialized: true, 
        store: new PrismaSessionStore(
            new PrismaClient(), 
        {
            checkPeriod: 2 * 60 * 1000,  
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
        )
    })
)

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res)=> res.render("main"))
app.use("/users", userRouter)


app.use((err, req, res, next)=> {
    if(err.code == 'P2002') {
        //unique constraint failed
        return res.status(400).render("sign-up", {
            title: "Sign Up", 
            errors: [
                {
                    msg: 'Email already exists. try an other one'
                }
            ]
        })
    }
    console.log(err)
    res.status(500).send(err.message);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err)=> {
    if(err) {
        throw err;
    }  
    console.log(`listening on Port : ${PORT}`)
})