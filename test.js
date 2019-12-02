var assert = require('assert');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
var domain = process.env.DOMAIN || "localhost:3000";

const db = require('./db.js');
const utils = require('./utils.js');



// createUser = async function(username, password) {
// 	let user = await db.users.save(username, password);
// 	return user;
// }

// getUser = async function(username) {
// 	let user = await db.users.get(username);
// 	return user;
// }

deleteUser = async function(username) {
	let user = await db.users.get(username);
	await db.users.delete(user);
	return user;
}


createItem = async function(label, category, user, parent) {
	let item = await db.createItem(
		label, 
		category, 
		user,
		parent);
	return item;
}

// testCreateGetDeleteUser = async function() {

// 	/*
// 	test user creation
// 	*/
// 	let createdUser = await db.users.save("testname", "testpassword");
// 	if(createdUser) {
// 		assert(createdUser.username, "User create failed");
// 	} else {
// 		assert(false, "User create failed");
// 	}
	
// 	let gettedUser = await db.users.get("testname");
// 	// let gettedUser = await getUser('testname');
// 	if(gettedUser) {
// 		assert(gettedUser.username === "testname", "User get failed, name not match");
// 	} else {
// 		assert(false === "testname", "User get failed, name not match");
// 	}
	
// 	await deleteUser(gettedUser);
// 	let deletedUser = await db.users.get("testname");
// 	if(deletedUser) {
// 		assert(false, "User not deleted");
// 	}
// }

// test user creation
testCreateUser = async function() {
	
	let createdUser = await db.users.save("testname", "testpassword");
	try {
		// assert(createdUser.username === "testname", "User create failed");
		if(createdUser) {
			assert(createdUser.username === "testname", "User create failed");
		} else {
			assert(false, "User create failed, user already exists");
		}
	} catch(e) {
		console.log(e.message);
	}
}

// test user retreival
testGetUser = async function() {
	let gettedUser = await db.users.get("testname");
	try {
		if(gettedUser) {
			assert(gettedUser.username == "testname", "User get failed, name doesn't match");
		} else {
			assert(false, "User not found, didn't compare name");
		}
	} catch(e) {
		console.log(e.message);
	}
}

// test user delete
testDeleteUser = async function() {
	// let gettedUser = await db.users.get("testname");
	await deleteUser("testname");
	let deletedUser = await db.users.get("testname");
	try {
		if(deletedUser) {
			assert(false, "User not deleted");
		}
	} catch(e) {
		console.log(e.message);
	}
}


// //test if item created
// createAndDeleteItemAndUser = async function() {
// 	let user = await createUser('bob', 'bob');
// 	let item = await createItem("hello", null, user);
// 	console.log(item);
// 	item.delete();
// 	user.delete();
// }

runTests = async function() {
	// createAndDeleteItemAndUser();
	// deleteUser("bob");
	// testCreateGetDeleteUser();
	await testCreateUser();
	await testGetUser();
	await testDeleteUser();
	console.log("tests complete");
	process.exit();
}

runTests();


