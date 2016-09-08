const mongoose = require('mongoose');


var Database = function(database) {
	console.log('connected to database');
	mongoose.connect('mongodb://localhost:27017/' + database);
}

module.exports = Database;