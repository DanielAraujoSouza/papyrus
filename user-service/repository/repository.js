const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const mongodb = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const Schema = mongoose.Schema;

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
  }
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
      await User.findById(param, callback);
    }
    else {
      await User.findOne({ "email": param }).exec(callback);
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

async function disconnect() {
  return await mongodb.disconnect();
};

module.exports = {
  getAllUsers,
  getUser,
	insertUser,
	removeUserById,
  disconnect
}
