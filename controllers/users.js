var express = require('express'),
    router  = express.Router(),
    User    = require('../models/user.js');

router.get('/new', function (req, res) {
  res.render('users/new');
});

router.post('/new', function (req,res) {
  var newUser = User(req.body.user);

  newUser.save(function (err, user) {
      res.redirect(301, "/" + user._id);
  });
});

router.get('/login', function(req,res){
  res.render('users/login');
});

router.post('/login', function(req,res){
  var attempt = req.body.user;

  User.findOne({username: attempt.username}, function(err,user){
    if (user && user.password === attempt.password) {
      console.log(user);
      req.session.currentUser = user.username; // where did this lien come from
      //session video part 2
      console.log("found user come from, proceeding to the welcome screen");
      console.log(req.session);
      res.redirect(301, '/'); //is that supposed to be an ejs form-inline
      // where did this come form?
    } else {
      console.log(user);
      res.redirect(301, '/users/login');
    }

  });
});

router.get('/:id', function (req, res) {
  User.findById(req.params.id, function (err, user) {
    console.log(user);
  });
});

module.exports = router;
