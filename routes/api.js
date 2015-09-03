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
        Users.insert({user: req.body.name, email: req.body.email, password: crypted}).then(function (user) {
          res.json({user: user})
        });
      }
    }
    else {
      res.json({error: 'Invalid username / password'})
    }
  })
})

router.post('/login', function (req, res, next) {
  console.log(req.body.password, 'BODY');
  Users.findOne({email: req.body.email}).then(function (foundUser) {
  console.log(foundUser.password);
    if(foundUser){
        console.log(bcrypt.compareSync(req.body.password, foundUser.password));
      if(bcrypt.compareSync(req.body.password, foundUser.password)){
        console.log('user found and password matches');
        res.json({user: foundUser})
      }
    }
    else {
      res.json({error: "Invalid username / password"})
    }
  })
})
  // })
  // check database for existing user
  // if found, respond with error res.json({ error: true })
  // else pass the user to a create function and create an account
  // upon success, return the new user object to client

module.exports = router;
