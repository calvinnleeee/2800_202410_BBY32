/*
  Index.js, server-side code for BBY32, COMP2800 project.
  Project members:
    Anna Dao
    Brian Diep
    Calvin Lee
    Ethan Nguyen
*/

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
app.use(express.urlencoded({ extended: false }));

// .env / secrets setup
require('dotenv').config();
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

// MongoDB setup 
const MongoClient = require("mongodb").MongoClient;
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
var database = new MongoClient(atlasURI);
const userCollection = database.db(mongodb_database).collection('users');
var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: { secret: mongodb_session_secret }
});

// Other required variable setup
const saltRounds = 12;

// Cookies for sessions
const expireTime = 1000 * 60 * 60 * 24; // 24 hours
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

// Set up navbars for pages after login
app.use('/', setupNav);

// ---------------------------------------------------------------------------------
// Landing page (Login/signup)

/*
  Index/landing page
  Author: Calvin Lee
  Description: The main page for the root URL, containing the login and signup forms.
*/
app.get('/', (req, res) => {
  // Redirect if there is already a valid session
  if (isValidSession(req)) {
    res.redirect('/main');
    return;
  }
  res.render('login');
  return;
});


/*
  Signup submission
  Author: Calvin Lee
  Description: Signup validation and creating a new user in the database.
  Notes: Most of this code was taken from COMP2537 assignment 2 work, with modifications to
    variables to fit our application.
*/
app.post('/signupSubmit', async (req, res) => {
  // User variables
  let id = req.body.id;
  let name = req.body.name;
  let email = req.body.email;
  let pw = req.body.password;

  // Joi validation done on browser side, move on to next step
  // Verify that email and id do not already exist in the database, fail if it does
  const emailExists = (await userCollection.countDocuments({email: email})) > 0 ? true : false;
  const idExists = (await userCollection.countDocuments({userid: id})) > 0 ? true : false;
  if (emailExists) {
    res.render("signupError", { err: "email" });
    return;
  }
  else if (idExists) {
    res.render("signupError", { err: "ID" });
    return;
  }

  // Create a new user in db with the provided name, email, and password (after encrypting it)
  var hashedpw = await bcrypt.hash(pw, saltRounds);
  await userCollection.insertOne({
    userid: id,
    username: name,
    email: email,
    password: hashedpw,
    user_devices: [],
  });
  // Search db for a user with given userid
  const result = await userCollection.find({userid: id})
    .project({username: 1, password: 1, email: 1, userid: 1,}).toArray();

  // Create a session for the user and log them in
  req.session.authenticated = true;
  req.session.name = name;
  req.session.email = result[0].email;
  req.session.userid = result[0].userid;
  req.session.cookie.maxAge = expireTime;
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
  // User variables
  let id = req.body.id;
  let pw = req.body.password;

  // Search db for a user with given userid
  const result = await userCollection.find({userid: id}).project({username: 1, password: 1, email: 1, userid: 1,}).toArray();

  // If no user was found
  if (result.length != 1) {
    res.render("loginError");
    return;
  }
  // Password is correct, create a session and log the user in
  else if (await bcrypt.compare(pw, result[0].password)) {
    req.session.authenticated = true;
    req.session.name = result[0].username;
    req.session.cookie.maxAge = expireTime;
    req.session.email = result[0].email;
    req.session.userid = result[0].userid;
    res.redirect("/main");
    return;
  }
  // Otherwise password was wrong
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

  // Search the db to see if a user with the provided email exists
  const result = await userCollection.find({email: email}).project({userid: 1}).toArray();

  // If a user was found, reset their password and send them an email
  if (result.length == 1) {
    let userid = result[0].userid;
    
    // Generate a random 6-character password
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let newPw = '';
    for (let i = 0; i < 6; i++) {
      newPw += chars[Math.floor(Math.random() * chars.length)];
    }
    let hashedPw = await bcrypt.hash(newPw, saltRounds);
    userCollection.updateOne({ email: email }, { $set: { password: hashedPw } });

    // This section done with help from video in COMP2800 tech gems (https://youtu.be/18qA61bpfUs)
    const nodemailer = require("nodemailer");
    const { google } = require("googleapis");
    const OAuth2 = google.auth.OAuth2;

    const OAuth2_client = new OAuth2(google_client_id, google_client_secret, "http://localhost:3000/");
    OAuth2_client.setCredentials({ refresh_token: `${google_refresh_token}` });
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
  // Whether or not there was a user or not, render the resetPw.ejs to tell the user that
  //  an email has been sent if the account exists.
  res.render('resetPw');
  return;
});


// ---------------------------------------------------------------------------------
// Main page (After login)

/*
  Main page after login.
  Author: Brian Diep
  Description: The main page after the user logs in. If the user has a device display
    the summary section; else, display instructions. Summary section will display
    totalkWh and totalCosts with a message 
*/
app.get('/main', async (req, res) => {
  if (isValidSession(req)) {
    let name = req.session.name;
    let email = req.session.email;

    try {
      // Retrieve the user's document from the collection
      const user = await userCollection.findOne({ email: email });

      // Check if the user exists
      if (!user) {
        res.status(404).send("User not found");
        return;
      }

      // Extract the user_devices array from the user doc
      const userDevices = user.user_devices;

      if (userDevices && userDevices.length > 0) {
        // If the user has devices, calculate total kWh
        let totalKwh = 0;
        userDevices.forEach(device => {
          if (device.usage) {
            const kWh = parseInt(device.kWh);
            const usage = parseInt(device.usage);
            totalKwh += kWh * usage;
          }
          else {
            const kWh = parseInt(device.kWh);
            totalKwh += kWh;
          }
        });

        // Calculate total cost
        // $0.114 is 11.4 cents 
        const costPerKwh = 0.114; 
        const totalCost = totalKwh * costPerKwh;

        // Render the main page with the total kWh and total cost
        res.render('main', { name: name, totalKwh: totalKwh, totalCost: totalCost });
      }
      else {
        // If the user doesn't have devices, render the main page with a "Get started" message
        res.render('main', {
          name: name,
          message: "Get started by adding your devices!", devicesLink: "/devices"
        });
      }
    }
    catch (error) {
      console.error("Error retrieving user data:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  else {
    res.redirect('/'); 
  }
});


/*
  Author: Calvin Lee
  Description: Load the list of possible devices from the database for the user to search
    from when adding a new device
*/
app.get('/loadDevices', async (req, res) => {
  const deviceCollection = database.db("devices").collection('appliances');
  const data = await deviceCollection.find({})
    .project({_id: 0, name: 1, min: 1, max: 1}).toArray();

  res.json(data);
  return;
});


/*
  Device page load
  Author: Calvin Lee
  Description: Take a user's list of devices, stored in the database under their document,
    and load it into the page to show the user their devices.
*/
app.get('/devices', async (req, res) => {
  // Load the user's list of devices and store it in an array
  let userid = req.session.userid;
  let userDevices = await userCollection.find({userid: userid}).project({_id: 0, user_devices: 1}).toArray();

  if (!userDevices || !userDevices[0].user_devices) {
    userDevices = [];
  }
  else {
    userDevices = userDevices[0].user_devices;
  }
  
  res.render('devices', {deviceList: userDevices});
  return;
});


/*
  New device submission
  Author: Calvin Lee
  Description: Add a new device to the user's list of current devices in the database.
*/
app.get('/addDevice', async (req, res) => {
  // Get the device attributes from the query
  let newName = decodeURIComponent(req.query.device);
  let newKWH = decodeURIComponent(req.query.kwh);
  let userid = req.session.userid;

  // Get the user's current list of devices
  let prevDeviceList = await userCollection.find({userid: userid}).project({user_devices: 1}).toArray();
  if (prevDeviceList.length < 1) {
    prevDeviceList = undefined;
  }
  else {
    prevDeviceList = prevDeviceList[0].user_devices;
  }

  let newDeviceList = [];
  // If the user has no previous list of devices
  if (!prevDeviceList) {
    newDeviceList = [{ name: newName, kWh: newKWH }];
  }
  // If a previous list exists
  else {
    newDeviceList = prevDeviceList.concat({ name: newName, kWh: newKWH });
  }

  await userCollection.updateOne({ userid: userid }, { $set: { user_devices: newDeviceList } });

  res.redirect('/devices');
  return;
});


/*
  Edit device submission
  Author: Calvin Lee
  Description: Edit a user's device in the database to update its kWh rating
*/
app.get('/editDevice', async (req, res) => {
  // Get the device to edit's attributes from the query
  let deviceName = decodeURIComponent(req.query.device);
  let newKWH = decodeURIComponent(req.query.kwh);
  let userid = req.session.userid;

  // Find the index of the device in the previous array
  // Editing means array already exists, don't need to handle the user_devices array not existing
  let deviceList = await userCollection.find({userid: userid}).project({user_devices: 1}).toArray();
  deviceList = deviceList[0].user_devices;
  let deviceIndex = undefined;
  for (let i = 0; i < deviceList.length; i++) {
    if (deviceName === deviceList[i].name) {
      deviceIndex = i;
    }
  }

  // Update the device to the new kWh rating and push it to the database
  deviceList[deviceIndex] = { name: deviceName, kWh: newKWH };
  await userCollection.updateOne({ userid: userid }, { $set: { user_devices: deviceList } });

  res.redirect('/devices');
  return;
});


/*
  Delete device submission
  Author: Calvin Lee
  Description: Delete a user's device from the database
*/
app.get('/deleteDevice', async (req, res) => {
  // Get the device to delete's attributes from the query
  let deviceName = decodeURIComponent(req.query.device);
  let kwh = decodeURIComponent(req.query.kwh);
  let userid = req.session.userid;

  // Find the index of the device in the previous array
  // Deleting means array already exists, don't need to handle the user_devices array not existing
  let deviceList = await userCollection.find({userid: userid}).project({user_devices: 1}).toArray();
  deviceList = deviceList[0].user_devices;
  let deviceIndex = undefined;
  for (let i = 0; i < deviceList.length; i++) {
    if (deviceName === deviceList[i].name && kwh === deviceList[i].kWh) {
      deviceIndex = i;
    }
  }

  // Remove the device from the array and push it back to the database
  deviceList = deviceList.toSpliced(deviceIndex, 1);
  await userCollection.updateOne({ userid: userid }, { $set: { user_devices: deviceList } });

  res.redirect('/devices');
  return;
});


// ---------------------------------------------------------------------------------
// Profile page

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
  } else {
    // If not logged in, redirect to the login page
    res.redirect('/login');
    return;
  }
});


/*
  Profile Update
  Author: Brian Diep
  Description: Update the profile userID, name, email and password. Will handle errors
    for userid and email already in use/taken, wrong current password, new password cannot
    be the same, and form validation with the approriate mesages. Successful changes will
    display "[Info] successfully updated".
*/
app.post('/updateProfile', async (req, res) => {
  let errorMessage = '';
  let successMessage = '';
  
  // Extract and log old user details
  let oldUserId = req.session.userid;
  let oldName = req.session.name;
  let oldEmail = req.session.email;
  let oldPw = req.body.oldPassword;

  // Extract new user details from request body
  let newUserId = req.body.userId;
  let newName = req.body.name;
  let newEmail = req.body.email;
  let newPw = req.body.newPassword;

  // Regex for special characters
  const regexAlphanumeric = /^[a-zA-Z0-9_-]+$/;
  // Regex for whitespace
  const regexWhitespace = /\s/;

  // Update password if new password is provided
  if (newPw) {
    let email = req.session.email;
    const user = await userCollection.findOne({ email: email });

    // If user exists and old password matches the stored password
    if (user && await bcrypt.compare(oldPw, user.password)) {

      // Check if the new password is the same as the old password
      if (await bcrypt.compare(newPw, user.password)) {
        errorMessage = 'The new password cannot be the same as the old password.';
        return res.render('profile', { errorMessage: errorMessage, userid: user.userid, name: user.name, email: user.email });
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPw, saltRounds);

      // Update the user's password in the database
      await userCollection.updateOne({ email: req.session.email }, { $set: { password: hashedNewPassword } });
      successMessage += 'Password successfully updated! ';
    } else {
      errorMessage = 'Current password is incorrect.';
      return res.render('profile', { errorMessage: errorMessage, userid: user.userid, name: user.name, email: user.email });
    }
  }

  // Update name if new name is provided
  if (newName) {
    // Check new name for whitespace and alphanumeric characters, and max 30 characters
    if (regexWhitespace.test(newName)) {
      errorMessage = 'Name must not contain any whitespace.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    } else if (!regexAlphanumeric.test(newName)) {
      errorMessage = 'Name must only use alphanumeric characters.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    } else if (newName.length > 30) {
      errorMessage = 'Name must be a maximum of 30 characters.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    }
    await userCollection.updateOne({ username: oldName }, { $set: { username: newName } });
    // Update the session with the new name
    req.session.name = newName;
    successMessage += 'Name successfully updated! ';
  }

  // Update email if new email is provided
  // Check if a new email is provided and doesn't already exist
  if (newEmail) {
    const emailExists = await userCollection.countDocuments({ email: newEmail }) > 0;
    if (!emailExists) {
      await userCollection.updateOne({ email: oldEmail }, { $set: { email: newEmail } });
      req.session.email = newEmail;
      successMessage += 'Email successfully updated! ';
    } else {
      const user = await userCollection.findOne({ email: oldEmail }); // Fetch user details again if needed
      errorMessage = "An account is already associated with this e-mail.";
      return res.render('profile', {
        errorMessage: errorMessage,
        userid: oldUserId,
        name: oldName,
        email: oldEmail,
      });
    }
  }

  // Check new UserID for whitespace and alphanumeric characters, min 6 - max 30 characters
  if (newUserId) {
    if (regexWhitespace.test(newUserId)) {
      errorMessage = 'UserID must not contain any whitespace.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    } else if (!regexAlphanumeric.test(newUserId)) {
      errorMessage = 'UserID must only use alphanumeric characters.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    } else if (newUserId.length < 6 || newUserId.length > 30) {
      errorMessage = 'UserID must be between 6 and 30 characters.';
      return res.render('profile', { errorMessage: errorMessage, userid: oldUserId, name: oldName, email: oldEmail });
    }

    // Check if the new user ID already exists
    const idExists = await userCollection.countDocuments({ userid: newUserId }) > 0;
    if (!idExists) {
      await userCollection.updateOne({ userid: oldUserId }, { $set: { userid: newUserId } });
      req.session.userid = newUserId;
      successMessage += 'User ID successfully updated!';
    } else {
      errorMessage = "An account is already associated with this user ID.";
      return res.render('profile', {
        errorMessage: errorMessage,
        userid: oldUserId,
        name: oldName,
        email: oldEmail,
      });
    }
  }

  if (!errorMessage) {
    res.render('profile', { successMessage, userid: req.session.userid, name: req.session.name, email: req.session.email });
  }
});

// ---------------------------------------------------------------------------------
// Dashboard button

app.get('/dashboard', async (req, res) => {
    if (isValidSession(req)) {
      res.render('dashboard');
    } else {
      res.redirect('/login');
    }
});

// ---------------------------------------------------------------------------------
// Retrieve devices for dashboard
app.get('/dashboardDevices', async (req, res) => {
  try {
    const userDevices = database.db("carboncap_users").collection('users');
    const data = await userDevices.findOne(
      { userid: req.session.userid },
      { projection: { _id: 0, user_devices_history: 1 } }
    );
    if (data && data.user_devices_history) {
      res.json(data.user_devices_history);
    } else {
      res.status(404).json({ error: "User devices history not found" });
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ---------------------------------------------------------------------------------
// Home button

app.get('/main', (req, res) => {
  if (isValidSession(req)) {
    // If logged in, render the 'profile' page
    res.render('main');
  } else {
    // If not logged in, redirect to the login page
    res.redirect('/login');
  }
})


// ---------------------------------------------------------------------------------
// CalculateTotalKwh

/*
  Author: Brian Diep
  Description: Calculate's the total kWh usage based on the User.
*/
app.get('/calculateTotalKwh', async (req, res) => {
  let email = req.session.email;
  // Ensure the user is logged in
  if (!isValidSession(req)) {
    res.redirect('/'); // Redirect to the home page if not logged in
    return;
  }

  try {
    // Retrieve the user's document from the collection
    const user = await userCollection.findOne({ email: email });

    // Check if the user exists
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Extract the user_devices array from the user doc
    const userDevices = user.user_devices;

    // calc total kWh
    let totalKwh = 0;
    userDevices.forEach(device => {
      // Check if the device has a usage value
      if (device.usage) {
        const kWh = parseInt(device.kWh);
        //it has usage?? but disapearred lol
        const usage = parseInt(device.usage);
        totalKwh += kWh * usage;
      } else {
        const kWh = parseInt(device.kWh);
        totalKwh += kWh;
      }
    });

    // Send the total kWh to the client 
    res.json({ totalKwh });
  } catch (error) {
    console.error("Error calculating total kWh:", error);
    res.status(500).send("Internal Server Error");
  }
});


// ------------------------------------------------------------------------------
// About us

app.get('/aboutus', (req, res) => {
  if (isValidSession(req)) {
    // If logged in, render the 'aboutus' page
    res.render('aboutus');
  } else {
    // If not logged in, redirect to the login page
    res.redirect('/login'); 
  }
});


// ------------------------------------------------------------------------------
// Settings (no implementation)

app.get('/settings', (req, res) => {
  if (isValidSession(req)) {
    // If logged in, render the 'settings' page
    res.render('settings');
  } else {
    // If not logged in, redirect to the login page
    res.redirect('/login'); 
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


// ---------------------------------------------------------------------------------
// Middleware

function setupNav(req, res, next) {
  app.locals.currentPage = req.path;
  next();
}


// ---------------------------------------------------------------------------------
// Database things

/*
  Author: Calvin Lee
  Description: This function is used to populate the list of devices in the MongoDB database.
    It updates the current items by searching for their name, and updating their values 
*/
// let deviceData = require("./public/json/devices.json");
async function updateDatabase() {
  // console.log(deviceData);
  const deviceCollection = database.db('devices').collection('appliances');

  for (let i = 0; i < deviceData.length; i++) {
    console.log(deviceData[i]);
    let result = await deviceCollection.insertOne(deviceData[i]);
    console.log("added");
  }

}
// updateDatabase();
