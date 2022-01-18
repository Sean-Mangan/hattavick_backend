const serverless = require("serverless-http");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
var cors = require('cors')

var corsOptions = {
  origin: 'http://hattavick.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors())

// init session
app.use(session({
    secret: "secret",
    saveUninitialized: true,
    resave: false,
    cookie: {
      httpOnly: true,
      maxAge: parseInt(36000000),
    }
  })
);

// JSON parse each request
app.use(bodyParser.json());

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
    req.session.destroy();
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