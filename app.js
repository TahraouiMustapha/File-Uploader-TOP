const express = require("express")
const path = require("path")
const expressSession = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const { PrismaClient } = require('@prisma/client');
const passport = require("./auth/passport")
const flash = require("express-flash")
require("dotenv").config()

const app = express()

// import routers
const authRouter = require("./routes/authRouter");
const filesRouter = require("./routes/filesRouter");

// views config
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(flash())

// sessions config
app.use(
    expressSession({
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000
        }, 
        secret: process.env.SESSION_SECRET , 
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

app.use(passport.initialize())
app.use(passport.session())

// assign user before all routes 
app.use((req, res, next)=> {
  res.locals.user = req.user
  next();
})

app.get("/", (req, res) => {
  res.render("main", {
    user: req.user
  })
})

app.use("/users", authRouter)
app.use("/files", filesRouter)

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