///>>> MOZORK Ethereum API

var express = require('express');
var app = express();

//>> Versioning, calls a specific api version
app.use('/api/v1', require('./v1/apiV1.js'));

var port = process.env.PORT || 8080;

app.listen(port, function() {
	console.log('>>>>\x1b[36m Mozork is listening on ' + port);
});
