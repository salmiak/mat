var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var MealSchema = new Schema({
  title: String,
  comment: String,
  date: Date,
  index: { type: Number, default: 0 },
  made: { type: Boolean, default: false },
  recipes: [ String ]
}, {
  timestamps: true
});

var Meal = mongoose.model("Meal", MealSchema);
module.exports = Meal;
