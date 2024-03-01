const express = require('express')
const mongoose = require('mongoose')

require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
// const User = require("./models/user");
// const logoutRoutes = require("./logout/logout")
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
// const orderRoutes = require("./routes/orderRoutes");

const app = express();
require("dotenv").config();

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;


db.once("open", () => {
  console.log("Connected to MongoDB");
});

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/google/sipproj",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile || !profile.emails || !profile.emails[0]) {
            
            return done(null, false, {
              message: "Incomplete profile information",
            });
          }
  
         
          let user = await User.findOne({ googleId: profile.id });
  
          if (user) {
            console.log("Details saved");
            return done(null, user);
          } else {
           
            user = new User({
              googleId: profile.id,
              displayName: profile.displayName || "Default Name",
              email: profile.emails[0].value || "Default Email",
              
            });
            console.log("Details saved");
            await user.save();
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  app.use(
    session({
      secret: "ninad",
      resave: false,
      saveUninitialized: true,
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", authRoutes);
app.use("/api", foodRoutes);
// app.use("/api", orderRoutes);

app.listen(3000,()=>{
    console.log("Server listening successfully on port 3000")
})
