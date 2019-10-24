/********************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true });

const RelevancyUser = require("./../models/relationRelevancyUser");

/********************************************************
Get all
********************************************************/

exports.all = async function() {
	return RelevancyUser.find({}).exec();
}

/********************************************************
Get one
********************************************************/

exports.findOne = async function(relevancyObj, userObj) {
	return RelevancyUser.findOne({
		'relevancy.id':relevancyObj._id, 
		'user.id': userObj._id
	}).exec();
}

/********************************************************
Get one by filter
********************************************************/

exports.byID = async function(id) {
	return RelevancyUser.findOne({
		_id: id
	}).exec();
}
exports.byRelevancy = async function(relevancyObj) {
	return RelevancyUser.findOne({
		_id: relevancyObj.id
	}).exec();
}
exports.byUser = async function(userObj) {
	return RelevancyUser.findOne({
		_id: userObj.id
	}).exec();
}

/********************************************************
Create
********************************************************/

exports.save = async function(relevancyObj, userObj) {
	let relation = new RelevancyUser({
		relevancy: {
			id: relevancyObj._id
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

exports.update = async function(id, relevancyObj, userObj) {
	let relation = await exports.RelevancyUser.byId(id);
	relation.relevancy.id = relevancyObj._id;
	relation.user.id = userObj._id;
	relation.user.username = relevancyObj.username;
	return relation.save();
}

/********************************************************
Destroy
********************************************************/

exports.delete = async function(id) {
	let relation = await exports.RelevancyUser.byID(id);	
	return relation.delete();
}