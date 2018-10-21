var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var db = mongoose.connect(process.env.MONGODB_URI);
var Recipe = require("./models/recipes");

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 5000));

// Server index page
app.get("/", function (req, res) {
  res.send("Deployed!");
});

// Facebook Webhook
// Used for verification
app.get("/webhook", function (req, res) {
  if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
    console.log("Verified webhook");
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Verification failed. The tokens do not match.");
    res.sendStatus(403);
  }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
  // Make sure this is a page subscription
  if (req.body.object == "page") {
    // Iterate over each entry
    // There may be multiple entries if batched
    req.body.entry.forEach(function(entry) {
      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
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

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === "Greeting") {
    // Get user's first name from the User Profile API
    // and include it in the greeting
    request({
      url: "https://graph.facebook.com/v2.6/" + senderId,
      qs: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
        fields: "first_name"
      },
      method: "GET"
    }, function(error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " +  error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hello " + name + ". ";
      }
      var message = greeting;
      sendMessage(senderId, {text: message});
    });
  } else if (payload === "Correct") {
    sendMessage(senderId, {text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."});
  } else if (payload === "Incorrect") {
    sendMessage(senderId, {text: "Oops! Sorry about that. Try using the exact title of the movie"});
  }
}

// sends message to user
function sendMessage(recipientId, message) {
  request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: "POST",
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log("Error sending message: " + response.error);
    }
  });
}

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

function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;
    setTypingIndicatorOn(senderId);

    console.log("Received message from senderId: " + senderId);
    console.log("Message is: " + JSON.stringify(message));

    // You may get a text or attachment but not both
    if (message.text) {
      
      sendMessage(senderId, {text: "Megkaptam az üzeneted!"});
      //process if find a recipe. or create a new one

      //example of how to create a recipe
      /*
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
      */

      //example of find a recipe and sen a response
      /*
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
      */

      
      setTypingIndicatorOff(senderId);
    } else if (message.attachments) {
      
      setTypingIndicatorOff(senderId);
      sendMessage(senderId, {text: "Sorry, I don't understand your request."});
    }
  }
}