var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var Users = db.get('users');
var Items = db.get('items');
var bcrypt = require('bcryptjs');
var databaseQueries = require('../lib/db.js')

/* GET home page. */
router.post('/signup', function(req, res, next) {
  return databaseQueries.signup(req.body).then(function (addedUser) {
    if(addedUser){
      loggedIn = true;
      res.json({user: addedUser, loggedIn: loggedIn})
    }
    else {
      res.json({errors: 'Invalid username / password'})
    }
  })
})

router.post('/login', function (req, res, next) {
  return databaseQueries.login(req.body).then(function (foundUser) {
    if(foundUser.foundUser){
      loggedIn =  true;
      res.json({user: foundUser, loggedIn: loggedIn})
    } else {
      res.json({errors: "Invalid username / password"})
    }
  })
})

router.post('/insert', function (req, res, next) {
  Items.insert(req.body).then(function (item) {
    Users.update({_id: req.body.user}, {$push: {bucket: item._id}})
  })
})

router.post('/profile', function (req, res, next) {
  Users.update({_id: req.body._id}, {$set: {userFirst: req.body.first, userLast: req.body.last, streetAddress: req.body.streetAddress, city: req.body.city, state: req.body.state, zipcode: req.body.zipcode, private: false, bucket: req.body.bucket, email: req.body.email}})
})

router.post('/search', function (req, res, next) {
  var search = req.body.letters;
  Users.find({userFirst: {'$regex': search}}).then(function (results) {
    res.json({foundFriends: results})
  })
})

router.get('/friend', function (req, res, next) {
  var results = {}
  Users.findOne({_id: req.query.friend}).then(function (friend) {
    results.friend = friend
    return friend
  }).then(function (foundFriend) {
    return Items.find({_id: {$in: foundFriend.bucket}})
  }).then(function (foundItems) {
    results.foundItems = foundItems
    return results
  }).then(function (results) {
    console.log(results, 'should be object');
    res.json({foundFriend: results})
  })
})

router.post('/addFriend', function (req, res, next) {
  databaseQueries.addFriend(req.body);
})


router.post('/addToFriends', function (req, res, next) {
  databaseQueries.addToFriends(req.body).then(function (updatedUser) {
    res.json({user: updatedUser})
  })
})

router.post('/addLike', function (req, res, next) {
  databaseQueries.addLike(req.body).then(function (item) {
    console.log(item, 'should have more likes');
  })
})
module.exports = router;
