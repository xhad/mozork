///>>> MOZORK API V1
///>>> Ethereum Go-Client API
///>>> Written by Chad Lynch
///>>> Copyright, MIT. 2016
///>>> DO NOT EXPOSE TO INTERNET
///>>> INTERNAL MICRO SERVICE ONLY

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


//>> API version check

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

//>> Auth Routes

// Send a transaction /ethtransaction
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret
//       value: "amount_of_eth", from: "ETH_addr", 
//       to: "To_eth_addr", password: "sender_address_password"}
router.post('/ethtransaction', (req, res, next) => {
   if (req.body.from &&
      req.body.to &&
      req.body.value &&
      req.body.password &&
      req.body.userId &&
      req.body.key &&
      req.body.secret) {

      let from = req.sanitize(req.body.from);
      let to = req.sanitize(req.body.to);
      let value = req.sanitize(req.body.value);
      let password = req.sanitize(req.body.password);
      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);

      // res.json({
      //    status: web3.eth.sendTransaction({
      //       from: from,
      //       to: to,
      //       value: web3.toWei(value, "ether"),
      //       passphrase: password
      //    }, function(err, data) {
      //       if (err) return err;
      //       else return data;
      //    })
      // });

      res.json({
         status: true,
         message: value + ' was send from ' + req.from + ' to ' + req.to
      });

   } else {
      res.json({
         status: false,
         message: 'Check the values.'
      });
   }
});




// Create a new API user
// curl -H "Content-Type: application/json" -X POST -d 
// '{"userId": "007", "password":"some_password"}' 
//http://localhost:8765/api/v1/newaccount
// manage accounts
// PARAM userId      user_id of user  
// PARAM password    password for Ethereum Wallet
// Mongo collection users
router.post('/newapiuser', (req, res, next) => {

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
})

// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret}

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
         });

   } else {
      res.json({
         status: "fail",
         message: "Did you send a userId, key and secret?"
      })
   }
})

// User Authentication /checkapiuser
// PARAMS 
// HEADER {Content-Type: application/json}
// BODY {userId: userId, key: key, secret: secret}
// Mongo collection users
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
         });

   } else {
      res.json({
         status: "fail",
         message: "Did you send a UserId, Key and Secret?"
      })
   }
})

// Create a new Ethereum Address /newethaddress
// PARAMS 
// userId      from excahnge user_id
// key         key token from mozork user key
// secret      secret token from mozek user secret
// Mongo collection accounts 
router.post('/newethaddress', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let password = bcrypt.hashSync(req.sanitize(req.body.password));
      let address = web3.personal.newAccount(password);
      let currency = 'ETH';

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               account.new(userId, password, address, currency)
                  .then((data) => {
                     console.log(data);
                     if (data === false)
                        res.json({
                           status: "fail",
                           message: "Address not created"
                        })

                     else
                        res.json({
                           status: "success",
                           userId: data.userId,
                           address: data.address,
                           currency: currency
                        })
                  });

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
})

// Unlock Ethereum Address /unlockethaddress
// PARAMS
// userId      from exchange user_id
// key         key token from mozork user key
// secret      secret token from mozek user secret   
// address     Ethereum address from Mongo Accounts
// password    Ethereum address password (hashed)
// Mongo collection accounts
router.post('/unlockethaddress', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let address = req.sanitize(req.body.address);
      let password = req.sanitize(req.body.password);

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               web3.personal
                  .unlockAccount(address, password, 1000);
               res.json({
                  status: "success",
                  message: "address unlocked"
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
})

// Lock Ethereum Address /lockethaddress
// PARAMS
// userId      from exchange user_id
// key         key token from mozork user key
// secret      secret token from mozek user secret   
// address     Ethereum address from Mongo Accounts
// password    Ethereum address password (hashed)
// Mongo collection accounts
router.post('/lockethaddress', (req, res, next) => {
   if (req.body.userId && req.body.key && req.body.secret) {

      let userId = req.sanitize(req.body.userId);
      let key = req.sanitize(req.body.key);
      let secret = req.sanitize(req.body.secret);
      let address = req.sanitize(req.body.address);
      let password = req.sanitize(req.body.password);

      auth.checkApiUser(userId, key, secret)
         .then((auth) => {
            if (auth === true) {
               web3.personal
                  .lockAccount(address, password, 1000);
               res.json({
                  status: "success",
                  message: "address locked"
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

})


//>> Process all routes, return failed if route is bad
router.get('*', function(req, res) {
   res.status = 404;
   res.json({
      status: false,
      message: "This endpoint does not have a method"
   });
});


//>> Export 
module.exports = router;
