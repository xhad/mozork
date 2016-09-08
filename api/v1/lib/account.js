const Account = require('../models/account');
const Auth = require('./auth');
const Promise = require('bluebird');

function Accounts() {

   this.auth = new Auth();
};

// creates a new address
Accounts.prototype.new = function(userId, password, address, currency) {
   return new Promise((fulfill, reject) => {
         let newAccount = new Account({
            userId: userId,
            password: password,
            address: address,
            currency: currency
         });

         newAccount.save((err, data) => {
            if (data) fulfill({
               userId: data.userId,
               address: data.address
            });

            else reject(err);
         });
      })
      .catch((error) => {
         return false;
      })
};

// checks that a user has an address
Accounts.prototype.get = function(userId, address) {
   return new Promise((fulfill, reject) => {
         var account = new Account({
            userId: userId,
            address: address
         });

         account.findOne({}).then((data) => {
            if (data)
               fulfill(data);
            else
               reject();
         })
      })
      .catch((error) => {
         return false;
      })
};

Accounts.prototype.send = function(userId, password, from, to, value) {
   return new Promise((fulfill, reject) => {
      var account = new Account({
         userId: userId,
         password: password,
         address: address
      });

      account.findOne().then((err, data) => {
            if (err)
               reject(err);
            else
               return data;
         })
         .then((data) => {

         })
   });

};


module.exports = Accounts;
