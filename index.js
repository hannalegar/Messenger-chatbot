var express = require("express");
var request = require("request-promise");
var bodyParser = require("body-parser");

var mongoose = require("mongoose");
var db = mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
var Recipe = require("./models/recipes");

const quickReplies = require('./quickReplies');

var findBy;

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
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
    req.body.entry.forEach(function (entry) {
      // Iterate over each messaging event
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
    }, function (error, response, body) {
      var greeting = "";
      if (error) {
        console.log("Error getting user's name: " + error);
      } else {
        var bodyObj = JSON.parse(body);
        name = bodyObj.first_name;
        greeting = "Hello " + name + ". 🙂";
      }
      var message = greeting;

      sendMessage(senderId, { text: message })
        .then(() => { return quickReplies.sendFindOrCreateQuickReplies(senderId) });
    });
  } else {
    processPayload(payload, senderId);
  }
}

// sends message to user
function sendMessage(recipientId, message) {
  return request({
    url: "https://graph.facebook.com/v2.6/me/messages",
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: "POST",
    json: {
      recipient: { id: recipientId },
      message: message,
    }
  });
}

function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    if (event.message.hasOwnProperty('quick_reply')) {
      processPayload(event.message.quick_reply.payload, senderId);
    } else if (message.text) {
      if (findBy) {
        findRecipe(message.text, senderId)
          .then(() => { quickReplies.yesOrNo(senderId) });
      } else {
        sendMessage(senderId, { text: "Megkaptam az üzeneted." });
      }

    } else if (message.attachments) {
      sendMessage(senderId, { text: "Sajnos nem tudom értelmezi az üzeneted." });
    }
  }
}

function processPayload(payload, senderId) {
  switch (payload) {
    case "FIND_RECIPE":
      quickReplies.sendFindByQuickReplies(senderId);
      break;
    case "FIND_BY_TITLE":
      sendMessage(senderId, { text: "Kérlek add meg a recept nevét" });
      findBy = "title";
      break;
    case "FIND_BY_INGREDIENTS":
      sendMessage(senderId, { text: "Kérlek adj meg egy hozzávalót" });
      findBy = "ingredients";
      break;
    case "YES":
      sendMessage(senderId, { text: "Jó főzicskélést!" });
      break;
    case "NO":
      sendMessage(senderId, { text: "Kérsz másik receptet?" });
      // ki kell találni mi legyen
      break;
  }
}

async function findRecipe(value, senderId) {
  return await Recipe.findOne({ [findBy]: value }, function (err, recipe) {
    if (err || recipe === null) {
      return sendMessage(senderId, { text: "Nem találtam ilyen receptet" });
    } else {
      let ings = "";

      recipe.ingredients.forEach(function (i) {
        ings += i + "," + '\n';
      });

      let message = recipe.title + '\n\n' +
        "Hozzávalók: " + '\n' + ings + '\n' +
        "Elkészítés: " + '\n' + recipe.description;


      findBy = undefined;
      return sendMessage(senderId, { text: message });
    }
  });
}