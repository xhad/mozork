const Database = require('./db');
const User = require('../models/user');
const Key = require('uuid-key-generator');
const Promise = require('bluebird');

function Auth() {};


Auth.prototype.newApiUser = function(userId) {
   return new Promise((fulfill, reject) => {
         let keygen = new Key();
         let secgen = new Key(256, Key.BASE62);

         let newUser = new User({
            userId: userId,
            key: keygen.generateKey(),
            secret: secgen.generateKey()
         });

         user.save().then((data) => {
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

Auth.prototype.removeApiUser = function(userId, key, secret) {
   return new Promise((fulfill, reject) => {

         User.find({
               userId: userId,
               key: key,
               secret: secret
            }).remove()
            .exec((data) => {
               if (!data)
                  fulfill(true);
               else
                  reject();
            });
      })
      .catch((error) => {
         return false;
      })
};

Auth.prototype.checkApiUser = function(userId, key, secret) {
   return new Promise((fulfill, reject) => {

         User.findOne({
            userId: userId,
            key: key,
            secret: secret
         }, function(err, data) {
            if (data && data.id && data.key && data.secret) {
               fulfill(true);
            } else {
               reject(false);
            }
         })
      })
      .catch((error) => {
         return false;
      })
};




module.exports = Auth;
