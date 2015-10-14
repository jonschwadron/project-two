var express           = require('express'),
    server            = express(),
    morgan            = require('morgan'),
    ejs               = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    bodyParser        = require('body-parser'),
    methodOverride    = require('method-override'),
    mongoose          = require('mongoose'),
    session           = require('express-session');

mongoose.connect('mongodb://localhost:27017/project-two');

var Comment = mongoose.model("comment", {
  author: String,
  content: { type: String, maxlength: 140 }
});

server.set('view engine', 'ejs');
server.set('views', './views');

server.use(session({
  secret: "soeufnNYnefov8495",
  resave: true,
  saveUninitialized: true
}));

server.use(morgan('dev'));
server.use(express.static('./public'));
server.use(expressEjsLayouts);
server.use(methodOverride('_method'));
// forms posting to "/action?_method=SOMETHING"

server.use(bodyParser.urlencoded({ extended: true }));

server.use(function (req, res, next) {
  console.log("REQ DOT BODY", req.body);
  console.log("REQ DOT SESSION", req.session);

  next();
});

var userController = require('./controllers/users.js');
server.use('/users', userController);

//catch all routes
server.use(function (req, res, next) {
  res.send("Your JOURNEY ends HERE, GRASShopper.");
  //JOURNY, HERE, GRASS <--- why the emphasis on these?
  res.end();
})

server.get('/', function (req, res) {
  res.locals.author = undefined;
  res.render('welcome');
});

server.post('/welcome', function (req, res) {
  req.session.authorName = req.body.authorName;
  res.redirect(302, '/comments')
});

server.use(function (req, res, next) {
  if (req.session.authorName == undefined) {
    res.redirect(302, '/welcome')
  } else {
    res.locals.author = req.session.authorName;
    next();
  }
})

/* comment based routes */

server.get('/comments', function (req, res) {
  Comment.find({}, function (err, allComments) {
    if (err) {
      res.redirect(302, '/welcome');
    } else {
      res.render('comments/index', {
        comments: allComments
      });
    }
  });
});

server.post('/comments', function (req, res) {
  var comment = new Comment({
    author: req.session.authorName,
    content: req.body.comment.content
  });

  comment.save(function (err, newTweet) {
    if (err) {
      console.log("Comment rejected");
      res.redirect(302, '/comments/new');
    } else {
      console.log("New comment saved!");
      res.redirect(302, '/comments');
    }
  });
});

server.get('/comments/:id/edit', function (req, res) {
  var commentID = req.params.id;

  Comment.findOne({
    _id: commentID
  }, function (err, foundComment) {
    if (err) {
      res.write("YOUR COMMENT ID IS BAD");
      res.end();
    } else {
      res.render('comments/edit', {
        comment: foundComment
      });
    }
  });
});

server.patch('/comment/:id', function (req, res) {
  var commentID = req.params.id;
  var commentParams = req.body.comment;

  Comment.findOne({
    _id: commentID
  }, function (err, foundComment) {
    if (err) {
console.log("NOT FOUND");
    } else {
      foundComment.update(commentParams, function (errTwo, comment) {
        if (errTwo) {
          console.log("ERROR UPDATING");
        } else {
          console.log("UPDATED!");
          res.redirect(302, "/comments");
        }
      });
    }
  });
});

server.delete('/comments/:id', function (req, res) {
  var commentID = req.params.id;

  Comment.remove({
    _id: commentID
  }, function (err) {
    if (err) {

    } else {
      res.redirect(302, '/comments');
    }
  });
});

server.get('/comments/new', function (req, res) {
  res.render('comments/new');
});

server.get('/authors/:name', function (req, res) {
  var authorName = req.params.name;

  Comment.find({
    author: authorName
  }, function (err, authorComments) {
    if (err) {

    } else {
      res.render('authors/comments', {
        author: authorName,
        comments: authorComments
      });
    }
  });
});

server.listen(3000, function () {
  console.log("Server running on port 3000");
});
