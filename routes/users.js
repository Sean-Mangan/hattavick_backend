const serverless = require("serverless-http");
const express = require("express");
const router = express.Router();
const database = require('../database/database');

router.post("/login", (req, res, next) => {
  console.log("USER REQUEST", req.body)
  if(req.session.user){
    console.log("already logged in")
    res.status(200).json({"name": req.session.user});
  }else{
    if (req.body.name){
      database.client.connect(err => {
        database.client.db("Hattavick").collection("user_data").findOne(req.body, (err,result) => {
          try {
            console.log(req.session.user)
            if (err) throw err
            if (result) {
              req.session.user = result.name
              res.cookie("hattavick_user", result.name, { maxAge: 172800000, httpOnly: true, sameSite: "None", secure:true}).status(200).json(result);
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

router.get("/homepage", (req, res, next) => {
  return res.status(200).json({
    message: "From a distance, Hattavick looks little like a city, more akin to a natural wonder. A humongous plateau towers over the ground at nearly 1,000 feet tall, dwarfing even the tallest of trees that surround the city. The plateau itself is nearly a mile in diameter with a small inlet on the South side where a waterfall can be first heard and then seen. At a distance this may only be what any onlookers observe, a tremendous and mysterious natural wonder, standing tall over the horizon and clouds obscure the top of the tower. Only on days of clear weather can those on the ground be blessed with the true view of the city. The towers hundreds of feet in the air, the air ships circling the plateau, the open elevators and pulley systems carrying the city's inhabitants to their destinations. Even from the ground, even from a mile away, the city’s pulse demands to be recognized. The sound of steam and the smell of forged iron can be felt from miles in every direction. The city itself is both beautiful and its inhabitants are incredibly industrious. Hundreds of buildings scatter the skyline, lights illuminate the plateau like a torch in the night. Ancient steam geysers rest at the center of the plateau, whose eruptions power colossal heaters and condensers, generating steam power that is then distributed throughout the city in copper pipes nearly 10 feet in diameter. The excess water forms a small river that winds and twists throughout the city before falling off the plateau creating a brilliant waterfall that turns to mist before it can reach the ground. The river’s water is colored an unnaturally vibrant blue-green that lights in the night, turning midnight walks along its bank into a romantic affair. As the years have gone by and more and more people become displaced as a result of the ongoing conflict surrounding the city, it has become harder and harder to find passage to the town. Airship boarding passes and papers of entry are being sold for hundreds of gold on the black market. Shanty towns have been steadily growing around the plateau and dozens of folks die every year attempting to scale the city’s walls. However those in the city remain blissfully unaware of this fact as they enjoy a life in the clouds, taking nightly strolls along the blue-green river phosphorescence, enjoying the public libraries and perhaps most decadent of all, indoor plumbing. We begin our story in Burnstown, a small town on the outskirts of Hattavick where many hopeful immigrants have made their temporary home, a home made more permanent every passing year as papers of entry become increasingly hard to get. This is the state of Hattavick as we begin our story, the secrets of the city have yet to be unearthed.
",
  });
});

module.exports = router;
  