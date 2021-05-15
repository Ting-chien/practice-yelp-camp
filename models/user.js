const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});
// 使用 passport-local-mongoose 來自動為 userSchema 加入 username, password
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);