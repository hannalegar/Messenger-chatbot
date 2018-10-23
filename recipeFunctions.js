var mongoose = require("mongoose");

var db = mongoose.connect(process.env.MONGODB_URI);
var Recipe = require("./models/recipes");

exports.findRecipe = function(findBy,value, senderId){
    Recipe.findOne({ [findBy] : value }, function(err, recipe){
      if(err || recipe == null){
        return "Nem találtam ilyen receptet";
      } else {
        let ings = ""; 
  
        recipe.ingredients.forEach(function(i){
          ings += i + "," + '\n';
        });
  
        let message = recipe.title + '\n\n' +
                      "Hozzávalók: " + '\n' + ings + '\n' +
                      "Elkészítés: " + '\n' + recipe.description;  
  
        findBy = null;
        return message;
      }
    });
}