

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
app.use(express.static("public"));
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


app.get("/", async function(req, res) {
	let items = await db.items();
	res.render("index", {items:items});
	// res.send(items);
	// request("http://" + domain + "/api/items", function(err, response, body) {
		// res.render("index",{items:JSON.parse(body)});
	// });
	// res.render("index");
});


app.get("/api/categories", async function(req,res) {
	let categories = await db.categories();
	res.send(categories);
});

app.get("/api/items", async function(req,res) {
	let items = await db.items();
	res.send(items);
});

app.get("/api/efforts", async function(req,res) {
	let efforts = await db.efforts();
	res.send(efforts);
});

app.get("/api/relevances", async function(req,res) {
	let relevances = await db.relevances();
	res.send(relevances);
});

app.post("/api/categories", auth.isAuthenticated, async function(req,res) {
	let category = await db.saveCategory(
		req.body.category_label, 
		req.body.category_user);
	res.send(category);
});

app.post("/api/items", auth.isAuthenticated, async function(req,res) {
	let item = await db.saveItem(
		req.body.item_label, 
		req.body.item_category, 
		req.body.item_user);
	res.send(item);
});

app.post("/api/effort", auth.isAuthenticated, async function(req,res) {
	let effort = await db.saveEffort(
		req.body.effort_hours, 
		req.body.effort_minutes, 
		req.body.effort_item, 
		req.body.effort_user);
	res.send(effort);
});

app.post("/api/relevance", auth.isAuthenticated, async function(req,res) {
	let relevance = await db.saveRelevance(
		req.body.relevance_value, 
		req.body.relevance_item, 
		req.body.relevance_user);
	res.send(relevance);
});

app.get("/api", function(req, res) {
	res.render("api");
});


app.get("/items", auth.isAuthenticated, async function(req, res) {
	let categories = await db.getCategoriesByUser(req.user.username);
	if(categories) {
		res.locals.categories = categories;
	}
	request("http://" + domain + "/api/items", function(err, response, body) {
		res.render("items",{items:JSON.parse(body)});
	});
});

app.get("/categories", function(req, res) {
	request("http://" + domain + "/api/categories", function(err, response, body) {
		res.render("categories",{categories:JSON.parse(body)});
	});
});

app.post("/users", async function(req,res){
	let user = await db.saveUser(req.body.username, req.body.password);
	if(user) {
		passport.authenticate("local")(req, res, function() {
			res.redirect(req.session.redirectTo || '/users/' +req.user.username);
			delete req.session.redirectTo;
		});
	} else {
		res.redirect("/");
	}
});

app.get("/users/:user", auth.isAuthenticated, async function(req,res){
	let categories = await db.getCategoriesByUser(req.user.username);
	if(categories) {
		res.locals.categories = categories;
	}
	let items = await db.getItemsByUser(req.user.username);
	if(items) {
		res.locals.items = items;
	}
	let efforts = await db.getEffortsByUser(req.user.username);
	if(efforts) {
		res.locals.efforts = efforts;
	}
	let relevances = await db.getRelevancesByUser(req.user.username);
	if(relevances) {
		res.locals.relevances = relevances;
	}
	res.render("profile");
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

app.listen(process.env.PORT || 3000, function() {
	console.log("Help you");
});