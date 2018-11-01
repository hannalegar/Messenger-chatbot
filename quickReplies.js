var request = require("request-promise");

exports.sendFindOrCreateQuickReplies = function(senderId){
    return request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
        recipient : {
            id : senderId },
        message : {
          text : "Mit szeretnél csinálni?",
          quick_replies :[
            {
              content_type :"text",
              title :"Recept keresés",
              payload : "FIND_RECIPE"
            },
            {
              content_type :"text",
              title :"Recept hozzáadása",
              payload : "CREATE_RECIPE"
            }]
        }
      }     
    });
  }

exports.sendFindByQuickReplies = function(senderId){
    return request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
        recipient : {
            id : senderId },
        message : {
          text : "Mi alapján szeretnél keresni?",
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
            }]
        }
      }
    });
  }

  exports.yesOrNo = function(senderId){
    return request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
      method: "POST",
      json : {
        recipient : {
            id : senderId },
        message : {
          text : "Ezt a receptet kerested?",
          quick_replies :[
            {
              content_type :"text",
              title :"Igen",
              payload : "YES"
            },
            {
              content_type :"text",
              title :"Nem",
              payload : "NO"
            }]
        }
      }
    });
  }
