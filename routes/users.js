const serverless = require("serverless-http");
const express = require("express");
const router = express.Router();
const database = require('../database/database');
var ObjectId = require('mongodb').ObjectId
const fs = require('fs');

router.post("/login", (req, res, next) => {
  try{
    console.log("USER REQUEST", req.body)
    if(req.session.user){
      console.log("already logged in")
      res.status(200).json({"name": req.session.user});
    }else{
      if (req.body.name){
        database.client.connect(err => {
          database.client.db("Hattavick").collection("user_data").findOne(req.body, (err,result) => {
            if (err) throw err
            if (result) {
              req.session.user = result.name
              res.cookie("hattavick_user", result.name, { maxAge: 172800000, httpOnly: true, sameSite: "None", secure:true}).status(200).json(result);
            } else{
              res.status(404).json({error: "Not Found"})
            }
          });
        });
      }else{
        res.status(404).json({error: "Not Found"})
      }
    }
  } catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.post("/page", (req, res, next) => {
  try {
    if (req.body.page){
      console.log(req.body)
      database.client.connect(err => {
          if (err) throw err;
          database.client.db("Hattavick").collection("page_overview").findOne(req.body, (err, result) =>{
            console.log(`Request to get page data for ${req.body.page}`);
            if (err) throw err;
            if(result){
              console.log("Got data for page")
              res.status(200).json({"overview" : result});
            }else{
              console.log("Could not find page data")
              res.status(404).json({error: "Not Found"})
            }
          });
        });
      }else{
          res.status(404).json({error: "Not Found"})
      }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

router.put("/character", async (req, res, next) => {
  try {
    if (req.body && req.session.user === "Sean" ){
      console.log(req.body)
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("npcs").updateOne({"name": req.body.name}, {$set: req.body}, (err, result) =>{
          if (err) throw err;
          if(result){
            console.log("Updated npcs data")
            res.status(200).json({"status" : result});
          }else{
            console.log("Could not find page data")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.get("/page", async (req, res, next) => {
  try {
    if (req.body){
      console.log(req.body)
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("page_overview").find({}).toArray(function(err, result) {
          if (err) throw err;
          if(result){
            console.log("Got all page data")
            res.status(200).json({"pages" : result});
          }else{
            console.log("Could not find page data")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});


router.get("/player_character", async (req, res, next) => {
  try {
    if (req.session.user){
      console.log(req.body)
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("player_characters").findOne({"player_name" : req.session.user}, function(err, result) {
          if (err) throw err;
          if(result){
            console.log("Successful got player character")
            delete result._id
            res.status(200).json(result);
          }else{
            console.log("Could not find character")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Not Logged In, Bitch"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.put("/player_character", async (req, res, next) => {
  try {
    if ((req.session.user) && (req.session.user === req.body.player_name)){
      console.log(req.body)
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("player_characters").updateOne({"player_name" : req.session.user}, {$set: req.body}, function(err, result) {
          if (err) throw err;
          if(result){
            console.log("Updated Character")
            res.status(200).json(result);
          }else{
            console.log("Could not find character")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.put("/page", async (req, res, next) => {
  try {
    if (req.body.page && req.session.user === "Sean" ){
      console.log(req.body)
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("page_overview").updateOne({"page": req.body.page}, {$set: req.body}, (err, result) =>{
          if (err) throw err;
          if(result){
            console.log("Updated page data")
            res.status(200).json({"status" : result});
          }else{
            console.log("Could not find page to update")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});



router.post("/character", async (req, res, next) => {
  try {
    if (req.body && req.session.user === "Sean" ){
      var new_char = {
        "name": req.body.name,
        "location": " ",
        "description": "",
        "available_notes": [],
        "all_notes": [],
        "visible": false,
        "icon": "",
        "image": "",
        "job": ""
      }
      console.log(new_char)

      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("npcs").insertOne(new_char, (err, result) =>{
          if (err) throw err;
          if(result){
            console.log("Added NPC")
            res.status(200).json({"status" : result});
          }else{
            console.log("Could not add NPC")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.delete("/character", async (req, res, next) => {
  try {
    if (req.body && req.session.user === "Sean" ){
      var new_char = {
        "name": req.body.name,
        "location": " ",
        "description": "",
        "available_notes": [],
        "all_notes": [],
        "visible": false,
        "icon": "",
        "image": "",
        "job": ""
      }
      console.log(new_char)

      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("npcs").deleteOne({"name": req.body.name}, (err, result) =>{
          if (err) throw err;
          if(result){
            console.log("Deleted NPC")
            res.status(200).json({"status" : result});
          }else{
            console.log("Could not delete NPC")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(404).json({error: "Bad Permissions"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.patch("/character", async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.status(405).json({error: "Please log in before getting resource"})
    }
    else if (req.body.name){
      database.client.connect(err => {
        if (err) throw err;
        database.client.db("Hattavick").collection("npcs").findOne(req.body, (err, result) =>{
          if (err) throw err;
          console.log(result)
          if(!result.visible && req.session.user !== "Sean"){
            res.status(405).json({error : "Bad Permissions"});
          }
          else if(result && result.visible){
            console.log("found npc")
            delete result.visible
            delete result.all_notes
            res.status(200).json(result);
          }else{
            console.log("Could not find NPC")
            res.status(404).json({error: "Not Found"})
          }
        });
      });
    }else{
      res.status(405).json({error: "Require name field"})
    }
  }catch(err) {
    console.log(err)
    res.status(500).json({error : 'Internal Server Error'});
  }
});

router.post("/characters", async (req, res, next) => {
  try {
      if (req.body){
        database.client.connect(err => {
            if (err) throw err;
            database.client.db("Hattavick").collection("npcs").find({}).toArray(function(err, result) {
              if (err) throw err;
              if(result){
                resp = []
                for (let a_idx = 0; a_idx < result.length; a_idx++){
                  let npc = result[a_idx]
                  delete npc.all_notes
                  if (npc.visible){
                    resp.push(npc)
                  }else{
                    resp.push({"name": "unknown"})
                  }
                }
                console.log("Got data for Characters")
                res.status(200).json(resp);
              }else{
                console.log("Could not find character data")
                res.status(404).json({error: "Not Found"})
              }
            });
          });
        }else{
            res.status(404).json({error: "Not Found"})
        }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

router.post("/allcharacters", async (req, res, next) => {
  try {
      if (req.body && req.session.user === "Sean"){
        database.client.connect(err => {
            if (err) throw err;
            database.client.db("Hattavick").collection("npcs").find({}).toArray(function(err, result) {
              if (err) throw err;
              if(result){
                console.log("Got data for Characters")
                res.status(200).json(result);
              }else{
                console.log("Could not find character data")
                res.status(404).json({error: "Not Found"})
              }
            });
          });
      }else{
          res.status(404).json({error: "Bad Permissions"})
      }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

router.get("/notes", async (req, res, next) => {
  try {
      if (req.session.user){
        database.client.connect(err => {
            if (err) throw err;
            database.client.db("Hattavick").collection("user_notes").find({"name":req.session.user}).toArray(function(err, result) {
              if (err) throw err;
              if(result){
                console.log("Got notes for user")
                res.status(200).json(result);
              }else{
                console.log("Could not find user notes")
                res.status(404).json({error: "Not Found"})
              }
            });
          });
      }else{
          res.status(404).json({error: "Bad Permissions"})
      }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

router.post("/notes", async (req, res, next) => {
  try {
      if (req.session.user){
        database.client.connect(err => {
          var new_note = {
            name: req.session.user,
            created: new Date(),
            last_edit: new Date(),
            title: (req.body.title) ? req.body.title : "Enter Title",
            content: (req.body.content) ? req.body.content: "Enter Content"
          }
          if (err) throw err;
          database.client.db("Hattavick").collection("user_notes").insertOne(new_note, (err, result) =>{
            if (err) throw err;
            if(result){
              console.log("Succesfully inserted note")
              res.status(200).json(result);
            }else{
              console.log("Could not insert note")
              res.status(404).json({error: result})
            }
          });
        });
      }else{
          res.status(404).json({error: "Bad Permissions"})
      }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

router.put("/notes", async (req, res, next) => {
  try {
      if (req.session.user && req.body._id){
        database.client.connect(err => {
          if (err) throw err;

          var note_find_params = {
            "_id": ObjectId(req.body._id),
            "name": req.session.user
          }

          var updated_note = {
            name: req.session.user,
            last_edit: new Date(),
            title: (req.body.title) ? req.body.title : "Enter Title",
            content: (req.body.content) ? req.body.content: "Enter Content"
          }

          console.log(updated_note)

          database.client.db("Hattavick").collection("user_notes").updateOne(note_find_params, {$set: updated_note}, (err, result) =>{
            if (err) throw err;
            if(result){
              console.log("Succesfully updated note")
              res.status(200).json(result);
            }else{
              console.log("Could not update note")
              res.status(404).json({error: result})
            }
          });
        });
      }else{
          res.status(404).json({error: "Bad Permissions"})
      }
    }catch(err) {
      console.log(err)
      res.status(500).json({error : 'Internal Server Error'});
    }
});

module.exports = router;
  