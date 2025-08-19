const express = require("express")
const path = require("path")
const expressSession = require("express-session")
const { PrismaSessionStore } = require("@quixo3/prisma-session-store")
const { PrismaClient } = require('@prisma/client');
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const flash = require("express-flash")
require("dotenv").config()

const app = express()

const db = require("./db/queries");
const bcrypt = require("bcryptjs")

// import routers
const authRouter = require("./routes/authRouter")

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

app.get("/", (req, res)=> res.render("main"))
app.use("/users", authRouter)

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.getUserByUsername(username);

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.userid);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id)

    done(null, user);
  } catch(err) {
    done(err);
  }
});


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