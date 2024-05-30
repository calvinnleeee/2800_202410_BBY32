/*
  JS for login/signup landing page functionality.
  Author: Calvin Lee
  Description: Provide browser-sided Joi functionality and event listeners to facilitate
      improved UX and functionality for login.ejs.
  Notes:
    - Some of code in this file was generated using ChatGPT, with some modifications made
      to improve UX and reduce the number of potential form posts.
    - Some of the code in this file was also taken from COMP2800 coursework (Joi schemas and
      validation).
*/

// Joi object for schema validation on client side
const Joi = window.joi;


/*
  Change the active carousel windowing depending on if user was coming from a
  login or signup error page.
*/
if (sessionStorage.getItem("prev") == "signup") {
  document.getElementById("landing-item").classList.toggle("active");
  document.getElementById("signup-carousel-item").classList.toggle("active");
  sessionStorage.removeItem("prev");
}
else if (sessionStorage.getItem("prev") == "login") {
  document.getElementById("landing-item").classList.toggle("active");
  document.getElementById("login-carousel-item").classList.toggle("active");
  sessionStorage.removeItem("prev");
}


/*
  Add event listener to login form to validate using Joi before posting
*/
  document.getElementById("loginForm").addEventListener("submit", function(event) {
  // Prevent default form submission and temporarily disable the button
  event.preventDefault();
  document.getElementById("login-button").disabled = true;
  document.getElementById("login-button").value = "Logging in...";

  // Get form inputs
  var userID = document.getElementById("login-id").value;
  var userPw = document.getElementById("login-pw").value;

  // Joi validation
  const schema = Joi.object({
    ID: Joi.string().min(6).max(20).pattern(new RegExp(`^[a-zA-Z0-9_-]+$`)).required(),
    pw: Joi.string().max(20).required()
  });
  var validationResult = schema.validate({ID: userID, pw: userPw});

  // If there is an error, display a meaningful message to the user depending on the error
  // and reenable the button
  if (validationResult.error != null) {
    var errorMsg = validationResult.error.details[0].message;
    displayError(errorMsg, "loginError");
    document.getElementById("login-button").disabled = false;
    document.getElementById("login-button").value = "Login";
  }

  // If there is no error, proceed to post to the server for bcrypt password hashing
  else {
    // Get rid of error message if inputs are valid
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginError").replaceChildren(document.createElement('br'));
    
    // Submit the form
    this.submit();
  }
});


/*
  Add event listener to signup form to validate with Joi before posting
*/
  document.getElementById("signupForm").addEventListener("submit", function(event) {
  // Prevent default form submission and temporarily disable the button
  event.preventDefault();
  document.getElementById("signup-button").disabled = true;
  document.getElementById("signup-button").value = "Signing up...";

  // Get form inputs
  var userID = document.getElementById("signup-id").value;
  var userName = document.getElementById("signup-name").value;
  var userEmail = document.getElementById("signup-email").value;
  var userPw = document.getElementById("signup-pw").value;

  // Joi validation
  const schema = Joi.object({
    ID:     Joi.string().min(6).max(20).pattern(new RegExp(`^[a-zA-Z0-9_-]+$`)).required(),
    name:   Joi.string().max(30).trim().pattern(new RegExp(`^[A-Za-z]+(?:[-' ][A-Za-z]+)*$`)).required(),
    email:  Joi.string().email({
      minDomainSegments: 2, tlds: { allow: ['com', 'org', 'net', 'ca']}}).required(),
    pw:     Joi.string().min(6).max(20).pattern(new RegExp(`^\\S+$`)).required()
  });
  var validationResult = schema.validate({ID: userID, name: userName, email: userEmail, pw: userPw});

  // If there is an error, display a meaningful message to the user depending on the error
  // and reenable the button.
  if (validationResult.error != null) {
    var errorMsg = validationResult.error.details[0].message;
    console.log(errorMsg);
    displayError(errorMsg, "signupError");
    document.getElementById("signup-button").disabled = false;
    document.getElementById("signup-button").value = "Submit";
  }

  // If there is no error, proceed to post to the server for bcrypt password hashing
  else {
    // Get rid of error message if inputs are valid
    document.getElementById("signupError").textContent = "";
    document.getElementById("signupError").replaceChildren(document.createElement('br'));
    
    // Submit the form
    this.submit();
  }

});


/*
  Add event listeners to the main log in/sign up buttons to clear errors as they transition
*/
document.querySelectorAll(".clear-error").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginError").replaceChildren(document.createElement('br'));
    document.getElementById("signupError").textContent = "";
    document.getElementById("signupError").replaceChildren(document.createElement('br'));
  });
});


/*
  Add an event listener to the forgot password form to prevent multiple submissions.
*/
document.getElementById("forgotForm").addEventListener('submit', function(event) {
  event.preventDefault();
  document.getElementById("forgot-pw-button").disabled = true;
  document.getElementById("forgot-pw-button").value = "Submitting..."
  this.submit();
});


/*
  Function for configuring the error message to display, taking the message to parse and
  the element to put the error message in as arguments
*/
function displayError(errorMsg, errorElement) {
  // ** parts of this code was generated by GPT, but modified to include various meaningful messages
  // ** by checking the error string
  let errorNode = document.getElementById(errorElement);
  if (errorMsg.includes("ID") && errorMsg.includes("empty")) {
    errorNode.textContent = "The user ID is required.";
  }
  else if (errorMsg.includes("ID") && errorMsg.includes("pattern")) {
    errorNode.textContent = "The user ID can only contain letters, numbers, dashes, and underscores.";
  }
  else if (errorMsg.includes("ID")) {
    errorNode.textContent = "Invalid user ID.";
  }
  else if (errorMsg.includes("name") && errorMsg.includes("empty")) {
    errorNode.textContent = "Your name is required.";
  }
  else if (errorMsg.includes("name") && errorMsg.includes("pattern")) {
    errorNode.textContent = "Your name must only contain letters.";
  }
  else if (errorMsg.includes("name") && errorMsg.includes("valid")) {
    errorNode.textContent = "The name you entered is not allowed.";
  }
  else if (errorMsg.includes("email") && errorMsg.includes("empty")) {
    errorNode.textContent = "Email is required.";
  }
  else if (errorMsg.includes("email") && errorMsg.includes("valid")) {
    errorNode.textContent = "The email you entered is invalid.";
  }
  else if (errorMsg.includes("pw") && errorMsg.includes("empty")) {
    errorNode.textContent = "Password is required.";
  }
  else if (errorMsg.includes("pw") && errorMsg.includes("pattern")) {
    errorNode.textContent = "Password cannot contain whitespace characters.";
  }
  else if (errorMsg.includes("pw") && errorMsg.includes("valid")) {
    errorNode.textContent = "The password you entered is invalid.";
  }
  else {
    errorNode.textContent = "There was an error with your inputs.";
  }
}