/*******************************************************
Mongoose.js and MongoDB
********************************************************/
const mongoose = require('mongoose')

var url = process.env.DATABASEURL;
mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology: true});

const Log = require("./../models/log");

exports.all = async function() {
	let logs = await Log.find({}, function(err, logs) {
			if(err) {console.log(err);} else {}
		});
	return logs;
}

exports.byID = async function(id) {
	let log = await Log.findOne({_id: id}, function(err, log) {
			if(err) {console.log(err);} else {}
		});
	return log
}

exports.save = async function(message) {
	var log = new Log({
		timestamp: Date.now(),
		message: message
	});
	log.save(function(err, user) {
			if(err) {console.log(err);} else {}
		});
 	return log;
}