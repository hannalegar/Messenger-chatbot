exports.sendQuickReplies = function(senderId){
    request({
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