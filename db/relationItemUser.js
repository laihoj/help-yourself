/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const ItemUser = require("./../models/relationItemUser");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return ItemUser.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(itemObj, userObj) {
	return ItemUser.findOne({
		'item.id':itemObj._id, 
		'user.id': userObj._id
	}).exec();
}

/********************************************************
Get by filter
********************************************************/

exports.byID = async function(id) {
	return ItemUser.findOne({
		_id: id
	}).exec();
}
exports.byItem = async function(itemObj) {
	return ItemUser.findOne({
		'item.id': itemObj._id
	}).exec();
}
exports.byUser = async function(userObj) {
	return ItemUser.find({
		'user.id': userObj._id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(itemObj, userObj) {
	let relation = new ItemUser({
		item: {
			id: itemObj._id,
			label: itemObj.label
		},
		user: {
			id: userObj._id,
			username: userObj.username
		}
	});
	return relation.save();
}

/********************************************************
Update
********************************************************/

exports.update = async function(id, itemObj, userObj) {
	let relation = await exports.ItemUser.byId(id);
	relation.item.id = itemObj._id;
	relation.item.label = itemObj.label;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.ItemUser.byID(id);	
	return relation.delete();
}