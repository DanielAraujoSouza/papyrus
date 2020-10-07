const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const mongodb = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;
const ITEMS_PER_PAGE = 15;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
		minlength: 4,
		maxlength: 100
  },
  email: {
    type: String,
    required: true,
		maxlength: 100,
		unique: true 
  },
  password: {
		type: String,
		required: true,
    minlength: 8
  },
  role: {
		type: String,
		default: "USER"
  },
  avatar_path: {
    type: String
  },
  favorites: [{
    _id: {
      type: Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String, 
      unique: true,
      required: true
    },
    poster_path: {
      type: String
    },
    authors: [{
      name: {
        type: String, 
        maxlength: 100,
        required: true
      },
      _id: {
        type: Schema.Types.ObjectId,
        required: true
      }
    }],
    summary: {
      type: String, 
      required: true
    },
    genre: [{
      type: String,
      required: true
    }],
    type: {
      type: String,
      enum : ['printed','ebook'],
      default: 'printed'
    },
  }]
}, { collection: 'users' });

const User = mongoose.model("User", UserSchema);

async function getAllUsers(callback) {
  mongodb.connect(async err => {
		await User.find({}).exec(callback);
  })
};

async function getUser(param, callback) {
  mongodb.connect(async err => {
    if (ObjectId.isValid(param)) {
      await User.findById(param, {favorites: 0},callback);
    }
    else {
      await User.findOne({ "email": param }, {favorites: 0}).exec(callback);
    }
  });
};

async function insertUser(user, callback) {
	mongodb.connect(async err => {
    const newUser = new User(user);
    await newUser.save(callback);
  });
};

async function removeUserById(id, callback) {
	mongodb.connect(async err => {
    if (!ObjectId.isValid(id)) {
      id = null;
    }
    await User.findByIdAndRemove(id, callback);
  });
};

async function removeFavorite(userID, bookID, callback) {
	mongodb.connect(async err => {
    User.findOneAndUpdate (
      { _id: userID }, 
      { $pull: { favorites: {_id: bookID} }}
    )
    .exec(callback);
  });
};

async function addFavorite(userID, favorite, callback) {
	mongodb.connect(async err => {
    User.findOneAndUpdate (
      { _id: userID }, 
      { $push: { favorites: favorite } }
    )
    .exec(callback);
  });
};

async function getFavoriteById(UserID, favoriteID, callback) {
  mongodb.connect(async err => {
    User.findOne (
      { _id: UserID }, 
      { 'favorites': { $elemMatch: { '_id': favoriteID} } },
      { $project: { _id: 0 }}
    )
    .exec(callback);
  });
};

async function getFavoritePerPage(UserID, page, callback) {
    mongodb.connect(async err => {
      User.aggregate(
      [
        { $match: { _id: ObjectId(UserID) } },
        { $project: {__v: 0}},
        { $project: {
            results: { $slice: [ "$favorites", ITEMS_PER_PAGE * (page - 1), ITEMS_PER_PAGE ] },
            totalCount: { 
              $cond: { 
                if: { $isArray: "$favorites" }, 
                then: { $size: "$favorites" }, 
                else: 0
              }
            }
          }
        },
        { $addFields: {
            totalPages: {
              $ifNull: [ 
                { 
                  $ceil: { 
                    $divide: ["$totalCount", ITEMS_PER_PAGE ]
                  }
                },
                0
              ]
            }
          }
        }
      ]
    )
    .exec(callback);
  });
};

async function disconnect() {
  return await mongodb.disconnect();
};

module.exports = {
  getAllUsers,
  getUser,
	insertUser,
  removeUserById,
  addFavorite,
  removeFavorite,
  getFavoriteById,
  getFavoritePerPage,
  disconnect
}
