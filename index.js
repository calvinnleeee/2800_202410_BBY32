/*
Test file for mockup landing page for 2800 project.

*/

// .env files for local testing
require('dotenv').config();

// Requires, express setup
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const MongoStore = require('connect-mongo');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: false}));

// Env file / Secrets setup
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

// MongoDB setup (maybe move out and use an include to reduce clutter?)
const MongoClient = require("mongodb").MongoClient;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
var database = new MongoClient(atlasURI);
const userCollection = database.db(mongodb_database).collection('users');
var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
});

// Other required variable setup
const saltRounds = 12;    // used for bcrypt password hashing

// Cookies for sessions
const expireTime = 1000 * 60 * 60;  // 1 hour
app.use(session({ 
  secret: node_session_secret,
  store: mongoStore,
  saveUninitialized: false, 
  resave: true
}));


// ---------------------------------------------------------------------------------
// Landing page (Login/Signup)

app.get('/', (req, res) => {
  res.render('index');
});

// ---------------------------------------------------------------------
// Main page(After login)
app.get('/main', (req, res) => {
  res.render('main');
  
});

/*
  Signup submission
  Author: Calvin Lee
  Description: Signup validation and creating a new user in the database.
  Notes: Most of this code was taken from COMP2537 assignment 2 work, with modifications to variables
    our application.
*/
app.post('/signupSubmit', async (req, res) => {
  // user variables
  let id = req.body.id;
  let name = req.body.name;
  let email = req.body.email;
  let pw = req.body.password;
  // let id = req.body.signup-id;
  // var name = req.body.signup-name;
  // var email = req.body.signup-email;
  // var pw = req.body.signup-password;

  // Joi validation done on browser side, move on to next step
  // verify that email and id do not already exist in the database, fail if it does
  const emailExists = (await userCollection.countDocuments({email: email})) > 0 ? true : false;
  const idExists = (await userCollection.countDocuments({userid: id})) > 0 ? true : false;
  if (emailExists) {
    res.render("signupError", {err: "email"});
    return;
  }
  else if (idExists) {
    res.render("signupError", {err: "ID"});
    return;
  }

  // create a new user in db with the provided name, email, and password (after encrypting it)
  var hashedpw = await bcrypt.hash(pw, saltRounds);
  await userCollection.insertOne({ userid: id, username: name, email: email, password: hashedpw });

  // create a session for the user and log them in
  req.session.authenticated = true;
  req.session.name = name;
  req.session.cookie.maxAge = 1000 * 60 * 60 * 24;  // 24 hours
  res.redirect("/main");
  console.log("Submission successful");
  return;
});


/*
  Login submission
  Author: Calvin Lee
  Description: Login submission, checks for an existing record with a given ID and logins in
    if the record's password matches the input password. 
  Notes: Most of this code was taken from COMP2537 assignment 2 work, with modifications to variables
    to match our application.
*/
app.post('/loginSubmit', async (req, res) => {
  // user variables
  let id = req.body.id;
  let pw = req.body.password;

  // search db for a user with given userid
  const result = await userCollection.find({userid: id}).project({username: 1, password: 1}).toArray();

  // if no user was found
  if (result.length != 1) {
    res.render("loginError");
  }
  // password is correct, create a session and log the user in
  else if (await bcrypt.compare(pw, result[0].password)) {
    req.session.authenticated = true;
    req.session.name = result[0].username;
    req.session.cookie.maxAge = expireTime;
    res.redirect("/main");
    console.log("login successful");
    return;
  }
  // otherwise password was wrong
  else {
    res.render("loginError");
    return;
  }
});

// ---------------------------------------------------------------------------------
// Log out button

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/'); // Redirect to the index page
});

// ---------------------------------------------------------------------------------
// 404 - Handle non-existent pages

app.get('*', (req, res) => {
  res.status(404);
  // res.render("404");
});

// ---------------------------------------------------------------------------------
// Listen - run server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});