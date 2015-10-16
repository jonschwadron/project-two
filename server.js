var express           = require('express'),
    server            = express(),
    morgan            = require('morgan'),
    ejs               = require('ejs'),
    expressEjsLayouts = require('express-ejs-layouts'),
    bodyParser        = require('body-parser'),
    methodOverride    = require('method-override'),
    mongoose          = require('mongoose'),
    session           = require('express-session');

// mongoose.connect('mongodb://localhost:27017/project-two');

var PORT = process.env.PORT || 3000,
    MONGOURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017',
    dbname = "project-two";

mongoose.connect(MONGOURI + "/" + dbname);

var Comment = mongoose.model("comment", {
  author: String,
  content: { type: String, maxlength: 140 },
  replies: [{ replymessage: String,
              date: { type: Date,
                      default: Date.now },
              author: String
           }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  upvote: {type: Number, default: 0}
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

server.use(function(req, res, next) { // MEGA LOGGER
  console.log("=========== BEGIN LOGGER ===========");
  console.log("req.body:   ", req.body);
  console.log("req.query:  ", req.query);
  console.log("req.params: ", req.params);
  console.log("===========  END LOGGER  ===========");
  next();
});

var userController = require('./controllers/users.js');
server.use('/users', userController);

server.use(function (req, res, next) {
  if (req.session.currentUser == undefined) {
    res.redirect(302, '/users/login')
  } else {
    res.locals.currentUser = req.session.currentUser;
    next();
  }
});

// server.get('/welcome', function (req, res) {
//   if (req.session.currentUser) {
//     res.render('welcome', {
//       currentUser: req.session.currentUser
//     });
//   } else {
//     res.redirect(301, '/user/login')
//   }
// });

server.get('/', function (req, res) {
  res.redirect(302, 'comments')
});

server.get('/logout', function (req, res) {
  req.session.destroy(function(){
      res.redirect(302, '/');
    });
});

/* comment based routes */
server.get('/comments', function (req, res) {
  Comment.find({}, function (err, allComments) {
    if (err) {
      res.redirect(302, '/');
    } else {
      res.render('comments/index', {
        comments: allComments,

      });
    }
  });
});



server.post('/comments/:id/reply', function (req, res) {
  // fetch the comment by this id, set it to comment
  // create reply object
  // push reply object into comment
  // save comment into db
  // i know the problem now. lol
  var commentID = req.params.id;
  console.log(req.body.comment.replymessage);
  Comment.findByIdAndUpdate(
    commentID,
    {$push: {"replies": { "author": req.session.currentUser, "replymessage": req.body.comment.replymessage }}},
    function(err, newComment){
    if(err){
      console.log("bad comment id");
      res.redirect(302, '/comments/' + commentID + 'reply')
    }else {
      console.log(newComment);
      res.redirect(302, '/comments/' + commentID);
    }
  });
});

//catch all routes
// server.use(function (req, res, next) {
//   res.send("Your JOURNEY ends HERE, GRASShopper.");
//   //JOURNY, HERE, GRASS <--- why the emphasis on these?
//   res.end();
// })

// server.post('/welcome', function (req, res) {
//   req.session.authorName = req.body.authorName;
//   res.redirect(302, '/comments')
// });

// server.patch('/comments/:id/upvote', function (req, res) {
//   var commentID = req.params.id;
//
//
//   console.log("yessss");
//   Comment.findOne({
//     _id: commentID
//   }, function (err, upVoteUpdate) {
//     if (err) {
//       console.log("bad id");
//     } else {
//       console.log("about to upvote " + upVoteUpdate);
//       upVoteUpdate.upvote.$inc;
//       upVoteUpdate.save();
//       // need to redirect to same page as it was before?
//       res.redirect(302, '/comments/' + commentID);
//     }
//   });
// });

server.patch('/comments/:id/upvote', function (req, res) {
  var commentID = req.params.id;

  Comment.findByIdAndUpdate(
    commentID,
    { $inc: { upvote: 1 } },
    function (err, upVoteUpdate) {
      if (err) {
        console.log("bad id");
      } else {
        res.redirect(302, '/comments/');
      }
  });
});

server.post('/comments', function (req, res) {
  var currentDate = Date();
  var comment = new Comment({
    author: req.session.currentUser,
    content: req.body.comment.content
  });

  comment.save(function (err, newComment) {
    if (err) {
      console.log("Comment rejected");
      res.redirect(302, '/comments/new');
    } else {
      console.log("New comment saved!");
      res.redirect(302, '/comments/');
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

server.get('/comments/:id/reply', function (req, res) {
  res.render('comments/reply', {
    // here you pass the request parameter id to reply.ejs as commentId
    commentId: req.params.id
  }); //opens reply.ejs

});

server.get('/comments/:id', function (req, res) {
  var selectComment = req.params.id;
  // var allTheReplies = req.
  Comment.findOne({
    _id: selectComment
  }, function (err, specificComment) {
    if (err) {

    } else {
      console.log("displaying: "+specificComment.replies);
      // console.log("is it string?" + typeof specificComment !== "string");
      res.render('comments/show', {
        comment: specificComment
      });
    }
  });
  // whats the diff between render and redirect? think it might be important
  //redirect just take you to the ejs page
  //render displays the view with data passed to it
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



server.listen(PORT, function () {
  console.log("Server running on port 3000");
});
