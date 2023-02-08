var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var db = new AWS.DynamoDB();


/* The function below is an example of a database method. Whenever you need to 
   access your database, you should define a function (myDB_addUser, myDB_getPassword, ...)
   and call that function from your routes - don't just call DynamoDB directly!
   This makes it much easier to make changes to your database schema. */

var myDB_lookup = function(searchTerm, language, callback) {
  console.log('Looking up: ' + searchTerm); 

  var params = {
      KeyConditions: {
        keyword: {
          ComparisonOperator: 'EQ',
          AttributeValueList: [ { S: searchTerm } ]
        }
      },
      TableName: "words",
      AttributesToGet: [ 'German' ]
  };

  db.query(params, function(err, data) {
    if (err || data.Items.length == 0) {
      callback(err, null);
    } else {
      callback(err, data.Items[0].German.S);
    }
  });
}

var user_lookup = function(usernameRequested, callback) {
	var docClient = new AWS.DynamoDB.DocumentClient();
	console.log('Looking up: ' + usernameRequested);
	var params = {
		TableName: "users",
		Key: {
			"username": usernameRequested
		},
  };
  
  docClient.get(params, function(err, data) {
    if (err) {
	  console.log('error when getting item');
      callback(err, null);
    } else {
	  console.log("Success");
	  console.log(data);
      callback(data.Item);
    }
  }); 
}

var add_user = function(username, password, fullname, callback) {
	var docClient = new AWS.DynamoDB.DocumentClient();
	console.log("adding username: " + username);
	console.log("adding password: " + password);
	console.log("adding fullname: " + fullname)
	var params = {
		TableName: "users",
		Item: {
			"username" : username,
			"password" : password,
			"fullname" : fullname
		}
	}
	console.log("created params for add user");
	docClient.put(params, function(err, data){
		if (err) {
			console.log("error adding user", err);	
			callback(err);
		} else {
			console.log("Success - added user", data);
			callback(null);
		}
	});
}

var restaurant_lookup = function(callback) {
	var docClient = new AWS.DynamoDB.DocumentClient();
	console.log('Looking up restaurants');
	var params = {
    	TableName: "restaurants"
    };
	  docClient.scan(params, function(err, data) {
	    if (err || data.Items.length == 0) {
	      callback(null, err);
	    } else {
		  console.log("Successfully scanned restaurants");
		  console.log(data);
	      callback({keys : data}, null);
	    }
	  }); 
}

var add_restaurant = function(name, latitude, longitude, description, creator, callback) {
	var docClient = new AWS.DynamoDB.DocumentClient();
	console.log("adding restaurant: " + name);
	var params = {
		TableName: "restaurants",
		Item: {
			"name" : name,
			"latitude" : latitude,
			"longitude" : longitude,
			"description" : description,
			"creator" : creator
		}
	}
	console.log("created params for add restaurant");
	docClient.put(params, function(err, data){
		if (err) {
			console.log("error adding restaurant", err);	
			callback(err);
		} else {
			console.log("Success - added restaurant", data);
			callback(null);
		}
	});
}


/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

var database = { 
  lookup: myDB_lookup,
  userLookup: user_lookup,
  addUser: add_user,
  restaurantLookup: restaurant_lookup,
  addRestaurant: add_restaurant
};

module.exports = database;
                                        