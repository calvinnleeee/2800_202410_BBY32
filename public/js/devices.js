/*
  JS for devices page functionality.
  Author: Calvin Lee
  Description: Provide browser-sided Joi functionality for validating device attribute inputs and
    displaying a user's devices on the page.
  Notes:
*/

// use browser-side Joi to reduce number of get/post calls on the server
const Joi = window.joi;

/*
  Add an event listener to the help button for adding a device, to prevent the default
  function and do something else.
*/
document.getElementById("device-help").addEventListener("click", e => {
  e.preventDefault();
});