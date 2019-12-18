if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var bodyParser 				= require("body-parser"),
	express 				= require("express"),
	request					= require("request"),
	flash					= require("connect-flash"),
	passport 				= require("passport"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose"),
	methodOverride			= require("method-override"),
	app						= express();


var User = require("./models/user");

var auth = require('./auth.js');

app.use(require("express-session")({
	secret: process.env.SECRET || "salaisuus",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.set("view engine", "ejs");
app.set('views', __dirname + '/views/');
app.use(express.static(__dirname + '/public'));
// app.use('/css',express.static(__dirname +'/public/css'));


// app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error 	= req.flash("error");
	res.locals.success 	= req.flash("success");
	res.locals.warning 	= req.flash("warning");

	res.header("Access-Control-Allow-Origin", "*");
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	
	next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var domain = process.env.DOMAIN || "localhost:3000";

const db = require('./db.js');
const utils = require('./utils.js');

/********************************************************
Routes
********************************************************/


//************************* Home *************************//

app.get("/", auth.isAuthenticated, async function(req, res) {
	
	let items 			= await db.items.byUserID(req.user._id);
	let itemsbyid = {};
	for(var i = 0; i < items.length; i++) {
		itemsbyid[items[i].id] = items[i];
	}

	let efforts 		= await db.efforts.byUserID(req.user._id);
	// console.log("efforts found: " +efforts);
	let effortsbyid = {};
	for(var i = 0; i < efforts.length; i++) {
		effortsbyid[efforts[i].id] = efforts[i];
	}

	let effortofitem 	= await db.relations.effortItem.byUserID(req.user._id);
	// console.log("relations found: " +effortofitem);
	let relationbyitemid = {};
	for(var i = 0; i < effortofitem.length; i++) {
		let itemid = effortofitem[i].item.id;
		let item = itemsbyid[itemid];
		let effortid = effortofitem[i].effort.id;
		// item.effort += effortsbyid[effortid].hours;
	}

	res.render("index", {data:items});
});

/*
issue with ssl certificate?
*/
// app.get("/beta/treeify", auth.isAuthenticated, async function(req, res) {
// 	let source = "api/items/treeify";
// 	request(source, function(err, response, body) { //request data from specified data
// 	  	if (err) { res.send(err); }
// 	  	console.log("Response: " + response);
// 	  	console.log("Body: " + body);
// 	  	res.send(body);
// 	});
// });

app.get("/beta/treeify", auth.isAuthenticated, async function(req, res) {
	let itemitem 		= await db.relations.itemItem.byUser(req.user);

	//format the data to be appropriate with function found from internet
	let list = [];
	itemitem.forEach(function(obj) {
		let item = {};
		item['id'] = obj.child.id;
		item['label'] = obj.child.label;
		item['parent'] = obj.parent.id;
		list.push(item);
	});
 	let treeList = utils.treeify(list);
	res.render("itemTree", {data: treeList, list: list});
});



app.get("/beta/graph", auth.isAuthenticated, async function(req, res) {
	let items 	= await db.items.byUserID(req.user._id);
	let edges = [];
	var idlookuptable = {};
	var index = 2;
	let relations = [];
	for(var i = 0; i < items.length; i++) {
		let childsofparent = await db.relations.itemItem.byParent(items[i]);
		idlookuptable[items[i]._id] = index;
		index ++;
		for(var j = 0; j < childsofparent.length; j++) {
			relations.push(childsofparent[j]);
			
			idlookuptable[childsofparent[j].child.id] = index;
			index ++;
		}
	}
	// {id: 1, label: 'Abdelmoumene Djabou', title: 'Country: ' + 'Algeria' + '<br>' + 'Team: ' + 'Club Africain', value: 22, group: 24, x: -1392.5499, y: 1124.1614},
	var nodes = [];

	/*why does this not work?*/
	nodes.push("{id: " + 1 + ", label: " + req.user.username + "}");
	edges.push("{from: 1, to: 2}");

	for(var i = 0; i < items.length; i++) {
		nodes.push("{id: " + idlookuptable[items[i]._id] + ", label: " + items[i].label + "}");
	}

	for(var i = 0; i < relations.length; i++) {
		edges.push("{from: "+ idlookuptable[relations[i].parent.id] + ", to: " + idlookuptable[relations[i].child.id]+"}");
		// edges.push("from: " + idlookuptable[key])
	}
	// var edges
	// let children = [...new Set(childs)];

	// var edges = [
 //  "{from: 1, to: 15}",
 //  "{from: 1, to: 97}",
 //  "{from: 1, to: 108}",
 //  "{from: 1, to: 173}",
 //  "{from: 1, to: 195}"
 //  ];
	res.render("graph", {edges:edges, nodes: nodes, items: items, idlookuptable:idlookuptable});
});


//************************* Utilities *************************//

app.get("/login", function(req, res) {
	res.render('login');
});

app.get("/register", function(req, res) {
	res.render('register');
});

app.get("/logout",function(req, res){
	req.logout();
	req.flash("success", "Logged out");
	res.redirect("/");
});

app.post("/login", passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), function(req, res) {
	if(!req.user) {
		req.flash("error", "Issue signing up");
		res.redirect("/login");
	} else {
		req.flash("success", "Logged in");
		res.redirect(req.session.redirectTo || '/users/' +req.user);
		delete req.session.redirectTo;
	}
});


//************************* API *************************//




app.get("/api", function(req, res) {
	res.render("api");
});

//Use this to 'export' data from old database
app.get("/api/priorities/update", async function(req, res) {
	let items = await db.items.byUser(req.user);
	var promiseStack = [];
	for(var i = 0; i < items.length; i++) 
		promiseStack.push(utils.updateItemTotalEffort3(req.user, items[i]));


	Promise.all(promiseStack).then(function() {
		backURL=req.header('Referer') || '/';
    	res.redirect(backURL);
	});
});

//Use this to 'export' data from old database
app.get("/api/migrate/out", async function(req, res) {
	let data = await db.all();
	res.send(data);
});

//get all that data and do something with it. Populate new database by some logic?
app.get("/api/migrate/in", async function(req, res) {
	res.render("migrate");
	// res.send("Not implemented yet");
});

app.post("/api/migrate/in", async function(req, res) {
	let source = req.body.db_from;
	let data = {
		source: source,
	};

	request(source, { json: true }, async (err, response, body) => { //request data from specified data
	  	if (err) { res.send(err); }
		for(var i = 0; i < response.body.items.length; i++) {
	  		let item = response.body.items[i];
	  		await db.createItem(
				item.label, 
				item.user);
	  	}
		res.redirect("/");
		var promiseStack = [];
		for(var i = 0; i < response.body.efforts.length; i++) {
	  		let effort = response.body.efforts[i];
	  		promiseStack.push(db.saveEffort(
				effort.hours, 
				effort.minutes, 
				effort.item._id || effort.item.id, 
				effort.timestamp, 
				effort.user,
				effort.note)
	  		);
	  	}
	  	Promise.all(promiseStack).then(async function() {
			let items = await db.items.all();
	  		for(var i = 0; i < items.length; i++) {
		  			utils.updateItemTotalEffort2(items[i]);
	  		}
			res.redirect("/");
		});	
	});
});

//creates a tree structure of the item relations and returns this structure
app.get("/api/items/treeify", auth.isAuthenticated, async function(req, res) {
	let itemitem 		= await db.relations.itemItem.byUser(req.user);

	//format the data to be appropriate with function found from internet
	let list = [];
	itemitem.forEach(function(obj) {
		let item = {};
		item['id'] = obj.child.id;
		item['label'] = obj.child.label;
		item['parent'] = obj.parent.id;
		list.push(item);
	});
 	let treeList = utils.treeify(list);
	res.send(treeList);
});

app.get("/api/efforts", auth.isAuthenticated, async function(req,res) {
	let efforts = await db.efforts.byUserID(req.user._id);
	// let efforts = await db.efforts.all();
	res.send(efforts);
});


app.get("/api/items", auth.isAuthenticated, async function(req,res) {
	let items = await db.items.byUserID(req.user._id);
	res.render("partials/newitemform2", {data: items});
	// res.send(items);
});


app.get("/api/relevancies", auth.isAuthenticated, async function(req,res) {
	let relevancies = await db.relevancies.byUserID(req.user._id);
	// let relevancies = await db.relevancies.all();

	res.send(relevancies);
});

app.get("/api/users", auth.isAuthenticated, async function(req,res) {
	let users = await db.users.all();
	res.send(users);
});



app.post("/api/effort", auth.isAuthenticated, async function(req,res) {
	let item = await db.items.byID(req.body.effort_item);
	let effort = await db.saveEffort(
		req.body.effort_hours || 0, 
		req.body.effort_minutes || 0, 
		req.body.effort_item, 
		req.body.effort_timestamp || Date.now(), 
		req.user,
		req.body.effort_note,
		item);

	var d = new Date();
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var string = "/calendar/"+year+"/"+month+"/"+day;
	// console.log(string);
	res.redirect(string);
});


app.get("/api/efforts/bytime/:year/:month/:day", auth.isAuthenticated, async function(req,res) {
	let efforts = await db.efforts.byDate(req.user._id, req.params.year,req.params.month,req.params.day);
	// let efforts = await db.efforts.all();
	res.send(efforts);
});


app.post("/api/items", auth.isAuthenticated, async function(req,res) {
	let item = await db.createItem(
		req.body.item_label, 
		// req.body.item_category, 
		req.user,
		req.body.item_parent);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
	// res.redirect("/items");
});

app.post("/api/users", async function(req,res){
	let user = await db.users.save(req.body.username, req.body.password);
	if(user) {
		passport.authenticate("local")(req, res, function() {
			res.redirect(req.session.redirectTo || '/users/' +req.user);
			delete req.session.redirectTo;
		});
	} else {
		res.redirect("/");
	}
});

app.put("/api/relevancies/:id", auth.isAuthenticated, async function (req, res) {
	let relevancyObj = await db.relevancies.byID(req.params.id);
	await db.updateRelevancy3(req.user, relevancyObj, req.body.relevancy_value);

	// let updatedRelevancy = await db.relevancies.byIdAndUpdate(
	// 	req.params.id,
	// 	req.body.relevancy_value,
	// 	);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.put("/api/efforts/:id", auth.isAuthenticated, async function (req, res) {
	let effortObj = await db.efforts.byID(req.params.id);
	let updatedEffort = await db.updateEffort(
		effortObj,
	// let updatedEffort = await db.efforts.byIdAndUpdate(
		// req.params.id,
		// req.user,
		// req.body.effort_item,
		req.body.effort_hours,
		req.body.effort_minutes,
		req.body.effort_timestamp,
		req.body.effort_note
		);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.put("/api/items/:id", auth.isAuthenticated, async function (req, res) {
	let item = await db.items.byID(req.params.id);
	let updatedItem = await db.items.byIDAndUpdate(
		req.params.id, 
		req.body.item_label 			|| item.label,
		req.body.item_priority 			|| item.priority,
		req.body.item_totalMinutes 		|| item.totalMinutes,
		req.body.item_totalRelevancy 	|| item.totalRelevancy
		);
    res.redirect("/items/"+req.params.item);
});

app.put("/api/relations/itemitem/:id", auth.isAuthenticated, async function(req, res) {
	// console.log("search by " +req.params.id);
	let relation = await db.relations.itemItem.byID(req.params.id);
	// console.log("found " +relation);
	let oldLabel = relation.parent.label;
	let newParent = await db.items.byID(req.body.parent_id);
	await db.relations.itemItem.update(relation, newParent, relation.child);
	//TODO
	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 res.redirect("/items/"+oldLabel+"/children");
});

app.post("/api/relations/itemitem/", auth.isAuthenticated, async function(req, res) {
	// let relation = await db.relations.itemItem.byID(req.params.id);
	// let newParent = await db.items.byID(req.body.parent_id);
	let parent = await db.items.byID(req.body.parent_id);
	let child = {
		_id: req.body.child_id,
		label: req.body.child_label,
	};
	await db.relations.itemItem.save(parent, child, req.user);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.put("/api/relations/effortitem/:id", auth.isAuthenticated, async function(req, res) {
	let relationObj = await db.relations.effortItem.byID(req.params.id);
	var oldLabel = relationObj.item.label;
	let newItemObj = await db.items.byID(req.body.item_id);
	await db.relations.effortItem.update(relationObj, relationObj.effort, newItemObj);

	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 	res.redirect("/items/"+oldLabel+"/summary");
});

//TODO
app.post("/api/relations/effortitem/", auth.isAuthenticated, async function(req, res) {
	// let relation = await db.relations.itemItem.byID(req.params.id);
	// let newParent = await db.items.byID(req.body.parent_id);
	let effort = {_id: req.body.effort_id};
	let item = await db.items.byID(req.body.item_id);
	await db.relations.effortItem.save(effort, item, req.user);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

// app.delete("/api/categories/:id", auth.isAuthenticated, async function(req,res) {
// 	db.categories.delete(req.params.id);
// 	backURL=req.header('Referer') || '/';
//     res.redirect(backURL);
// });

app.delete("/api/efforts/:id", auth.isAuthenticated, async function(req,res) {
	let effortToDelete = await db.efforts.byID(req.params.id);
	db.deleteEffort(effortToDelete);
	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 res.redirect("/efforts");
});

app.delete("/api/items/:id", auth.isAuthenticated, async function(req,res) {
	let itemToDelete = await db.items.byID(req.params.id);
	db.deleteItem(itemToDelete);
	// let itemToDelete = await db.items.delete(req.params.id);
	// if(!typeof itemToDelete === 'undefined') {
	// 	let relevancyToDelete = await db.relevancies.byLabel(itemToDelete.label);
	// 	if(!typeof relevancyToDelete === 'undefined') {
	// 		relevancyToDelete.delete();
	// 	}
	// 	itemToDelete.delete();
	// }
	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 res.redirect("/items");
});

app.delete("/api/users/:id", auth.isAuthenticated, async function(req,res) {
	db.users.delete(req.params.id);
	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 res.redirect("/register");
});

//not supposed to be in use
app.delete("/api/relevancies/:id", auth.isAuthenticated, async function(req,res) {
	db.relevancies.delete(req.params.id);
	// backURL=req.header('Referer') || '/';
 //    res.redirect(backURL);
 res.redirect("/");
});

/*///update complete, routes decommissioned
app.get("/api/updatemodel/items", auth.isAuthenticated, async function(req,res) {
	let items = await db.items.all();
	items.forEach((item) => {
		db.items.updateUserModel(req.user, item._id);
	})
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.get("/api/updatemodel/efforts", auth.isAuthenticated, async function(req,res) {
	let items = await db.efforts.all();
	items.forEach((item) => {
		db.efforts.updateUserModel(req.user, item._id);
	})
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.get("/api/updatemodel/categories", auth.isAuthenticated, async function(req,res) {
	let items = await db.categories.all();
	items.forEach((item) => {
		db.categories.updateUserModel(req.user, item._id);
	})
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.get("/api/updatemodel/relevancies", auth.isAuthenticated, async function(req,res) {
	let items = await db.relevancies.all();
	items.forEach((item) => {
		db.relevancies.updateUserModel(req.user, item._id);
	})
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});
*/








//************************* Application *************************//



// app.get("/categories", auth.isAuthenticated, async function(req, res) {
// 	let categories = await db.categories.byUser(req.user);
// 	let relevancies = await db.relevancies.byUser(req.user);
// 	let data = categories;
// 	res.render("categories",{categories:categories, relevancies:relevancies, data:data});
// });

app.get("/efforts", auth.isAuthenticated, async function(req, res) {
	let efforts = await db.efforts.byUserID(req.user._id);
	// console.log(efforts.length);
	for(var i = 0; i < efforts.length; i++) {
		efforts[i] = await db.buildEffortRelations(efforts[i]);
		efforts[i] = await db.populateEffortData(efforts[i]);
	}
	// console.log(efforts);
	res.render("efforts",{efforts: efforts});
});

app.get("/items", auth.isAuthenticated, async function(req, res) {
	let items = await db.items.byUserID(req.user._id);
	var promiseStack = [];

	for(var i = 0; i < items.length; i++) {

		promiseStack.push(db.populateItemData(items[i]));
		promiseStack.push(db.buildItemRelations(items[i]));
		
		// items[i] = await db.buildItemRelations(items[i]);
		// items[i] = await db.populateItemData(items[i]);
	}
	

	// Promise.all(promiseStack).then(function() {
	// 	for(var i = 0; i < items.length; i++) {
	// 		promiseStack.push(db.buildItemRelations(items[i]));
	// 	}
	// });

	
	// Promise.all(promiseStack).then(function() {
	// 	promiseStack = [];
	// });

	// for(var i = 0; i < items.length; i++) {
	// 	promiseStack.push(db.populateItemData(items[i]));
	// }

	Promise.all(promiseStack).then(function() {
		res.render("items",{data:items});
	});
	// console.log(items);
	// res.render("items",{data:items});
});


app.get("/relevancies", auth.isAuthenticated, async function(req, res) {
	let relevancies = await db.relevancies.byUser(req.user);
	let data = relevancies;
	res.render("relevancies",{relevancies:relevancies, data:data});
});

//prohibited
//app.get("/users")



app.get("/calendar/:year/:month/:day", auth.isAuthenticated, async function(req, res) {
	let date = {year: req.params.year,
				month: req.params.month,
				day: req.params.day};
	let efforts = await db.efforts.byDate(req.user._id, req.params.year,req.params.month,req.params.day);

	for(var i = 0; i < efforts.length; i++) {
		let relation = await db.relations.effortItem.byEffort(efforts[i]);
		let item = await db.items.byID(relation.item.id);
		efforts[i].item = item;
	}



	// Promise.all(promiseStack).then(function() {
	// 	backURL=req.header('Referer') || '/';
 //    	res.redirect(backURL);
	// });


	res.render("calendar",{efforts: efforts, date: date});
});



// app.get("/categories/:category", auth.isAuthenticated, async function(req, res) {
// 	let items = await db.items.byCategory(req.params.category);
// 	let relevancies = await db.relevancies.byUser(req.user);
// 	let data = items;
// 	res.render("category",{items:items, category:req.params.category, relevancies:relevancies, data:data});
// });


app.get("/efforts/:effortid", auth.isAuthenticated, async function(req, res) {
	let effort = await db.efforts.byID(req.params.effortid);
	if(effort) {
		res.render("effort",{effort: effort});
	} else {
		req.flash("warning", "No such effort found");
		res.redirect("/efforts");
	}
});

app.get("/efforts/:effortid/edit", auth.isAuthenticated, async function(req, res) {
	let effort = await db.efforts.byID(req.params.effortid);
	let effortofitem = await db.relations.effortItem.byEffort(effort) 
		|| {item: {id:"", label: ""}, effort: {id:effort._id}};;
	let items = await db.items.byUser(req.user);
	if(effort) {
		res.render("effortEdit",{data: {effort: effort, effortofitem: effortofitem, items: items}});
	} else {
		req.flash("warning", "No such effort found");
		res.redirect("/efforts");
	}
});

app.get("/items/:itemlabel", auth.isAuthenticated, async function(req, res) {
	let item = await db.items.byLabel(req.params.itemlabel);


	// var promiseStack = [];

	// promiseStack.push(db.buildItemRelations(item));
	// promiseStack.push(db.populateItemData(item));
	
	// Promise.all(promiseStack).then(function() {
	// 	res.render("item",{data:item});
	// });

	await db.buildItemRelations(item);
	// await db.populateItemData(item);
	res.render("item",{data:item});
});

app.get("/items/:itemlabel/edit", auth.isAuthenticated, async function(req, res) {
	let item = await db.items.byLabel(req.params.itemlabel);
	let parentofchild 	= await db.relations.itemItem.byChild(item)
		|| {parent: {id:"", label: ""}, child: {id:item._id, label:item.label}};
	let items = await db.items.byUser(req.user);
	// let parent = await db.getParent(item);
	// await db.buildItemRelations(item);
	// await db.populateItemData(item);
	res.render("itemEdit",{data:{item: item, parentofchild: parentofchild, items: items}});
});

app.get("/items/:itemlabel/summary", auth.isAuthenticated, async function(req, res) {
	let item = await db.items.byLabel(req.params.itemlabel);


	// var promiseStack = [];

	// promiseStack.push(db.buildItemRelations(item));
	// promiseStack.push(db.populateItemData(item));
	
	// Promise.all(promiseStack).then(function() {
	// 	res.render("itemSummary",{data:item});
	// });


	await db.buildItemRelations(item);
	await db.populateItemData(item);
	res.render("itemSummary",{data:item});
});

app.get("/items/:itemlabel/children", auth.isAuthenticated, async function(req, res) {
	let item = await db.items.byLabel(req.params.itemlabel);

// var promiseStack = [];

// 	promiseStack.push(db.buildItemRelations(item));
// 	promiseStack.push(db.populateItemData(item));
	
// 	Promise.all(promiseStack).then(function() {
// 		res.render("item",{data:item});
// 	});


	await db.buildItemRelations(item);
	await db.populateItemData(item);
	res.render("itemChildren",{data:item});
});

app.get("/items/id/:id", auth.isAuthenticated, async function(req, res) {
	let item = await db.items.byID(req.params.id);
	await db.buildItemRelations(item);
	await db.populateItemData(item);
	res.render("item",{data:item, efforts: item.efforts});
});

app.get("/users/:user", auth.isAuthenticated, async function(req,res){
	let items = await db.items.byUser(req.user);
	if(items) {
		res.locals.items = items;
	}
	let efforts = await db.efforts.byUser(req.user);
	if(efforts) {
		res.locals.efforts = efforts;
	}
	let relevancies = await db.relevancies.byUser(req.user);
	if(relevancies) {
		res.locals.relevancies = relevancies;
	}
	res.render("profile");
});





app.put("/items/:item", auth.isAuthenticated, async function (req, res) {
	let updatedItem = await db.items.byLabelAndUpdate(req.body.item_label);
	// console.log(updatedItem);
    res.redirect("/items/"+req.params.item);
});

// app.put("/items/:item", auth.isAuthenticated, async function (req, res) {
// 	let updatedItem = await db.items.byLabelAndUpdate(req.body.item_label, req.body.item_category);
// 	// console.log(updatedItem);
//     res.redirect("/items/"+req.params.item);
// });

app.put("/relevancies", auth.isAuthenticated, async function (req, res) {
	let updatedRelevancy = await db.relevancies.byLabelAndUpdate(req.user, req.body.relevancy_label, req.body.relevancy_value);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});




app.listen(process.env.PORT || 3000, function() {
	console.log("Help you");
});