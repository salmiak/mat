const _ = require('lodash')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const OktaJwtVerifier = require('@okta/jwt-verifier');

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

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: 'https://dev-633272.oktapreview.com/oauth2/default',
  clientId: '0oafngul4tDd4FKLX0h7'
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
const authenticationRequired = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  if (!match) {
    return res.status(401).end();
  }

  const accessToken = match[1];

  return oktaJwtVerifier.verifyAccessToken(accessToken)
    .then((jwt) => {
      req.jwt = jwt;
      next();
    })
    .catch((err) => {
      res.status(401).send(err.message);
    });
}


/**
  * MEAL
  **/

// Create
app.post('/meals', authenticationRequired, (req, res) => {
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
app.get('/meals', authenticationRequired, (req, res) => {
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
app.put('/meals/:id', authenticationRequired, (req, res) => {
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
app.delete('/meals/:id', authenticationRequired, (req, res) => {
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
app.post('/recipes', authenticationRequired, (req, res) => {
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
      message: 'Post saved successfully!'
    })
  })
})

// Read all recipes
app.get('/recipes', authenticationRequired, (req, res) => {
  Recipe.find({}, 'title comment url', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      recipes: recipes
    })
  }).sort({title:1})
})

// Update a recipe
app.put('/recipes/:id', authenticationRequired, (req, res) => {
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
app.delete('/recipes/:id', authenticationRequired, (req, res) => {
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
app.get('/wpidmap', (req, res) => {
  var db = req.db;
  Recipe.find({}, 'title wpId', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      map: _.keyBy(recipes, 'wpId')
    })
  }).sort({_id:-1})
})

module.exports = app
