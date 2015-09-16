var bcrypt = require('bcryptjs');
var db = require('monk')(process.env.MONGOLAB_URI);
var Users = db.get('users');
var Items = db.get('items');

module.exports = {
  signup: function (user) {
    console.log(user, 'in func');
    return Users.find({email: user.email}).then(function (response) {
      if(response.length === 0){
        if(user.password === user.confirmPass){
          var crypted = bcrypt.hashSync(user.password, 8);
          return Users.insert({
                                userFirst: user.first,
                                userLast: user.last,
                                streetAddress: user.streetAddress,
                                city: user.city,
                                state: user.state,
                                zipcode: user.zipcode,
                                private: false,
                                bucket: user.bucket,
                                email: user.email,
                                password: crypted,
                                friends: user.friends,
                                pendingFriends: user.pendingFriends
                              })
          .then(function (newUser) {
            return newUser
          })
        }
      }
    })
  },

  login: function (user) {
    var results = {}
    return Users.findOne({email: user.email})
    .then(function (foundUser) {
      if(foundUser){
        if(bcrypt.compareSync(user.password, foundUser.password)){
          results.foundUser = foundUser
          return foundUser
        }
      }
    })
    .then(function (foundUser) {
      return Items.find({_id: {$in: foundUser.bucket}})
       .then(function (foundItems) {
        results.foundItems = foundItems
        return results
      })
    })
    // .then(function (foundUser) {
    //   return Users.find({_id: {$in: foundUser.pendingFriends}})
    // })
    // .then(function (pending) {
    //   results.pendingFriendInfo = pendingFriends;
    //   return results
    // })
  },

  findFriend: function (friend) {
    var results = {};
    return Users.findOne({_id: req.query.friend})
    .then(function (friend) {
      results.friend = friend;
      return friend
    }).then(function (foundFriend) {
      return Items.find({_id: {$in: foundFriend.bucket}})
    }).then(function (foundItems) {
      results.foundItems = foundItems
      return results
    })
  },

  addToFriends: function (friend) {
    var user = {}
    return Users.update({_id: friend.user}, {$push: {friends: friend._id}})
      .then(function (user) {
      return Users.update({_id: friend.user}, {$pull: {pendingFriends: friend._id}})
      .then(function (user) {
      return Users.update({_id: friend._id}, {$push: {friends: friend.user}})
      })
    }).then(function () {
      return Users.findOne({_id: friend.user})
    })
  },

  addFriend: function (friend) {
    var results = {};
    return Users.update({_id: friend._id}, {$addToSet: {pendingFriends: friend.user}})
    .then(function () {
      return Users.findOne({_id: friend._id})
    })
    .then(function (foundFriend) {
      console.log(foundFriend, 'friend found');
      results.friend = foundFriend;
      return Items.find({_id: {$in: foundFriend.bucket}})
    })
    .then(function (foundItems) {
      console.log(foundItems, 'items in bucket');
      results.foundItems = foundItems
      return results
    })
  },

  addLike: function (id) {
    return Items.update({_id: id._id}, {$set: {likes: id.likes}})
  },

  removePending: function (friend) {
    return Users.update({_id: friend.user}, {$pull: {pendingFriends: friend._id}})
      .then(function () {
        return Users.findOne({_id: friend.user})
      })
  },

  search: function (search) {
    return Users.find({userFirst: {'$regex': search}}).then(function (results) {
      return results
    })
  },

  // findPending: function (pendingFriends) {
  //   // return Users.find({_id: pendingFriends})
  //   var foundPending = [];
  //   pendingFriends.forEach(function (friend) {
  //     foundPending.push(Users.findOnd({_id: friend}))
  //   })
  //   return foundPending;
  // }
};
