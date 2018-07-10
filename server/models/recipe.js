var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  title: String,
  comment: String,
  url: String,
  wpId: Number
}, {
  timestamps: true
});

var Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;