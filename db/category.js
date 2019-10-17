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
	return Category.find({user: user}).exec();
}

exports.byID = async function(id) {
	return Category.findOne({_id: id}).exec();
}

exports.save = async function(label, user) {
	var category = new Category({
		label: label,
		user: user
	});
	exports.addRelevance(user, label, 50);
 	return category.save();
}

//TODO: delete category from relevances also
exports.delete = async function(id) {
	let res = await exports.byID(id);	
	return res.delete();
}