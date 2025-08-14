const express = require("express")
const path = require("path")
const expressSession = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const { PrismaClient } = require("@prisma/client")
const app = express()
require("dotenv").config()

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


const PORT = process.env.PORT || 3000;
app.listen(PORT, (err)=> {
    if(err) {
        throw err;
    }  
    console.log(`listening on Port : ${PORT}`)
})