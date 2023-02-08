var db = require('../models/database.js');

var getMain = function(req, res) { //login.ejs not used
  res.render('main.ejs', {});
};

var getLogin = function(req, res) {
  res.render('login.ejs', {});
};

var getSignup = function(req, res) {
  res.render('signup.ejs', {});
};

var postResults = function(req, res) { //left sample
  var userInput = req.body.myInputField;
  db.lookup(userInput, "german", function(err, data) {
    if (err) {
      res.render('results.ejs', {theInput: userInput, message: err, result: null});
    } else if (data) {
      res.render('results.ejs', {theInput: userInput, message: null, result: data});
    } else {
      res.render('results.ejs', {theInput: userInput, result: null, message: 'We did not find anything'});
    }
  });
};

var checkLogin = function(req, res) { //first check for login
	var usernameInput = req.body.username;
	var passwordInput = req.body.password;
	//got the input
	
	if (usernameInput == "" || passwordInput == "") {
		res.render('main.ejs'); //go back to login page
	}
	
	console.log("about to look up usernameinput: " + usernameInput);
	console.log("about to look up passwordinputinput: " + passwordInput);
	db.userLookup(usernameInput, function(data, err) {
		if (err) {
			console.log("first error reached check login");
			res.render('main.ejs', {message: "error"});
		} else if (data) {
			var databaseUsername = data['username'];
			console.log("username found in database: " + data['username']);
			var databasePassword = data['password'];
				console.log("password found in database: " + data['password']);
			var databaseFullname = data['fullname'];
			console.log("full name found in database: " + data['fullname']);
			
			//check if password is correct
			if (passwordInput == databasePassword) { //go to restaurants
				req.session.username = usernameInput;
				res.redirect('/restaurants');
			} else {
				console.log("second error reached incorrect password");
				res.render('main.ejs', {message: "incorrect password"});
			}
		} else {
			console.log("user not found error");
			res.render('main.ejs', {message: "username not found"});
		}
	})
}

var createAccount = function(req, res) {
	var usernameInput = req.body.username;
	var passwordInput = req.body.password;
	var fullnameInput = req.body.fullname;
	//got the input
	
	//check if lengths are valid - else return to mainpage
	if (usernameInput == "" || passwordInput == "") {
		res.render('signup.ejs'); //go back to login page
	}
	db.addUser(usernameInput, passwordInput, fullnameInput, function(err) {
				if (err == null) {
					req.session.username = usernameInput;
					console.log("redirecting to restaurants");
					res.redirect('/restaurants');
				} else {
					res.redirect({message: "failed create account"}, '/login');
				}
			})
}

var getRestaurants = function(req, res) {
	if (req.session.username == null) { //check to see if there's no session
		res.redirect('/');
	}
	db.restaurantLookup(function(data, err) {
    if (err) {
	  console.log("ran into error (null) when getting restaurants");
      res.render('restaurants.ejs', {message: err, result: null});
    } else if (data  == null) {
		console.log("didn't find restaurants");
        res.render('restaurants.ejs', {message: "didn't find' restaurants", result: null});
    } else { //found restaurants
    	if (req.session.username == null) {
			res.render('/', {message: "not logged in", result: null});
		} else {
			var restaurants = data.keys;
		    console.log("found restaurants");
		    console.log(restaurants);
	        res.render('restaurants.ejs', {message: null, result: restaurants});	
		}
    }
  });
};

var addRestaurant = function(req, res) {
	var usernameInput = req.body.username;
	var latitudeInput = req.body.latitude;
	var longitudeInput = req.body.longitude;
	var descriptionInput = req.body.description;
	var creator = req.session.username;

	//got the input
	
	//check if lengths are valid - else return to mainpage
	if (usernameInput == "" || latitudeInput == "" || longitudeInput == "" || descriptionInput == "") {
		res.render('restaurants.ejs'); //go back to restaurants page
	}
	db.addRestaurant(usernameInput, latitudeInput, longitudeInput, descriptionInput, creator, function(err) {
				if (err == null) {
					console.log("redirecting to restaurants");
					res.redirect('/restaurants');
				} else {
					req.session.username = usernameInput;
					console.log("created, redirected to restaurants")
					res.redirect('/restaurants');
				}
			})
}

var getLogout = function(req, res) {
	req.session.username = null; //changes it to null
	res.redirect('/');
};

var routes = { 
  get_main: getMain,
  get_login: getLogin,
  check_login: checkLogin,
  post_results: postResults,
  get_signup: getSignup,
  create_account: createAccount,
  get_restaurants: getRestaurants,
  add_restaurant: addRestaurant,
  get_logout: getLogout
};

module.exports = routes;
