/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const User = require("./../models/user");
const logs = require("./log.js");

exports.all = async function() {
	let res = await User.find({});
	return res;
}

exports.byID = async function(id) {
	let res = await User.findOne({_id: id}, function(err, foundUser) {
		if(err) {
			console.log("No user found");
		} else {}
	}).exec();
	return res;
}

exports.get = async function(user) {
	let res = await User.findOne({username: user}).exec();
	return res;
}

//if username already taken and password matches, user is simply logged in
exports.save = async function(username, password) {
	let foundByUsername = await exports.get(username);
	if(foundByUsername) {
		// let report = 'Username "' + username + '" already taken: ' + username;
  //       console.log(report);
  		return false;
	} else {
		const newUser = new User({username:username});
		await newUser.setPassword(password);
		let logMessage = "Saved user: " + newUser.username;
		await logs.save(logMessage);
		await newUser.save();
		return newUser;
	}
}

exports.delete = async function(id) {
	let res = await exports.byID(id);	
	res.delete(function(err, deletedUser) {
		if(err || !deletedUser) {
			console.log("No user deleted");
		}
	});
	let logMessage = "Deleted user: " + res.username;
	await logs.save(logMessage);
	return res;
}

//TODO: update user