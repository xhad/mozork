const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
	userId: String,
	key: String, 
	secret: String
});

var model = mongoose.model('User', UserSchema, 'users');

module.exports = model;