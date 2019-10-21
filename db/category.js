/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const Category = require("./../models/category");

exports.all = async function() {
	return Category.find({}).exec();
}

exports.byUser = async function(user) {
	return Category.find({'user.username': user.username}).exec();
}

exports.byID = async function(id) {
	return Category.findOne({_id: id}).exec();
}

exports.save = async function(label, user) {
	var category = new Category({
		label: label,
		user: {
			id: user._id,
			username: user.username
		}
	});
	// exports.addRelevance(user, label, 50);
 	return category.save();
}

//TODO: delete category from relevances also
exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}

exports.updateUserModel = async function(user, id) {
	let itemToUpdate = await exports.byID(id);
	itemToUpdate.user = {
		id: user._id,
		username: user.username
	};
	return itemToUpdate.save();
}