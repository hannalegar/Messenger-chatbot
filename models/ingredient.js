var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ingredientSchema = new Schema({
    amount: {type: String},
    measure: {type: String},
    material: {type: String}
  });
  
  module.exports = mongoose.model("Ingredient", ingredientSchema);