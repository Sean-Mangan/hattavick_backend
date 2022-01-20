const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const database = require("./database/database")
const MongoStore = require('connect-mongo');
var cookieParser = require("cookie-parser");
const app = express();
var cors = require('cors')

var corsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(cookieParser())

// init session
app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: parseInt(3600000),
    },
    store: MongoStore.create({
      mongoUrl: database.uri, //YOUR MONGODB URL
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native' 
  })
  })
);

app.use(function (req, res, next) {
  var cookie = req.cookies.hattavick_user;
  if (cookie) {
    req.session.user = cookie
  } 
  next();
});

app.use(function (req, res, next) {
  console.log(req.cookies)
  next()
})

// Import routes
const userRoutes = require('./routes/users');
app.use("/api/login", userRoutes);

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from home",
  });
});

app.get("/logout", (req, res, next) => {
  if(req.session.user){
    res.clearCookie('hattavick_user');
    req.session.destroy();
    console.log("cleared cookie and logged out")
    return res.status(200).json({
      message: "Successfully logged out",
    });
  }else{
    return res.status(404).json({
      error: "Not yet logged in",
    });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);

// app.listen(5555, () => {
//   console.log(`Example app listening at http://localhost:${5555}`)
// })