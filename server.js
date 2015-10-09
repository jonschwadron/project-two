var express     = require('express'),
    PORT        = process.env.PORT || 5432,
    server      = express(),
    MONGOURI    = process.env.MONGOLAB_URI || "mongodb://localhost:27017",
    dbname      = "db-cave",
    mongoose    = require('mongoose');

server.get('/man-cave', function (req, res) {
  res.write("Welcome to my amazing app");
  res.end();
});

mongoose.connect(MONGOURI + "/" + dbname);

server.listen(PORT, function() {
  console.log("SERVER IS UP ON PORT:", PORT);
});
