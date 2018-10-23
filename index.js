var express = require("express");
var request = require("request");
var bodyParser = require("body-parser");

var mongoose = require("mongoose");

var db = mongoose.connect(process.env.MONGODB_URI);
var Recipe = require("./models/recipes");

const quickReplies = require('./quickReplies');
const recipeFunctions = require('./recipeFunctions');

var findBy;

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

      async function f(){
        let y = await sendMessage(senderId, {text: message});
      }

      f().then(quickReplies.sendFindOrCreateQuickReplies(senderId));
    });
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

function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    if(event.message.hasOwnProperty('quick_reply')){
      if(event.message.quick_reply.payload == "FIND_RECIPE"){

        quickReplies.sendFindByQuickReplies(senderId);

      } else if(event.message.quick_reply.payload == "FIND_BY_TITLE"){
        sendMessage(senderId, {text: "Kérlek add meg a recept nevét"});
        findBy = "title";

      } else if(event.message.quick_reply.payload == "FIND_BY_INGREDIENTS"){
        sendMessage(senderId, {text: "Kérlek adj meg egy hozzávalót"});
        findBy = "ingredients";

      } else if(event.message.quick_reply.payload == "FIND_BY_DESCRIPTION"){
        sendMessage(senderId, {text: "Kérlek add meg a lerást, vagy egy részét"});
        findBy = "description";
      }  
    } else if (message.text) {  
      if(findBy != null){
        let res = recipeFunctions.findRecipe(findBy, message.text, senderId);
        console.log(res);
        sendMessage(senderId, {text: res});
      } else {
        sendMessage(senderId, {text: "Megkaptam az üzeneted"});
      }

    } else if (message.attachments) {
      sendMessage(senderId, {text: "Sajnos nem tudom értelmezi az üzeneted."});
    }
  }
}