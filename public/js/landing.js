/*
  JS for login/signup landing page functionality.
  Author: Calvin Lee
  Description: Provide browser-sided Joi functionality and event listeners to facilitate
      improved UX.
  Notes:
    - Some of code in this file was generated using ChatGPT, with some modifications made
      to improve UX and reduce the number of potential form posts.
    - Some of the code in this file was also taken from COMP2800 coursework (Joi schemas and
      validation).
*/

const Joi = window.joi;

// Add event listener to login form to validate using Joi before posting
document.getElementById("loginForm").addEventListener("submit", function(event) {
  // prevent default form submission
  event.preventDefault();

  // get form inputs
  var userEmail = document.getElementById("login-email").value;
  var userPw = document.getElementById("login-pw").value;

  // Joi validation
  const schema = Joi.object({
    email:  Joi.string().email({
      minDomainSegments: 2, tlds: { allow: ['com', 'org', 'net', 'ca']}}).required(),
    pw:     Joi.string().max(20).required()
  });
  var validationResult = schema.validate({email: userEmail, pw: userPw});

  // if there is an error, display a meaningful message to the user depending on the error
  if (validationResult.error != null) {
    var errorMsg = validationResult.error.details[0].message;
    displayError(errorMsg, "loginError");
  }

  // if there is no error, proceed to post to the server for bcrypt password hashing
  else {
    // get rid of error message if inputs are valid
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginError").replaceChildren(document.createElement('br'));
    
    // submit the form
    this.submit();
  }
});

// Add event listener to signup form to validate with Joi before posting
document.getElementById("signupForm").addEventListener("submit", function(event) {
  // prevent default form submission
  event.preventDefault();

  // get form inputs
  var userName = document.getElementById("signup-name").value;
  var userEmail = document.getElementById("signup-email").value;
  var userPw = document.getElementById("signup-pw").value;

  // Joi validation
  const schema = Joi.object({
    name:   Joi.string().max(30).required(),
    email:  Joi.string().email({
      minDomainSegments: 2, tlds: { allow: ['com', 'org', 'net', 'ca']}}).required(),
    pw:     Joi.string().max(20).required()
  });
  var validationResult = schema.validate({name: userName, email: userEmail, pw: userPw});

  // if there is an error, display a meaningful message to the user depending on the error
  if (validationResult.error != null) {
    // console.log(validationResult.error.details);
    var errorMsg = validationResult.error.details[0].message;

    displayError(errorMsg, "signupError");
  }

  // if there is no error, proceed to post to the server for bcrypt password hashing
  else {
    // get rid of error message if inputs are valid
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginError").replaceChildren(document.createElement('br'));
    
    // submit the form
    this.submit();
  }

});


// Add event listeners to the main log in/sign up buttons to clear errors as they transition
document.querySelectorAll(".clear-error").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    document.getElementById("loginError").textContent = "";
    document.getElementById("loginError").replaceChildren(document.createElement('br'));
  });
});

// Function for configuring the error message to display, taking the message to parse and
// the element to put the error message in as arguments
function displayError(errorMsg, errorElement) {
  // ** parts of this code was generated by GPT, but modified to include various meaningful messages
  // ** by checking the error string
  if (errorMsg.includes("name") && errorMsg.includes("empty")) {
    document.getElementById(errorElement).textContent = "Your name is required.";
  }
  else if (errorMsg.includes("name") && errorMsg.includes("valid")) {
    document.getElementById(errorElement).textContent = "The name you entered is not allowed.";
  }
  else if (errorMsg.includes("email") && errorMsg.includes("empty")) {
    document.getElementById(errorElement).textContent = "Email is required.";
  }
  else if (errorMsg.includes("email") && errorMsg.includes("valid")) {
    document.getElementById(errorElement).textContent = "The email you entered is invalid.";
  }
  else if (errorMsg.includes("pw") && errorMsg.includes("empty")) {
    document.getElementById(errorElement).textContent = "Password is required.";
  }
  else if (errorMsg.includes("pw") && errorMsg.includes("valid")) {
    document.getElementById(errorElement).textContent = "The password you entered is invalid.";
  }
  else {
    document.getElementById(errorElement).textContent = "There was an error with your inputs.";
  }
}