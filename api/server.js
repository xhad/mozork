///>>> MOZORK Ethereum API

const express = require('express');
const app = express();

//>> Versioning, calls a specific api version
app.use('/api/v1', require('./v1/api.js'));

var port = process.env.PORT || 8765;

app.listen(port, function() {
	console.log('>>>>\x1b[36m Mozork is listening on ' + port);
});
