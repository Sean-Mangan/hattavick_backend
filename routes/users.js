const serverless = require("serverless-http");
const express = require("express");
const router = express.Router();
const client = require('../database/database');

router.post("/", (req, res, next) => {
  console.log("USER REQUEST", req.body)
  if(req.session.user){
    console.log("already logged in")
    res.status(200).json({"name": req.session.user});
  }else{
    if (req.body.name){
      client.connect(err => {
        client.db("Hattavick").collection("user_data").findOne(req.body, (err,result) => {
          try {
            console.log(req.session.user)
            if (err) throw err
            if (result) {
              req.session.user = result.name
              res.status(200).json(result);
            } else{
              res.status(404).json({error: "Not Found"})
            }
          }catch(err) {
            console.log(err)
            res.status(500).json({error : 'Internal Server Error'});
          }
        });
      });
    }else{
      res.status(404).json({error: "Not Found"})
    }
  }
});

module.exports = router;
  