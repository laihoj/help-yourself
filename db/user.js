/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const User = require("./../models/user");

exports.all = async function() {
	return User.find({}).exec();
}

exports.byID = async function(id) {
	return User.findOne({_id: id}).exec();
}

exports.get = async function(user) {
	return User.find({username: user}).exec();
}

exports.save = async function(username, password) {
	const newUser = new User({username:username});
	await newUser.setPassword(password);

	const newRelevances = await exports.saveRelevance(username);
	return newUser.save();
}


exports.delete = async function(label) {
	var message = "user delete not implemented yet";
	console.log(message);
	alert(message);
	return {err: message};
}

//TODO: delete user delete everything by user
exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}