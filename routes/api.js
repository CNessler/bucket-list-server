var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var Users = db.get('users');
var bcrypt = require('bcryptjs');

/* GET home page. */
router.post('/signup', function(req, res, next) {
  Users.find({email: req.body.email}).then(function (response) {
    if(response.length === 0){
      if(req.body.password === req.body.confirmPass){
        var crypted = bcrypt.hashSync(req.body.password, 8);
        Users.insert({userFirst: req.body.first, userLast: req.body.last, lists: req.body.lists, email: req.body.email, password: crypted}).then(function (user) {
          res.json({user: user})
        });
      }
    }
    else {
      res.json({errors: 'Invalid username / password'})
    }
  })
})

router.post('/login', function (req, res, next) {
  Users.findOne({email: req.body.email}).then(function (foundUser) {
    if(foundUser){
      if(bcrypt.compareSync(req.body.password, foundUser.password)){
        res.json({user: foundUser})
      }
    } else {
      res.json({errors: "Invalid username / password"})
    }
  })
})

router.post('/insert', function (req, res, next) {
  console.log(req.body, "THIS IS THE BODY");
  Users.update({_id: req.body._id}, {$push: {lists: {location: req.body.location, title: req.body.title, description: req.body.description, image: req.body.image}}})
})


module.exports = router;
