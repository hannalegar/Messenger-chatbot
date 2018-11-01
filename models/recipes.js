var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
    user_id: {type: String},
    title: {type: String},
    ingredients: {type: []},
    description: {type: String}
  });
  
  module.exports = mongoose.model("Recipe", RecipeSchema);