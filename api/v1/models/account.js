const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var AccountSchema = new Schema({
	userId: String,
	password: String, 
	account: String,
	currency: String,
});

var model = mongoose.model('Account', AccountSchema, 'accounts');

module.exports = model;