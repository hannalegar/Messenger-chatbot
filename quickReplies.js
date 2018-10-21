var request = require("request");

exports.sendFindOrCreateQuickReplies = function(senderId){
    request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
            sender: {
              "id": senderId
            },
            recipient : {
              "id": 372924409900493
            },
            timestamp : 1464990849275,
            message : {
              mid : "mid.1464990849238:b9a22a2bcb1de31773",
              text: "Red",
              quick_reply: {
                content_type :"text",
                title :"piros",
                payload : "RED"
              }
            }
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