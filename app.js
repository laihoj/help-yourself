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

// app.use(async function(req, res, next) {
// 	if(req.isAuthenticated())
// 	res.locals.relevances = await db.getRelevanceByUser(req.user.username).relevances;
// 	return next();
// });

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

app.get("/", async function(req, res) {
	//retreive items
	let items 	= await db.items.all();

	items = await utils.sortItemsByTotalEffort(items);
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
		res.redirect(req.session.redirectTo || '/users/' +req.user.username);
		delete req.session.redirectTo;
	}
});


//************************* API *************************//

app.get("/api", function(req, res) {
	res.render("api");
});

app.get("/api/categories", async function(req,res) {
	let categories = await db.categories.all();
	res.send(categories);
});

app.get("/api/efforts", async function(req,res) {
	let efforts = await db.efforts.all();
	res.send(efforts);
});

app.get("/api/items", async function(req,res) {
	let items = await db.items.all();
	res.send(items);
});

app.get("/api/relevances", async function(req,res) {
	let relevances = await db.relevances.all();
	res.send(relevances.relevances);
});

app.get("/api/users", async function(req,res) {
	let relevances = await db.users.all();
	res.send(users);
});

app.post("/api/categories", auth.isAuthenticated, async function(req,res) {
	let category = await db.categories.save(
		req.body.category_label, 
		req.body.category_user);
	db.relevances.add(req.body.category_user, req.body.category_label, 50);
	res.redirect("/categories");
});

app.post("/api/effort", auth.isAuthenticated, async function(req,res) {
	let effort = await db.efforts.save(
		req.body.effort_hours, 
		req.body.effort_minutes, 
		req.body.effort_item, 
		req.body.effort_timestamp || Date.now(), 
		req.body.effort_user);
	res.redirect("/efforts");
});

app.post("/api/items", auth.isAuthenticated, async function(req,res) {
	let item = await db.items.save(
		req.body.item_label, 
		req.body.item_category, 
		req.body.item_user);
	db.relevances.add(req.body.item_user, req.body.item_label, 50);
	res.redirect("/items");
});

app.post("/api/users", async function(req,res){
	let user = await db.users.save(req.body.username, req.body.password);
	if(user) {
		passport.authenticate("local")(req, res, function() {
			res.redirect(req.session.redirectTo || '/users/' +req.user.username);
			delete req.session.redirectTo;
		});
	} else {
		res.redirect("/");
	}
});
/*does not reflect current model*/
// app.post("/api/relevance", auth.isAuthenticated, async function(req,res) {
// 	let relevance = await db.saveRelevance(
// 		req.body.relevance_value, 
// 		req.body.relevance_item, 
// 		req.body.relevance_user);
// 	res.redirect("/relevance");
// });




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
	db.items.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.delete("/api/users/:id", auth.isAuthenticated, async function(req,res) {
	db.users.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

app.delete("/api/relevances/:id", auth.isAuthenticated, async function(req,res) {
	db.relevances.delete(req.params.id);
	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});



//************************* Application *************************//



app.get("/categories", auth.isAuthenticated, async function(req, res) {
	let categories = await db.categories.byUser(req.user.username);
	let relevances = await db.relevances.byUser(req.user.username);
	res.render("categories",{categories:categories, relevances:relevances.relevances});
});

app.get("/efforts", auth.isAuthenticated, async function(req, res) {
	let efforts = await db.efforts.byUser(req.user.username);
	res.render("efforts",{efforts: efforts});
});

app.get("/items", auth.isAuthenticated, async function(req, res) {
	let categories = await db.categories.byUser(req.user.username);
	if(categories) {
		res.locals.categories = categories;
	}
	let items = await db.items.byUser(req.user.username);
	let relevances = await db.relevances.byUser(req.user.username);
	res.render("items",{items:items, relevances:relevances.relevances});
});

app.get("/relevances", auth.isAuthenticated, async function(req, res) {
	let relevances = await db.relevances.byUser(req.user.username);
	res.render("relevances",{relevances:relevances.relevances});
	// res.render("relevances");
});

//prohibited
//app.get("/users")





app.get("/categories/:category", auth.isAuthenticated, async function(req, res) {
	let items = await db.items.byCategory(req.params.category);
	let relevances = await db.relevances.byUser(req.user.username);
	res.render("category",{items:items, category:req.params.category, relevances:relevances.relevances});
	// res.render("category",{items:items});
});


app.get("/efforts/:effortid", auth.isAuthenticated, async function(req, res) {
	let effort = await db.efforts.byID(req.params.effortid);
	res.render("effort",{effort: effort});
});

app.get("/items/:item", auth.isAuthenticated, async function(req, res) {
	let categories = await db.categories.byUser(req.user.username);
	if(categories) {
		res.locals.categories = categories;
	}
	let item = await db.items.byLabel(req.params.item);
	let efforts = await db.efforts.byItem(req.params.item);
	let relevances = await db.relevances.byUser(req.user.username);

	res.render("item",{item:item, relevances:relevances.relevances, efforts: efforts});
});

app.get("/users/:user", auth.isAuthenticated, async function(req,res){
	let categories = await db.categories.byUser(req.user.username);
	if(categories) {
		res.locals.categories = categories;
	}
	let items = await db.items.byUser(req.user.username);
	if(items) {
		res.locals.items = items;
	}
	let efforts = await db.efforts.byUser(req.user.username);
	if(efforts) {
		res.locals.efforts = efforts;
	}
	let relevances = await db.relevances.byUser(req.user.username);
	if(relevances) {
		res.locals.relevances = relevances;
	}
	res.render("profile");
});





app.put("/items/:item", auth.isAuthenticated, async function (req, res) {
	let updatedItem = await db.itesm.byLabelAndUpdate(req.body.item_label, req.body.item_category);
	// console.log(updatedItem);
    res.redirect("/items/"+req.params.item);
});

app.put("/relevances", auth.isAuthenticated, async function (req, res) {
	let updatedRelevance = await db.relevances.byUserAndUpdate(req.user.username, req.body);

	backURL=req.header('Referer') || '/';
    res.redirect(backURL);
});

// app.put("/relevances/newrelevance", auth.isAuthenticated, function (req, res) {
// 	let relevance = db.addRelevance(
// 		req.user.username,
// 		req.body.relevance_key, 
// 		req.body.relevance_value);
//     res.redirect("/relevances");
// });






app.listen(process.env.PORT || 3000, function() {
	console.log("Help you");
});