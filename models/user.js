var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
});

var User = mongoose.model("User", userSchema);

module.exports = User;
