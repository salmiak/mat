var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RecipeSchema = new Schema({
  title: String,
  comment: String,
  url: String,
  wpId: Number,
  votes: { type: String, default:'{}' },
  score: { type: Number, default:0 }
}, {
  timestamps: true
});

var Recipe = mongoose.model("Recipe", RecipeSchema);
module.exports = Recipe;
