const _ = require('lodash')
const moment = require('moment')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const AWS = require('aws-sdk')
const path = require('path')

let app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const Recipe = require("./models/recipe");
const Meal = require("./models/meal");

const host_prod = 'mongodb://mat-user:YD22aq2obhA5x1ETRZ2D@ds123258.mlab.com:23258/mat-prod'
const host_dev = 'mongodb://mat-user:b68mclzReZqJnHksTq1D@ds161710.mlab.com:61710/mat'

let bd_host = host_prod
if (process.env.NODE_ENV === 'dev') {
  bd_host =host_dev
}

mongoose.connect(bd_host);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback){
  console.log("Connection Succeeded");
  app.listen(process.env.PORT || 8081, () => {
    console.log('listening on ' + (process.env.PORT || 8081))
  })
});


/**
  * Upload
  * - Source: https://www.netlify.com/blog/2016/11/17/serverless-file-uploads/
  */

// Test upload page directly from server
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname + '/upload.html'));
})

// Request and resturn AWS S3 upload url
app.post('/requestUploadURL', (req, res) => {
  var s3 = new AWS.S3();
  var params = req.body;

  var s3Params = {
    Bucket: 'mat-cdn',
    Key:  params.name,
    ContentType: params.type,
    ACL: 'public-read',
  };

  var uploadURL = s3.getSignedUrl('putObject', s3Params);

  res.send({
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    uploadURL: uploadURL
  })
})


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

  Meal.find(query, 'title comment date recipes index made wpId', function (error, meals) {
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
    meal.made = req.body.made,
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
    fileUrl: req.body.fileUrl,
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
  Recipe.find({}, 'title comment url fileUrl', function (error, recipes) {
    if (error) { console.error(error); }
    res.send({
      recipes: recipes
    })
  }).sort({title:1})
})

// Update a recipe
app.put('/recipes/:id', (req, res) => {
  var db = req.db;
  Recipe.findById(req.params.id, 'title comment url fileUrl', function (error, recipe) {
    if (error) { console.error(error); }

    recipe.title = req.body.title
    recipe.comment = req.body.comment
    recipe.url = req.body.url
    recipe.fileUrl = req.body.fileUrl

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

// Copy Prod to Dev database

app.get('/cloneProd2Dev', (req, res) => {

  let local_recipes, local_meals

  if (process.env.NODE_ENV !== 'dev') {
    return res.send('This only works in dev env.')
  }

  db.close()
  console.log('Closed connection with dev-host')

  let setDevData = _.after(2, () => {
    console.log('time to write')

    prodDB.close()
    console.log('Closed connection with prod-host')

    mongoose.connect(host_dev)
    let devDB = mongoose.connection
    devDB.on("error", console.error.bind(console, "connection error"));
    devDB.once("open", function(callback){
      console.log("Connection with dev-host Succeeded")

      let uploadMeals = _.after(local_recipes.length, () => {
        devDB.dropCollection("meals", (err,result) => {
          local_meals.forEach((meal) => {
            let payload = {
              title: meal.title,
              comment: meal.comment,
              date: meal.date,
              made: meal.made,
              recipes: meal.recipes,
              index: meal.index
            }
            let post = new Meal(payload)
            post.save(function (error) {
              if (error) {
                console.log(error)
              }
            })
          })

          res.send("success")
        })
      })

      devDB.dropCollection("recipes", (err,result) => {
        local_recipes.forEach((recipe) => {
          let payload = {
            title: recipe.title,
            comment: recipe.comment,
            url: recipe.url
          }
          let post = new Recipe(payload)
          post.save(function (error) {
            if (error) {
              console.log(error)
            }
            local_meals.forEach((meal) => {
              let index = meal.recipes.indexOf(recipe.id)
              if (index !== -1) {
                meal.recipes[index] = post._id
                console.log(recipe._id + ' = ' + post._id + ' updated')
              }
            })
            uploadMeals()
          })
        })
      })

    })
  })

  mongoose.connect(host_prod)
  let prodDB = mongoose.connection
  prodDB.on("error", console.error.bind(console, "connection error"));
  prodDB.once("open", function(callback){
    console.log("Connection with prod-host Succeeded")

    console.log('Getting all recipes')
    Recipe.find({}, 'title comment url', function (error, recipes) {
      if (error) { console.error(error); }
      local_recipes = recipes
      setDevData()
    }).sort({title:1})

    console.log('Getting all meals')
    Meal.find({}, 'title comment date recipes index made wpId', function (error, meals) {
      if (error) { console.error(error); }
      local_meals = meals
      setDevData()
    }).sort({_id:-1})
  });

})

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
