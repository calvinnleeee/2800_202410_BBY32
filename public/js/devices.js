/*
  JS for devices page functionality.
  Author: Calvin Lee
  Description: Provide browser-sided Joi functionality for validating device attribute inputs and
    displaying a user's devices on the page.
  Notes:
*/

// use browser-side Joi to reduce number of get/post calls on the server
const Joi = window.joi;

// originally empty variables, store a holder for the name and current kwh rating of the
// device to edit/remove, so after the user confirms it, it can be sent to the server
let currentDevice = undefined;
let currentKWH = undefined;

/*
  Populate the search textbox with options based on the list of devices in the json file.
  Note: This code was mostly written by GPT, with modifications to fit our code.
*/
document.addEventListener("DOMContentLoaded", async function() {
  // get the list of available devices first
  var response = await fetch('../json/devices.json');
  const options = await response.json();

  // get the elements for the textbox and the div containing the options
  const deviceNameBox = document.getElementById("deviceName");
  const dropdown = document.getElementById("deviceDrop");

  // add an event listener that watches in the textbox, applying the filter as text is being typed
  deviceNameBox.addEventListener("input", function() {
      const filter = deviceNameBox.value.toLowerCase();
      dropdown.innerHTML = '';
      dropdown.style.width = "" + deviceNameBox.offsetWidth + "px";
      
      if (filter) {
        // get the list of devices that contain the current text input
        const filteredOptions = options.filter(option => option.toLowerCase().includes(filter));

        // limit to maximum of 5 devices shown in the list
        filteredOptions.slice(0, 5).forEach(option => {
          const optionElement = document.createElement("div");
          optionElement.classList.add("option");
          optionElement.textContent = option;

          // add an event listener to each search result to fill in the textbox if clicked and to
          // remove the dropdown filter
          optionElement.addEventListener("click", function() {
              deviceNameBox.value = option;
              dropdown.innerHTML = '';
              dropdown.style.display = 'none';
          });

          dropdown.appendChild(optionElement);
        });

        // display the dropdown if there's anything in it, otherwise don't
        dropdown.style.display = filteredOptions.length ? 'block' : 'none';
      }
      else {
        dropdown.style.display = 'none';
      }
  });

  // remove the dropdown display if the user clicks away
  document.addEventListener("click", function(event) {
    if (!event.target.closest('#deviceName')) {
      dropdown.style.display = 'none';
    }
  });
});

/*
  Add an event listener to each of the edit and delete buttons to track the device being targeted,
  so that the correct device can be sent to the server for querying.
*/
let allEditButtons = document.querySelectorAll(".edit-delete");
allEditButtons.forEach(editButton => {
  editButton.addEventListener("click", (e) => {

    currentDevice = e.target.getAttribute("data-device");
    currentKWH = e.target.getAttribute("data-kwh");

    // console.log(currentDevice);
    // console.log(currentKWH);
  });
});
