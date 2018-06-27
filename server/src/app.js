const _ = require('lodash')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const Post = require("../models/post");
const Recipe = require("../models/recipe");
const Meal = require("../models/meal");

mongoose.connect('mongodb://mat-user:b68mclzReZqJnHksTq1D@ds161710.mlab.com:61710/mat');
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
    index: req.body.index
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

  Meal.find(query, 'title comment date recipes index made', function (error, meals) {
    if (error) { console.error(error); }
    res.send({
      meals: _.orderBy(meals, ['date','index'], ['desc','asc'])
    })
  }).sort({_id:-1})
})

// Update a meal
app.put('/meals/:id', (req, res) => {
  var db = req.db;
  Meal.findById(req.params.id, 'title comment date recipes index made', function (error, meal) {
    if (error) { console.error(error); }

    meal.title = req.body.title
    meal.comment = req.body.comment
    meal.date = req.body.date
    meal.recipes = req.body.recipes
    meal.index = req.body.index
    meal.made = req.body.made

    meal.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
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
    url: req.body.url
  }

  var new_post = new Recipe(payload)

  new_post.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Read all recipes
app.get('/recipes', (req, res) => {
  Recipe.find({}, 'title comment url', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      recipes: recipes
    })
  }).sort({_id:-1})
})

// Update a recipe
app.put('/recipes/:id', (req, res) => {
  var db = req.db;
  Recipe.findById(req.params.id, 'title comment url', function (error, recipe) {
    if (error) { console.error(error); }

    recipe.title = req.body.title
    recipe.comment = req.body.comment
    recipe.url = req.body.url

    recipe.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
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
  * POST
  **/

// Creat new post
app.post('/posts', (req, res) => {
  var db = req.db;
  var title = req.body.title;
  var description = req.body.description;
  var new_post = new Post({
    title: title,
    description: description
  })

  new_post.save(function (error) {
    if (error) {
      console.log(error)
    }
    res.send({
      success: true,
      message: 'Post saved successfully!'
    })
  })
})

// Read all posts
app.get('/posts', (req, res) => {
  Post.find({}, 'title description', function (error, posts) {
    if (error) { console.error(error); }
    res.send({
      posts: posts
    })
  }).sort({_id:-1})
})

// Read single post
app.get('/post/:id', (req, res) => {
  var db = req.db;
  Post.findById(req.params.id, 'title description', function (error, post) {
    if (error) { console.error(error); }
    res.send(post)
  })
})

// Update a post
app.put('/posts/:id', (req, res) => {
  var db = req.db;
  Post.findById(req.params.id, 'title description', function (error, post) {
    if (error) { console.error(error); }

    post.title = req.body.title
    post.description = req.body.description
    post.save(function (error) {
      if (error) {
        console.log(error)
      }
      res.send({
        success: true
      })
    })
  })
})

// Delete a post
app.delete('/posts/:id', (req, res) => {
  var db = req.db;
  Post.remove({
    _id: req.params.id
  }, function(err, post){
    if (err)
      res.send(err)
    res.send({
      success: true
    })
  })
})
