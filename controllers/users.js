var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js');

router.get('/new', function (req, res) {
  res.render('users/new');
});

router.post('/new', function (req,res) {
  var newUser = User(req.body.user);

  newUser.save(function (err, user) {
      res.redirect(301, "/users/" + user._id);
  });
});

router.get('/login', function(req,res){
  res.render('users/login');
});

router.post('/login', function(req,res){
  var attempt = req.body.user;

  User.findOne({username: attempt.username}, function(err,user){
    if (user && user.password === attempt.password) {
      req.session.currentUser = user.username;

      res.redirect(301, "Welcome");
    } else {
      console.log(user);
    }

  });
});

router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    console.log(user);
  });
});

module.exports = router;
