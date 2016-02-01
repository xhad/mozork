///>>> MOZORK API V1

var express = require('express');
var Web3 = require('web3');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var router = express.Router();

//>> API version check

router.use(function(req, res, next) {
   res._json = res.json;
   res.json = function json(obj) {
      obj.APIversion = 1;
      res._json(obj);
   };
   next();
});

//>> Use morgan to console log 
router.use(morgan('combined'));

//>> Parsing with Body Parser
router.use(bodyParser.urlencoded({
   extended: true
}));


router.use(bodyParser.json());


//>> Setup a connection to Etheruem Client with Web3

if (typeof web3 !== 'undefined') {
   web3 = new Web3(web3.currentProvider);
} else { 
   // connect to Ethereum RPC client running locally
   web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
};

//>> Routes

// get the balance of the Ehteruem ?address=
router.get('/balance', function(req, res) {
	var addr = req.query.address;
	console.log(addr);
	if (addr !== 'undefined') {
		if (addr.substring(0,2) == '0x'){
			res.json({
				status: "success",
				balance: web3.eth.getBalance(addr)
			});

		} else {
			res.json({
				status: "failed",
				message: "Please check the address"
			});
		}

	} else {
		res.json({
			status: "failed",
			message: "Cannot recognize this address"
		});
	};

   // web3 get the balance of the req address
});

// Generate a new Ethereum Wallet
router.get('/generate', function(req, res) {

   // web3 generate a new balance
   res.send('new coinbase');
});


// Get the transaction history of the requested address
router.get('/history', function(req, res) {


   //web3 get the history of the coinbase
   res.send('history');
});

// Send a transaction
router.get('/send', function(req, res) {

   //web3 send the transaction
   res.send('history');
});


//>> Process all routes, return failed if route is bad
router.get('*', function(req, res) {
   res.status = 404;
   res.json({
      success: false,
      message: "Mozork can\'t handle this"
   });
});


//>> Export 
module.exports = router;

