
//REQUIREMENTS ==================================================================
var path = require("path");	
var express = require ("express");
var ejs = require("ejs");
var request = require("request");
var app = express();
var passport = require("passport");
var bodyParser  = require("body-parser");
var mongoose = require ("mongoose");
var LocalStrategy = require("passport-local");
var Post = require ("./models/post");
var Comment = require("./models/comment");
var User = require("./models/user");
var sessions = require("client-sessions")



//APP CONFIG ====================================================================

mongoose.connect('mongodb://localhost/blogApp_DB', {useNewUrlParser: true });
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set ("view engine", "ejs");




//PASSPORT CONFIG ================================================================

app.use(require("express-session")({
	secret: "Prince of Denmark is dead.",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});


//LOGIN & REGISTER ================================================================

app.get("/login", function(req, res){
	Post.find({}, function(err, allPosts){
		if (err){
			console.log (err);
		}else {
			res.render("login");
		}
	});
	
});

app.get("/register", function(req, res){
	Post.find({}, function(err, allPosts){
		if (err){
			console.log (err);
		}else {
			res.render("register");
		}
	});
	
});

app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if (err){
			console.log(err);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req,res, function(){
			res.redirect("/");
		});
	});
	
});


//login & logout =====

app.post("/login", passport.authenticate("local", {
	successRedirect : "/",
	failureRedirect : "/login"
}), function(req, res){	
});

function isLoggedIn (req,res,next){
	if(req.isAuthenticated()){
		return next();
	}else {
		res.redirect("/login");
	}
}


app.post("/logout", function(req,res){
	req.logout();
	res.redirect("/");
});


//LANDING PAGE ====================================================================

app.get("/", function(req, res){
	Post.find({}, function(err, allPosts){
		if (err){
			console.log (err);
		} else {
			res.render("landing", {posts: allPosts});
		}
	});
	
});


//under construction
app.get ("/UC", function(req,res){
	res.render("UC")
});



// CREATE & DELETE ================================================================


app.get ("/new", isLoggedIn, function (req, res){
	res.render("new")
});




app.post("/new", isLoggedIn, function (req,res) {
	var newPost = {
		username: req.user.username,
		authorID: req.user._id,
		artist: req.body.artist,
		title: req.body.title,
		image: req.body.image,
		content: req.body.content
		
	}
	Post.create (newPost, function(err, post){
		if (err){
			console.log (err);
			res.render("new");
		}else{
			res.redirect("/");
		}
	});

});


app.post ("/show/:id", isLoggedIn, function(req, res){
	Post.findByIdAndRemove(req.params.id, function(err){
		if (err){
			console.log(err);
			res.redirect("/");
		}else {
			console.log("post deleted!");
			res.redirect("/");
		}
	});
});



// UPDATE =========================================================================

app.get("/show/:id/edit", isLoggedIn, function(req, res){
	Post.findById(req.params.id, function(err, post){
		if(err){
			console.log(err)
			res.redirect("/show/"+req.params.id);
		}else {
			res.render("edit", {post:post});
		}
	});
});



app.post("/show/:id/edit", isLoggedIn, function (req,res){
	Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, post){
		if (err){
			console.log(err);
			res.redirect("/");
		}else {
			res.redirect("/show/"+req.params.id);

		}
	});
});

//SEARCH ============================================================================

app.get ("/search", function(req,res){
	request("http://ws.audioscrobbler.com/2.0/?method=album.search&api_key=<key_removed>&format=json&album="+req.query.term, function(error, response, body){
		if(!error && response.statusCode == 200){
			var data = JSON.parse(body)
			res.render ("search", {data: data});
		}
	});
});


//SHOW PAGE =========================================================================

app.get ("/show/:id", function(req, res){
	Post.findById(req.params.id).populate("comments").exec(function(err, foundPost){
		if (err){
			res.redirect("/");
		}else{
			res.render("show", {post: foundPost});
		}
	});
});	



//COMMENTS ===========================================================================


app.post ("/show/:id/comment", isLoggedIn, function(req, res){
	Post.findById(req.params.id, function(err, post){
		if (err){
			console.log (err);
			redirect("/show");
		}else {
			Comment.create({
				user: (req.user.username),
				userID: (req.user._id),
				text : (req.body.comment)
			}, function(err, comment){
				if(err){
					console.log("error");
				}else {
					post.comments.push(comment);
					post.save();
					res.redirect("/show/"+req.params.id);
				}
			});
		}
	});
});



//edit request
app.get("/show/:post_id/comments/:comment_id/edit", OwnsCom, function(req, res){
	Post.findById(req.params.post_id, function(err, post){
		if(err){
			console.log(err);
			
		}else{
			Comment.findById(req.params.comment_id, function(err, foundCom){
				if (err){
					console.log(err)
					res.redirect("/show/"+req.params.post_id);
				}else {
					res.render("comEdit", {post: post, foundCom: foundCom});
				}
			});
		}
	});
});


//update
app.post("/show/:id/comments/:comment_id/edit", OwnsCom, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, com){
		if(err){
			console.log(err);
			res.redirect("/show/"+req.params.id);
		}else{
			console.log(com);
			res.redirect("/show/"+req.params.id);
		}
	});
});



//destroy
app.post("/show/:id/comments/:comment_id/delete", OwnsCom, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err, com){
		if (err){
			console.log("comment not deleted!");
		}else {
			console.log("comment deleted!");
			res.redirect("/show/"+req.params.id);
		}
	});
});



function OwnsCom (req,res,next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundCom){
			if (err){
				res.redirect("back");
			}else{
				if(foundCom.userID == req.user._id || req.user.isAdmin){
					next();
				}else {
					res.redirect("back");
				}
			}
		});
	}else{
		res.redirect("back");
	}	
}



//PORT ==============================================================================

app.listen (3000, function(){
	console.log ("Server is up!");
})
