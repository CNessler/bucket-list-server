var bcrypt = require('bcryptjs');
var db = require('monk')(process.env.MONGOLAB_URI);
var ObjectID = require('mongodb').ObjectID;
var Users = db.get('users');
var Items = db.get('items');

module.exports = {
  signup: function (user) {
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
      })
    })
    .then(function (foundUser) {
      function findPendingFriendArray(foundUser) {
        var friendArray = []
        results.foundUser.pendingFriends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray;
      }
      return findPendingFriendArray(foundUser)
    })
    .then(function (friendArray) {
      return Users.find({_id: { $in: friendArray }})
    })
    .then(function (pending) {
      results.pendingFriendsInfo = pending;
    })
    .then(function (foundUser) {
      function findFriends(foundUser) {
        var friendArray = []
        results.foundUser.friends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray
      }
      return findFriends(foundUser)
    })
    .then(function (foundFriendsArray) {
      return Users.find({_id: { $in: foundFriendsArray}})
    })
    .then(function (foundFriends) {
      results.foundFriends = foundFriends;
      return results
    })
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
    var results = {}
    return Users.update({_id: friend.user}, {$push: {friends: friend._id}})
    .then(function (user) {
      return Users.update({_id: friend.user}, {$pull: {pendingFriends: friend._id}})
    }).then(function (user) {
      return Users.update({_id: friend._id}, {$push: {friends: friend.user}})
    }).then(function () {
      return Users.findOne({_id: friend.user})
    })
    .then(function (foundUser) {
      return Items.find({_id: {$in: foundUser.bucket}})
       .then(function (foundItems) {
        results.foundItems = foundItems
        return results.user = foundUser;
      })
    })
    .then(function (foundUser) {
      var foundUser = results.user
      function findFriends(foundUser) {
        var friendArray = []
        foundUser.friends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray
      }
      return findFriends(foundUser)
    })
    .then(function (foundFriendsArray) {
      return Users.find({_id: { $in: foundFriendsArray}})
    })
    .then(function (foundFriends) {
      results.foundFriends = foundFriends;
      var foundUser = results.user;
      function findPendingFriendArray() {
        var friendArray = []
        results.user.pendingFriends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray;
      }
      return findPendingFriendArray()
    })
    .then(function (pendingFriendsArray) {
      return Users.find({_id: { $in: pendingFriendsArray }})
    })
    .then(function (pending) {
      results.pendingFriendsInfo = pending;
      return results
    })
  },

  addFriend: function (friend) {
    var results = {};
    return Users.update({_id: friend._id}, {$addToSet: {pendingFriends: friend.user}})
    .then(function () {
      return Users.findOne({_id: friend._id})
    })
    .then(function (foundFriend) {
      results.friend = foundFriend;
      return Items.find({_id: {$in: foundFriend.bucket}})
    })
    .then(function (foundItems) {
      results.foundItems = foundItems
      return results
    })
  },

  addLike: function (id) {
    console.log(id, "ID COMING IN");
    var results = {};
    return Items.update({_id: id._id}, {$set: {likes: id.likes}, $push:{likedBy: id.beingLikedId}})
    .then(function () {
      var userId = new ObjectID(id.beingLikedId);
      return Users.findOne({_id: id.beingLikedId})
    })
    .then(function (foundUser) {
      console.log(foundUser, 'HERE');
      return Items.find({_id: {$in: foundUser.bucket}})
       .then(function (foundItems) {
        results.foundItems = foundItems
        return results.user = foundUser;
      })
    })
    .then(function (foundUser) {
      console.log(foundUser, 'should still be user');
      var foundUser = results.user
      function findFriends(foundUser) {
        var friendArray = []
        foundUser.friends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray
      }
      return findFriends(foundUser)
    })
    .then(function (foundFriendsArray) {
      return Users.find({_id: { $in: foundFriendsArray}})
    })
    .then(function (foundFriends) {
      console.log(foundFriends, 'here with friends');
      results.foundFriends = foundFriends;
      var foundUser = results.user;
      console.log(foundUser, 'results user i hop hop hop');
      function findPendingFriendArray() {
        var friendArray = []
        results.user.pendingFriends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray;
      }
      return findPendingFriendArray()
    })
    .then(function (pendingFriendsArray) {
      console.log(pendingFriendsArray, 'pending array');
      return Users.find({_id: { $in: pendingFriendsArray }})
    })
    .then(function (pending) {
      console.log(pending, 'pending friends info');
      results.pendingFriendsInfo = pending;
      console.log(results, 'RESULTS');
      return results
    })
  },

  removePending: function (friend) {
    return Users.update({_id: friend.user}, {$pull: {pendingFriends: friend._id}})
      .then(function () {
        return Users.findOne({_id: friend.user})
      })
  },

  searcher: function (search) {
    console.log(search, 'about to go to users');
    return Users.find({userFirst: {'$regex': search}}).then(function (results) {
      console.log(results, 'results of search');
      return results
    })
  },

  all: function () {
    return Users.find({});
  },

  completed: function (item) {
    var results = {};
    console.log('in func');
    return Items.update({_id: item._id}, {$set: {completed: true}}).then(function (updated) {
    })
    .then(function () {
      return Users.findOne({_id: item.user})
    })
    .then(function (foundUser) {
      console.log(foundUser, 'user found in db');
      return Items.find({_id: {$in: foundUser.bucket}})
       .then(function (foundItems) {
        results.foundItems = foundItems
        return results.user = foundUser;
      })
    })
    .then(function (foundUser) {
      function findFriends(foundUser) {
        var friendArray = []
        foundUser.friends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray
      }
      return findFriends(foundUser)
    })
    .then(function (foundFriendsArray) {
      console.log('now here', foundFriendsArray);
      return Users.find({_id: { $in: foundFriendsArray}})
    })
    .then(function (foundFriends) {
      console.log(foundFriends, 'friends are found!');
      results.foundFriends = foundFriends;
      var foundUser = results.user;
      function findPendingFriendArray() {
        var friendArray = []
        results.user.pendingFriends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray;
      }
      return findPendingFriendArray()
    })
    .then(function (pendingFriendsArray) {
      return Users.find({_id: { $in: pendingFriendsArray }})
    })
    .then(function (pending) {
      results.pendingFriendsInfo = pending;
      console.log(results, "RESULTS");
      return results
    })
  },

  insert: function (item) {
    console.log(item, 'in func in db');
    var results = {};
    return Items.insert(item)
    .then(function (item) {
      console.log(item, 'should have id');
      return Users.update({_id: item.user}, {$push: {bucket: item._id}})
    })
    .then(function () {
      return Users.findOne({_id: item.user})
    })
    .then(function (foundUser) {
      console.log(foundUser, 'HERE');
      return Items.find({_id: {$in: foundUser.bucket}})
       .then(function (foundItems) {
        results.foundItems = foundItems
        return results.user = foundUser;
      })
    })
    .then(function (foundUser) {
      console.log(foundUser, 'should still be user');
      var foundUser = results.user
      function findFriends(foundUser) {
        var friendArray = []
        foundUser.friends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray
      }
      return findFriends(foundUser)
    })
    .then(function (foundFriendsArray) {
      return Users.find({_id: { $in: foundFriendsArray}})
    })
    .then(function (foundFriends) {
      console.log(foundFriends, 'here with friends');
      results.foundFriends = foundFriends;
      var foundUser = results.user;
      console.log(foundUser, 'results user i hop hop hop');
      function findPendingFriendArray() {
        var friendArray = []
        results.user.pendingFriends.forEach(function (friend) {
          friendArray.push(new ObjectID(friend))
        })
        return friendArray;
      }
      return findPendingFriendArray()
    })
    .then(function (pendingFriendsArray) {
      console.log(pendingFriendsArray, 'pending array');
      return Users.find({_id: { $in: pendingFriendsArray }})
    })
    .then(function (pending) {
      console.log(pending, 'pending friends info');
      results.pendingFriendsInfo = pending;
      console.log(results, 'RESULTS');
      return results
    })
  }

};
