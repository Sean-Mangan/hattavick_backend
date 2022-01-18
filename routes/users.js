const serverless = require("serverless-http");
const express = require("express");
const router = express.Router();
const client = require('../database/database');

router.post("/", (req, res, next) => {
  console.log("USER REQUEST", req.body)
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
        res.status(500).json({'error' : 'Internal Server Error'});
      }
    });
  });
});

module.exports = router;
  