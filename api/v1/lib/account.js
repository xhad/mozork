const Account = require('../models/account');
const Auth = require('./auth');
const Promise = require('bluebird');

function Accounts() {

   this.auth = new Auth();
};

// creates a new account
Accounts.prototype.new = function(userId, password, account, currency) {
   return new Promise((fulfill, reject) => {

         function save() {
            var newAccount = new Account({
               userId: userId,
               password: password,
               account: account,
               currency: currency
            });

            newAccount.save((err, data) => {
               if (data) fulfill({
                  userId: data.userId,
                  account: data.account
               });

               else reject(err);
            });
         }

         Account.find({ userId: userId }, function(err, data) {
            if (data[0]) fulfill({
               userId: data[0].userId,
               account: data[0].account,
               message: "account already exists"
            });

            else {
               save();
            }
         })
      })
      .catch((error) => {
         return false;
      })
};

// get's account and password from userId 
Accounts.prototype.get = function(userId) {
   return new Promise((fulfill, reject) => {

         Account.findOne({ userId: userId }).then((data) => {
            if (data)
               fulfill(data);
            else
               reject(false);
         })
      })
      .catch((error) => {
         return false;
      })
};

Accounts.prototype.send = function(userId, password, from, to, value) {
   return new Promise((fulfill, reject) => {
      let account = new Account({
         userId: userId,
         password: password,
         account: account
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
