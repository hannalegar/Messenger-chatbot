var request = require("request");

exports.sendFindOrCreateQuickReplies = function(event){
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
        "object": "page",
        "entry": [
          {
            "id": 372924409900493,
            "time": event.timestamp,
            "messaging": [
              {
                "sender": {
                  "id": event.sender.id
                },
                "recipient": {
                  "id": 372924409900493
                },
                "timestamp": event.timestamp,
                "message": {
                  "quick_reply": {
                    "payload": "RED"
                  },
                  "text": "Red"
                }
              }
            ]
          }
        ]
      }
    });
  }

exports.sendFindByQuickReplies = function(senderId){
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
        recipient : {
            id : senderId },
        message : {
          text : "Mit alapján szeretnél keresni?",
          quick_replies :[
            {
              content_type :"text",
              title :"Név",
              payload : "FIND_BY_TITLE"
            },
            {
              content_type :"text",
              title :"Hozzávalók",
              payload : "FIND_BY_INGREDIENTS"
            },
            {
              content_type :"text",
              title :"Leírás",
              payload : "FIND_BY_DESCRIPTION"
            }]
        }
      }
    });
  }