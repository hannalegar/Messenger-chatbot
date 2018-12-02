var express = require("express");
var request = require("request-promise");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

app.get("/", function (req, res) {
  res.send("Deployed!");
});

app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

app.post("/webhook", function (req, res) {
  if (req.body.object == "page") {
    req.body.entry.forEach(function (entry) {
      entry.messaging.forEach(function (event) {
        if (event.postback) {
          processPostback(event);
        } else if (event.message) {
          processMessage(event);
        }
      });
    });

    res.sendStatus(200);
  }
});


//set typing indicator

function setTypingIndicatorOn(recipientId) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {
        id: recipientId
      },
      sender_action: "typing_on"
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error set typing indicator" + response.error);
    }
  });
}

function setTypingIndicatorOff(recipientId) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {
        id: recipientId
      },
      sender_action: "typing_off"
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error set typing indicator" + response.error);
    }
  });
}

 //example of how to create a recipe
      
      Recipe.create(
        { user_id : senderId,
          title : "title",
          ingredients : ["ing1", "ing2", "ing3"],
          description : "desc"
        }, function (err, recipe){
        var errmessage = {};
        if (err) {
          sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        } else {
          sendMessage(senderId, {text: "Elmentettem a receptet"});
        }
      });
      
      //example of find a recipe and sen a response
      
      Recipe.findOne({ ingredients: message.text }, function(err, recipe){
        if(err || recipe == null){
          console.log("nem talált ilyen receptet");
          sendMessage(senderId, {text : "Nem találtam ilyen receptet"});
        } else {
          let ings = ""; 

          recipe.ingredients.forEach(function(i){
            ings += i + "," + '\n';
          });

          let message = recipe.title + '\n\n' +
                        "Hozzávalók: " + '\n' + ings + '\n' +
                        "Elkészítés: " + '\n' + recipe.description;  

          sendMessage(senderId, {text: message});
        }
      });


      // káááááááááááááááááááosz

function waitFor(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

async function processIngredients(text) {
  let splittedText = text.split(",");
  let ingredient = { amount: "", measure: "", material: "" };
  let ingredients = [];

  async function start() {
    await asyncForEach(splittedText, async (item) => {

      ingredient.amount = item.match(/\d+/)[0];
      ingredient.measure = item.match(/(?:dl|dkg|kg|db|darab|egész|fél)/)[0];
      ingredient.material = item.match(/.*(?:kg|dk|cl)+\s+?(.*$)/)[1];

      createIngredient(ingredient)
        .then((res) => ingredients.push(res));
      await waitFor(200);
    })
    console.log('Done')
  }

  await start();

  return ingredients;
}

async function createIngredient(ing) {
  return await Ingredient.create({
    amount: ing.amount,
    measure: ing.measure,
    material: ing.material
  });
}

// káááááááááááááááááááosz

