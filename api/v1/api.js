///>>> MOZORK API V1
///>>> Ethereum Go-Client API
///>>> Written by Chad Lynch
///>>> Copyright, MIT. 2016
///>>> DO NOT EXPOSE TO INTERNET
///>>> INTERNAL MICRO SERVICE

const express = require('express');
const Web3 = require('web3');
const morgan = require('morgan');
const expressSanitizer = require('express-sanitizer');
const bodyParser = require('body-parser');
const router = express.Router();
const Auth = require('./lib/auth');
const Accounts = require('./lib/account');
const bcrypt = require('bcrypt-nodejs');
const Promsie = require('bluebird');
const Database = require('./lib/db');


//>> API version

router.use(function(req, res, next) {
   res._json = res.json;
   res.json = function json(obj) {
      obj.MozorkVersion = 1;
      res._json(obj);
   };
   next();
});

//>> Instantiate Libraries
const auth = new Auth();
const account = new Accounts();

//>> Mongo Database
//>> https://docs.mongodb.com/manual/security/
var db = new Database('test');

//>> Use morgan to console log 
router.use(morgan('combined'));

//>> Parsing with Body Parser
router.use(bodyParser.urlencoded({
   extended: true
}));
router.use(bodyParser.json());

//>> Redundant Sanitization 
router.use(expressSanitizer([]));


//>> Setup a connection to Etheruem Client with Web3
//>> https://bounty.ethereum.org/ (Security First!)
//>> geth --datadir=/to/data -rpc 
//>> -rpccorsdomain "MOZORK vm IP" -rpcapi 
//>> "web3, eth, db, net, personal"

if (typeof web3 !== 'undefined') {
   web3 = new Web3(web3.currentProvider);
} else {
   // connect to Ethereum RPC client running locally
   web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
};

//>> Authless Routes

// get gas price for sending transactions
router.get('/gasprice', (req, res) => {
   let gasPrice = web3.eth.gasPrice;
   res.json({
      status: "success",
      gasprice: gasPrice,
      in : "wei"
   })
})

// get the block info
router.get('/getblock/:block', (req, res) => {
   let param = req.sanitize(req.params.block);
   let block = web3.eth.getBlock(param);

   if (block) {
      res.json({
         status: "success",
         data: block
      })
   } else {
      res.json({
         status: "fail",
         message: "failed to get block " + req.params.block
      })
   }
});


// get the balance of the Etheruem address
router.get('/balance/:address', (req, res) => {
   if (req.params.address) {
      let addr = req.sanitize(req.params.address);
      let bal = web3.eth.getBalance(addr);

      if (addr.substring(0, 2) == '0x') {
         res.json({
            status: "success",
            balance: bal

         });

      } else {
         res.json({
            status: false,
            message: "Please check the address"
         });
      }

   } else {
      res.json({
         status: false,
         message: "Cannot recognize this address"
      });
   };
});

//>> Authed Routes

// Send a transaction /ethtransaction
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret
//       amount: "amount_of_eth", from: "ETH_addr", 
//       to: "To_eth_addr", password: "sender_address_password"}
router.post('/ethtransaction', (req, res, next) => {
   if (req.body.from &&
      req.body.to &&
      req.body.amount &&
      req.body.password &&
      req.body.userId &&
      req.body.key &&
      req.body.secret) {

      let from = req.sanitize(req.body.from);
      let to = req.sanitize(req.body.to);
      let amount = req.sanitize(req.body.amount);
      let password = req.sanitize(req.body.password);
      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);

      // res.json({
      //    status: web3.eth.sendTransaction({
      //       from: from,
      //       to: to,
      //       amount: web3.toWei(amount, "ether"),
      //       passphrase: password
      //    }, function(err, data) {
      //       if (err) return err;
      //       else return data;
      //    })
      // });

      res.json({
         status: true,
         message: value + ' was send from ' + req.from + ' to ' + req.to
      })

   } else {
      res.json({
         status: false,
         message: 'Check the values.'
      })
   }
});




// Create a new API user
// curl -H "Content-Type: application/json" -X POST -d 
// '{"userId": "007", "password":"some_password"}' 
//http://localhost:8765/api/v1/newaccount
// manage accounts
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId}
// COLLECTION users
router.post('/newapiuser', (req, res, next) => {
   if (req.body.userId) {
   let userId = req.sanitize(req.body.userId);

   auth.newApiUser(userId)
      .then((data) => {
         if (data) {
            res.json({
               status: "success",
               message: "New API user created"
            })

            next();

         } else {
            res.json({
               status: "fail",
               message: "Unable to create new API user"
            })

            next();
         }
      })

   } else {
      res.json({
         status: "fail",
         message:"Did you send a userId?"
      })
   }
});

// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret}
// COLLECTION users
router.post('/rmapiuser', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);

      auth.removeApiUser(userId, key, secret)
         .then((data) => {
            if (data) {
               res.json({
                  status: "success",
                  message: "API user removed"
               })
            } else {
               res.json({
                  status: "fail",
                  message: "failed to remove API user"
               })
            }
         })

   } else {
      res.json({
         status: "fail",
         message: "Did you send a userId, key and secret?"
      })
   }
});

// User Authentication /checkapiuser
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret}
// COLLECTION users
router.post('/checkapiuser', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);

      auth.checkApiUser(userId, key, secret)
         .then((data) => {
            if (data === true)
               res.send({ auth: true })
            else
               res.send({ auth: false })
         })

   } else {
      res.json({
         status: "fail",
         message: "Did you send a UserId, Key and Secret?"
      })
   }
});

// Create a new Ethereum account /account
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret}
// COLLECTION accounts
router.post('/newaccount', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let password = bcrypt.hashSync(req.sanitize(req.body.password));
      let account = web3.personal.newAccount(password);
      let currency = 'ETH';

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               account.new(userId, password, account, currency)
                  .then((data) => {
                     console.log(data);
                     if (data === false)
                        res.json({
                           status: "fail",
                           message: "Account not created"
                        })

                     else
                        res.json({
                           status: "success",
                           userId: data.userId,
                           account: data.account,
                           currency: currency
                        })
                  })

            } else {
               res.json({
                  status: "fail",
                  message: "Authentication failed"
               })
            }
         })

   } else {
      res.json({
         status: "fail",
         please: "please check your values"
      })
   }
});

// Unlock Ethereum Address /unlockethaddress
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret
//       account: account, password: password}
// COLLECTION accounts
router.post('/unlockaccount', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let account = req.sanitize(req.body.account);
      let password = req.sanitize(req.body.password);

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               web3.personal
                  .unlockAccount(account, password, 1000);
               res.json({
                  status: "success",
                  message: "account unlocked"
               })

            } else {
               res.json({
                  status: "fail",
                  message: "Authentication failed. Check values"
               })
            }
         })

   } else {
      res.json({
         status: "fail",
         please: "please check your values"
      })
   }
});

// Unlock Ethereum Address /unlockaccount
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret
//       account: account, password: password}
// COLLECTION accounts
router.post('/lockaccount', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let account = req.sanitize(req.body.account);
      let password = req.sanitize(req.body.password);

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               web3.personal
                  .lockAccount(account, password, 1000);
               res.json({
                  status: "success",
                  message: "account locked"
               })

            } else {
               res.json({
                  status: "fail",
                  message: "Authentication failed. Check values"
               })
            }
         })

   } else {
      res.json({
         status: "fail",
         please: "please check your values"
      })
   }

});


//>> Process all routes, return failed if route is bad
router.get('*', function(req, res) {
   res.status = 404;
   res.json({
      status: false,
      message: "This endpoint does not have a method"
   })
});


//>> Export 
module.exports = router;
