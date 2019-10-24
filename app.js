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
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
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
	//retreive items
	// let items 	= await db.items.all();
	let items 	= await db.items.byUserID(req.user._id);
	for(var i = 0; i < items.length; i++) {
		utils.assignPriority(items[i]);
	}
	res.render("index", {items:items});
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

app.get("/api/categories", auth.isAuthenticated, async function(req,res) {
	let categories = await db.categories.byUserID(req.user._id);
	// let categories = await db.categories.all();
	res.send(categories);
});

app.get("/api/efforts", auth.isAuthenticated, async function(req,res) {
	let efforts = await db.efforts.byUserID(req.user._id);
	// let efforts = await db.efforts.all();
	res.send(efforts);
});

app.get("/api/efforts/bytime/:year/:month/:day", auth.isAuthenticated, async function(req,res) {
	let efforts = await db.efforts.byDate(req.user._id, req.params.year,req.params.month,req.params.day);
	// let efforts = await db.efforts.all();
	res.send(efforts);
});

app.get("/api/items", auth.isAuthenticated, async function(req,res) {
	let items = await db.items.byUserID(req.user._id);
	res.render("partials/newitemform2", {data: items});
	// res.send(items);
});

// app.get("/api/items", async function(req,res) {bide
// 	let items = await db.items.all();
// 	res.send(items);
// });

app.get("/api/relevancies", auth.isAuthenticated, async function(req,res) {
	let relevancies = await db.relevancies.byUserID(req.user._id);
	// let relevancies = await db.relevancies.all();

	res.send(relevancies);
});

app.get("/api/users", auth.isAuthenticated, async function(req,res) {
	let users = await db.users.all();
	res.send(users);
});

app.post("/api/categories", auth.isAuthenticated, async function(req,res) {
	let category = await db.categories.save(
		req.body.category_label, 
		req.user);
	db.relevancies.save(req.user, req.body.category_label, 50);
	res.redirect("/categories");
});

app.post("/api/effort", auth.isAuthenticated, async function(req,res) {
	let effort = await db.efforts.save(
		req.body.effort_hours || 0, 
		req.body.effort_minutes || 0, 
		req.body.effort_item, 
		req.body.effort_timestamp || Date.now(), 
		req.user,
		req.body.effort_note);
	res.redirect("/");
});

app.post("/api/items", auth.isAuthenticated, async function(req,res) {
	let item = await db.items.save(
		req.body.item_label, 
		req.body.item_category, 
		req.user,
		req.body.item_parent);
	db.relevancies.save(req.user, req.body.item_label, 99, item);
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

app.post("/api/relevancies", auth.isAuthenticated, async function(req,res) {
	let relevancies = await db.relevancies.save(
		req.user,
		req.body.relevancy_label, 
		req.body.relevancy_value);
	res.redirect("/relevancies");
});



app.put("/api/relevancies", auth.isAuthenticated, async function (req, res) {
	let updatedRelevancy = await db.relevancies.byLabelAndUpdate(
		req.user,
		req.body.relevancy_label,
		req.body.relevancy_value);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.put("/api/efforts/:id", auth.isAuthenticated, async function (req, res) {
	let updatedEffort = await db.efforts.byIdAndUpdate(
		req.body.effort_id,
		req.user,
		req.body.effort_item,
		req.body.effort_hours,
		req.body.effort_minutes,
		req.body.effort_timestamp,
		req.body.effort_note
		);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.put("/api/items/:id", auth.isAuthenticated, async function (req, res) {
	let updatedItem = await db.items.byIDAndUpdate(
		req.body.item_id, 
		req.body.item_user, //not in use
		req.body.item_label,
		req.body.item_category,
		req.body.item_priority);
	// console.log(updatedItem);
    res.redirect("/items/"+req.params.item);
});


app.delete("/api/categories/:id", auth.isAuthenticated, async function(req,res) {
	db.categories.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.delete("/api/efforts/:id", auth.isAuthenticated, async function(req,res) {
	db.efforts.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.delete("/api/items/:id", auth.isAuthenticated, async function(req,res) {
	let itemToDelete = await db.items.delete(req.params.id);
	if(!typeof itemToDelete === 'undefined') {
		let relevancyToDelete = await db.relevancies.byLabel(itemToDelete.label);
		if(!typeof relevancyToDelete === 'undefined') {
			relevancyToDelete.delete();
		}
		itemToDelete.delete();
	}
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.delete("/api/users/:id", auth.isAuthenticated, async function(req,res) {
	db.users.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});


app.delete("/api/relevancies/:id", auth.isAuthenticated, async function(req,res) {
	db.relevancies.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
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



app.get("/categories", auth.isAuthenticated, async function(req, res) {
	let categories = await db.categories.byUser(req.user);
	let relevancies = await db.relevancies.byUser(req.user);
	let data = categories;
	res.render("categories",{categories:categories, relevancies:relevancies, data:data});
});

app.get("/efforts", auth.isAuthenticated, async function(req, res) {
	let efforts = await db.efforts.byUser(req.user);
	res.render("efforts",{efforts: efforts});
});

app.get("/items", auth.isAuthenticated, async function(req, res) {
	// let categories = await db.categories.byUser(req.user);
	let categories = await db.categories.byUserID(req.user._id);
	if(categories) {
		res.locals.categories = categories;
	}
	let items = await db.items.byUserID(req.user._id);
	let relevancies = await db.relevancies.byUserID(req.user._id);
	let data = items;
	console.log(data);
	// console.log("searched relevancies by " + req.user.username + " and found " + relevancies);
	res.render("items",{items:items, relevancies:relevancies, data:data});
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
	res.render("calendar",{efforts: efforts, date: date});
});



app.get("/categories/:category", auth.isAuthenticated, async function(req, res) {
	let items = await db.items.byCategory(req.params.category);
	let relevancies = await db.relevancies.byUser(req.user);
	let data = items;
	res.render("category",{items:items, category:req.params.category, relevancies:relevancies, data:data});
});


app.get("/efforts/:effortid", auth.isAuthenticated, async function(req, res) {
	let effort = await db.efforts.byID(req.params.effortid);
	if(effort) {
		res.render("effort",{effort: effort});
	} else {
		res.redirect("/efforts");
	}
});

app.get("/items/:item", auth.isAuthenticated, async function(req, res) {

	let categories = await db.categories.byUser(req.user);	//LEGACY: SOON DEPRECATED
	if(categories) {										//LEGACY: SOON DEPRECATED
		res.locals.categories = categories;					//LEGACY: SOON DEPRECATED
	}														//LEGACY: SOON DEPRECATED
	let item = await db.items.byLabel(req.params.item);
	let data;
	if(item) {
		data = await db.byItem(item);
		// let relations = await db.relations.byItem(item);
		// if(relations) {
		// 	let parent = await db.items.byID(relations.parent.id);

		// }
	}
	
	// let parent = await db.relations.itemItem.byChild(item);
	// let children = await db.relations.itemItem.byParent(item);
	// let user = await db.relations.itemUser.byItem(item);
	// let effort = await db.relations.EffortItem.byItem(item);
	// let relevancy = await db.relations.RelevancyItem.byItem(item);

	let efforts = await db.efforts.byItem(req.params.item);
	let relevancies = await db.relevancies.byUser(req.user);
	res.render("item",{item:item, efforts: efforts, relevancies:relevancies, data: data});
});

app.get("/users/:user", auth.isAuthenticated, async function(req,res){
	let categories = await db.categories.byUser(req.user);
	if(categories) {
		res.locals.categories = categories;
	}
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
	let updatedItem = await db.items.byLabelAndUpdate(req.body.item_label, req.body.item_category);
	// console.log(updatedItem);
    res.redirect("/items/"+req.params.item);
});

app.put("/relevancies", auth.isAuthenticated, async function (req, res) {
	let updatedRelevancy = await db.relevancies.byLabelAndUpdate(req.user, req.body.relevancy_label, req.body.relevancy_value);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});




app.listen(process.env.PORT || 3000, function() {
	console.log("Help you");
});