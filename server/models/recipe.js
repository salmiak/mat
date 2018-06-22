var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  title: String,
  comment: String,
  url: String
}, {
  timestamps: true
});

var Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
