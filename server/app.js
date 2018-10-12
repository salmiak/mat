const _ = require('lodash')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

let app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const Recipe = require("./models/recipe");
const Meal = require("./models/meal");

let bd_host = 'mongodb://mat-user:YD22aq2obhA5x1ETRZ2D@ds123258.mlab.com:23258/mat-prod'
if (process.env.NODE_ENV === 'dev') {
  bd_host = 'mongodb://mat-user:b68mclzReZqJnHksTq1D@ds161710.mlab.com:61710/mat'
}

mongoose.connect(bd_host);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback){
  console.log("Connection Succeeded");
  app.listen(process.env.PORT || 8081, () => {
    console.log('listening on ' + (process.env.PORT || 8081))
  })
});


/**
  * MEAL
  **/

// Create
app.post('/meals', (req, res) => {
  var db = req.db;

  var payload = {
    title: req.body.title,
    comment: req.body.comment,
    date: req.body.date,
    recipes: req.body.recipes,
    index: req.body.index,
    wpId: req.body.wpId
  }

  var new_meal = new Meal(payload)

  new_meal.save(function (error, meal) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!',
      meal: new_meal
    })
  })
})

// Read all meals
app.get('/meals', (req, res) => {
  var query = {}
  if(req.query.week && req.query.year) {

    var startDate = moment().set('year',req.query.year).isoWeek(req.query.week).startOf('isoWeek').toDate()
    var endDate = moment().set('year',req.query.year).isoWeek(req.query.week).add(1,'w').startOf('isoWeek').toDate()

    query.date = {
      $gte: startDate,
      $lte: endDate
    }
  }

  Meal.find(query, 'title comment date recipes index made vote wpId', function (error, meals) {
    if (error) { console.error(error); }
    res.send({
      meals: _.orderBy(meals, ['date','index'], ['desc','asc'])
    })
  }).sort({_id:-1})
})

// Update a meal
app.put('/meals/:id', (req, res) => {
  var db = req.db;
  Meal.findById(req.params.id, 'title comment date recipes index made wpId', function (error, meal) {
    if (error) { console.error(error); }

    meal.title = req.body.title
    meal.comment = req.body.comment
    meal.date = req.body.date
    meal.recipes = req.body.recipes
    meal.index = req.body.index
    meal.made = req.body.made
    meal.vote = req.body.vote
    meal.wpId = req.body.wpId

    meal.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true,
        meal: meal
      })
    })
  })
})

// Delete a post
app.delete('/meals/:id', (req, res) => {
  var db = req.db;
  Meal.remove({
    _id: req.params.id
  }, function(err, post){
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})


/**
  * RECIPE
  **/

// Create
app.post('/recipes', (req, res) => {
  var db = req.db;

  var payload = {
    title: req.body.title,
    comment: req.body.comment,
    url: req.body.url,
    wpId: req.body.wpId
  }

  var new_post = new Recipe(payload)

  new_post.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!',
      recipe: new_post
    })
  })
})

// Read all recipes
app.get('/recipes', (req, res) => {
  Recipe.find({}, 'title comment url score votes', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      recipes: recipes
    })
  }).sort({title:1})
})

// Update a recipe
app.put('/recipes/:id', (req, res) => {
  var db = req.db;
  Recipe.findById(req.params.id, 'title comment url', function (error, recipe) {
    if (error) { console.error(error); }

    recipe.title = req.body.title || recipe.title
    recipe.comment = req.body.comment || recipe.comment
    recipe.url = req.body.url || recipe.url
    recipe.votes = req.body.votes || recipe.votes
    recipe.score = req.body.score !== undefined ? req.body.score : recipe.score

    recipe.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true,
        recipe: recipe
      })
    })
  })
})

// Delete a post
app.delete('/recipes/:id', (req, res) => {
  var db = req.db;
  Recipe.remove({
    _id: req.params.id
  }, function(err, post){
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})

/**
  * UTILS
  */

// Map over wpId and _id
app.get('/recipes/wpidmap', (req, res) => {
  var db = req.db;
  Recipe.find({}, 'title wpId', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      map: _.keyBy(recipes, 'wpId')
    })
  }).sort({_id:-1})
})

// Map over wpId and _id
app.get('/meals/wpidmap', (req, res) => {
  var db = req.db;
  Meal.find({}, 'title wpId', function (error, meals) {
    if (error) { console.error(error); }
    res.send({
      map: _.keyBy(meals, 'wpId')
    })
  }).sort({_id:-1})
})

module.exports = app
