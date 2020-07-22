/*
Author: Hassan Alnamer
This is the server for Ostra, a web marketplace. In this server, I will be using
mongoDB to store the info recieved from the user
I have to make two schemas:
1) // Items
{ title: String,
  description: String,
  image: String,
  price: Number,
  stat: String }

2) // User
{ username: String,
  password: String,
  listings: [...list of item its...],
  purchases: [...list of item ids...] }

The requests that I will need to respond to are:
*1) static request:
*2) /get/users/                (GET): a JSON array of all users
*3) /get/items/                (GET): a JSON array of all Items
*4) /get/listings/:USERNAME    (GET): a JSON array of all item for the users
*5) /get/purchases/:USERNAME   (GET): a JSON array of all purchases made by a user
6) /search/users/KEYWORD      (GET): a JSON list of every item whose description has the substring KEYWORD.
*7) /add/user/                 (POST): Should add a user to the database.
                                      The username and password should be sent as POST parameter(s).
*8) /add/item/USERNAME          (POST): The items information (title, description, image, price, status) should be included as POST parameters.
                                      The item should be added the USERNAMEs list of listings.
*/
var express = require ("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var app = express();
var port = 80;

//Set up mongoose

var Schema = mongoose.Schema;
mongoose.connect('mongodb://localhost:27017/market', {
  useUnifiedTopology: true,
  useNewUrlParser: true,});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


//creating the two schemas and linking them through listings and purchases
var itemSchama = new Schema({
  title         : String,
  description   : String,
  image         : String,
  price         : Number,
  stat          : String,
});
var userSchema = new Schema({
  username : String,
  password : String,
  listings : [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
  purchases: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}],
});
//add userSchema getListings(), and getPurchases which return an array of the string names of their items

//create models for those two schemas
var Item = new mongoose.model("Item", itemSchama);
var User = new mongoose.model("User", userSchema);

//setup JSON

app.use(express.static ("public_html"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
This method retuns all the users who are members of this marketplace
*/
app.get("/get/users", function(req, res){
  User.find(function(err, user){
    console.log("server: getting all users");
    for(i in user){
      console.log(user[i]["username"]+"\n");
    }
    res.write(JSON.stringify(user));
    res.end("\n");
  });
});
/*
This method retuns all the items in the market plae
*/
app.get("/get/items/", function(req, res){
  console.log("server: getting all items");
  Item.find(function(err, item){
    for(i in item){
      console.log("description: "+ item[i]["description"])
      console.log(item[i]["title"]+"\n");
    }
    res.write(JSON.stringify(item));
    res.end("\n");
  });
});
/*
This method adds a user to the marketplace. It does so by making a new user object and then saving it
*/
app.post("/add/user/", function(req, res){
  console.log("server: adding user...");
  console.log("username: "+ req.body.user+"pass: "+ req.body.pass);
  let queryCheck = User.findOne({username: req.body.user});
  queryCheck.exec(function(err, user){
    console.log(user);
    if(user != null){
      res.write("Error: user already exist");
      res.end();
      //res.redirect('/index.html');
    }else{
      let newUser = new User(
        {
          username: req.body.user,
          password: req.body.pass,
          listings: [],
          purchases: [],
        });
      newUser.save(function(err, user){
        if(err){console.log(err);}
        res.write("Added user!");
        res.end();
      });
    }
  });
});
/*
This method adds a new listing into the item's list and fetch the user then adds
*/
app.post("/add/item/:userName", function(req, res){
  var userName = req.params.userName;
  console.log("server: adding items for "+ userName);
  let queryCheck = User.findOne({username: userName});
  queryCheck.exec(function(err, user){
      if(user== null){
        res.write("Erorr: user doesn't exist");
        res.end();
      }else{
        let newItem = new Item(
          {
            title: req.body.title,
            description   : req.body.description,
            image         : req.body.image,
            price         : req.body.price,
            stat          : req.body.status,
          });
        let id = newItem._id;
        newItem.save(function(err, item){
          if(err){console.log(err);}
          console.log(req.body.title+ " is saved \n");
        });
        //search for a user with the speicified userName
        let query = User.findOne({"username": userName});
        query.exec(function(err, user){
            user.listings.push(id);
            user.save();
            res.write("Added item!");
            res.end();
        });
      }
  });

});

/*
THis method uses a query to get all the listings for a specific user
*/
app.get("/get/listings/:userName", function(req, res){
  let userName = req.params.userName;
  let query = User.findOne({username: userName});
  console.log("server: getting listings for "+ userName);
  query.exec(function(err, user){
    if(err){console.log(err);}
    if(user == null){
      res.write("Error: user doesn't exist");
      res.end();
    }
    else{
      //console.log("server: found: "+ user.username);
      res.write(JSON.stringify(user.listings));
      res.end();
    }

  });
});
/*
This methos retuns all the purchases for a specific userName
*/
app.get("/get/purchases/:userName", function(req, res){
  let userName = req.params.userName;
  let query = User.findOne({username: userName});
  query.exec(function(err, user){
    if(err){
      console.log(err);
    }
    if(user == null){
      res.write("Error: user doesn't exist");
      res.end();
    }else{
      res.write(JSON.stringify(user.purchases));
      res.end();
    }

  });
});
/*
This function returns all the items that their description contains a substring of the params
*/
app.get("/search/users/:keyWord", function(req, res){
  let keyword =  req.params.keyWord;
  console.log("server: keyword = "+ keyword);
  let query = Item.findOne({
    description: { "$regex": keyword, "$options": "i" }
  });
  query.select("title description image price stat");
  query.exec(function(err, item){
    if(err){
      console.log(err);
    }
    res.write(JSON.stringify(item));
    res.end();
  });
});

app.listen(port, function(){
  console.log("server is live");
});
