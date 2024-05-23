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
const google_client_id = process.env.GOOGLE_CLIENT_ID;
const google_client_secret = process.env.GOOGLE_CLIENT_SECRET;
const google_refresh_token = process.env.GOOGLE_REFRESH_TOKEN;
const google_user = process.env.GOOGLE_USER;
// const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

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

// Check if user's session is valid
function isValidSession(req) {
	return req.session.authenticated === true;
}

// ---------------------------------------------------------------------------------
// Landing page (Login/Signup)

/*
  Index/landing page
  Author: Calvin Lee
  Description: The main page for the root URL.
*/
app.get('/', (req, res) => {
  // redirect if there is already a valid session
  if (isValidSession(req)) {
    res.redirect('/main');
    return;
  }
  res.render('index');
  return;
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
  // search db for a user with given userid
  const result = await userCollection.find({userid: id}).project({username: 1, password: 1, email: 1, userid: 1,}).toArray();

  // create a session for the user and log them in
  req.session.authenticated = true;
  req.session.name = name;
  req.session.name = result[0].username;
  req.session.email = result[0].email;
  req.session.userid = result[0].userid;
  req.session.cookie.maxAge = 1000 * 60 * 60 * 24;  // 24 hours
  res.redirect("/main");
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
  const result = await userCollection.find({userid: id}).project({username: 1, password: 1, email: 1, userid: 1,}).toArray();

  // if no user was found
  if (result.length != 1) {
    res.render("loginError");
    return;
  }
  // password is correct, create a session and log the user in
  else if (await bcrypt.compare(pw, result[0].password)) {
    req.session.authenticated = true;
    req.session.name = result[0].username;
    req.session.cookie.maxAge = expireTime;
    req.session.email = result[0].email;
    req.session.userid = result[0].userid;
    res.redirect("/main");
    return;
  }
  // otherwise password was wrong
  else {
    res.render("loginError");
    return;
  }
});

/*
  Forgot password submission
  Author: Calvin Lee
  Description: Forgot password submission, check the database for an account with the provided
    email, and if it exists, send them an email with a new password and instructions for reset.
*/
app.post('/forgotSubmit', async (req, res) => {
  let email = req.body.email;

  // search the db to see if a user with the provided email exists
  const result = await userCollection.find({email: email}).project({userid: 1}).toArray();

  // if a user was found, reset their password and send them an email
  if (result.length == 1) {
    let userid = result[0].userid;
    
    // generate a random 6-character password
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let newPw = '';
    for (let i = 0; i < 6; i++) {
      newPw += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log("The new password is '" + newPw + "'");
    let hashedPw = await bcrypt.hash(newPw, saltRounds);
    userCollection.updateOne({email: email}, {$set: {password: hashedPw}});

    // this section done with help from video in COMP2800 tech gems (https://youtu.be/18qA61bpfUs)
    const nodemailer = require("nodemailer");
    const { google } = require("googleapis");
    const OAuth2 = google.auth.OAuth2;
    
    const OAuth2_client = new OAuth2(google_client_id, google_client_secret, "http://localhost:3000/");
    OAuth2_client.setCredentials({refresh_token: `${google_refresh_token}`});
    let accessToken = await OAuth2_client.getAccessToken();

    let transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: `${google_user}`,
        clientId: `${google_client_id}`,
        clientSecret: `${google_client_secret}`,
        refreshToken: `${google_refresh_token}`,
        accessToken: `${accessToken}`
      }
    });

    let mail_options = {
      from: `The Carbon Cap <${google_user}>`,
      to: `${email}`,
      subject: `The Carbon Cap - Password Reset`,
      text: `Hello user! The password for your account '${userid}' has been reset to '${newPw}'. 
      Please log in with this new password and go to your profile settings to change your password.`
    };

    transport.sendMail(mail_options, (err, result) => {
      if (err) {
        console.log("Error: ", err);
      }
      else {
        console.log("Result: ", result);
      }
      transport.close();
    });
  }
  // whether or not there was a user or not, render the resetPw.ejs to tell the user that
  // an email has been sent if the account exists.
  res.render('resetPw');
  return;
});

// ---------------------------------------------------------------------------------
// After login / Navigation from navbar

/*
  Main page load
  Author: Brian Diep
  Description: Connect to the main page after logging in, or if there's already a
    valid session. Redirect to the login page if there's no existing session.
*/
app.get('/main', (req, res) => {
  if (isValidSession(req)) {
		let name = req.session.name;
		// If user is logged in, render the 'index' page for welcome message
    res.render('main', {name: name});
    return;
  }
  else {
    res.redirect('/');
    return;
  }
});


// app.get('/dash', (req, res) => {

//   res.render('dash');
// });


// app.get('/devices', (req, res) => {

//   res.render('devices');
// });


// app.get('/settings', (req, res) => {

//   res.render('settings');
// });


// ---------------------------------------------------------------------------------
// Pages from the hamburger menu

/*
  Profile page
  Author: Brian Diep
  Description: Access to the profile page for editing user information, from the
    hamburger menu.
*/
app.get('/profile', (req, res) => {
  let name = req.session.name;
  let userid = req.session.userid;
  let email = req.session.email;
  if (isValidSession(req)) {
      // If logged in, render the 'profile' page
      res.render('profile', { name: name, userid: userid, email: email });
      return;
  }
  else {
      // If not logged in, redirect to the login page
      res.redirect('/login');
      return;
  }
});

// ---------------------------------------------------------------------------------
// Profile Update

app.post('/updateProfile', async (req, res) => {
  let errorMessage = '';
  let successMessage = '';
  // Extract and log old user details
  let oldUserId = req.session.userid;
  let oldName = req.session.name;
  let oldEmail = req.session.email;
  let oldPw = req.body.oldPassword;
  console.log('-------CURRENT-------');
  console.log('Old UserID:', oldUserId);
  console.log('Old Name:', oldName);
  console.log('Old Email:', oldEmail);
  console.log('Old Password:', oldPw);
  console.log('--------NEW--------');

  // Extract new user details from request body
  let newUserId = req.body.userId;
  let newName = req.body.name;
  let newEmail = req.body.email;
  let newPw = req.body.newPassword;
  console.log('New UserID:', newUserId);
  console.log('New Name:', newName);
  console.log('New email:', newEmail);
  console.log('New Password:', newPw);
  console.log('---------------------');

  // Update password if new password is provided
  if (newPw) {
    let email = req.session.email;
    const user = await userCollection.findOne({ email: email });

    // If user exists and old password matches the stored password
    if (user && await bcrypt.compare(oldPw, user.password)) {
        console.log('User Password:', user.password); // Log the hashed password from the database

        // Check if the new password is the same as the old password
        if (await bcrypt.compare(newPw, user.password)) {
            errorMessage = 'The new password cannot be the same as the old password.';
            return res.render('profile', { errorMessage: errorMessage, userid: user.userid, name: user.name, email: user.email });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPw, saltRounds);
        console.log('Hashed New Password:', hashedNewPassword); // Log the hashed new password

        // Update the user's password in the database
        await userCollection.updateOne({ email: req.session.email }, { $set: { password: hashedNewPassword } });
        successMessage += 'Succesfully updated! ';
    } else {
        errorMessage = 'Current password is incorrect.';
        return res.render('profile', { errorMessage: errorMessage, userid: user.userid, name: user.name, email: user.email });
    }
}

  // Update name if new name is provided
  if (newName) {
      await userCollection.updateOne({ username: oldName }, { $set: { username: newName } });
      // Update the session with the new name
      req.session.name = newName;
      successMessage += 'Succesfully updated! ';
  }

  // Update email if new email is provided
  // Check if a new email is provided and doesn't already exist
  if (newEmail) {
    const emailExists = await userCollection.countDocuments({ email: newEmail }) > 0;
    if (!emailExists) {
        await userCollection.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
        req.session.email = newEmail;
        successMessage += 'Succesfully updated! ';
    } else {
        const user = await userCollection.findOne({ email: oldEmail }); // Fetch user details again if needed
        const errorMessage = "An account is already associated with this E-mail";
        res.render('profile', {
            errorMessage: errorMessage,
            userid: oldUserId, 
            name: oldName, 
            email: oldEmail, 
        });
        return;
    }
}

// Check if the new user ID already exists
const idExists = await userCollection.countDocuments({ userid: newUserId }) > 0;
if (newUserId && !idExists) {
    await userCollection.updateOne({ userid: oldUserId }, { $set: { userid: newUserId } });
    req.session.userid = newUserId;
    successMessage += 'Succesfully updated! ';
} else if (newUserId && idExists) {
    const user = await userCollection.findOne({ email: oldEmail }); // Fetch user details again if needed
    const errorMessage = "An account is already associated with this User ID";
    res.render('profile', {
        errorMessage: errorMessage,
        userid: oldUserId, 
        name: oldName, 
        email: oldEmail, 
    });
    return;
}

if (!errorMessage) {
  res.render('profile', { successMessage, userid: req.session.userid, name: req.session.name, email: req.session.email });
}
});

// ---------------------------------------------------------------------------------
// Log out button

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/'); // Redirect to the index page
  return;
});

// ---------------------------------------------------------------------------------
// 404 - Handle non-existent pages

app.get('*', (req, res) => {
  res.status(404);
  res.render("404");
  return;
});

// ---------------------------------------------------------------------------------
// Listen - run server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
