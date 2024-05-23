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
// device to edit/remove, so after the user confirms it, it can be sent to the server.
let currentDevice = undefined;
let currentKWH = undefined;

// the list of possible devices and their estimated kwh values that the server knows,
// loaded in when the page loads
let possibleDevices = undefined;

/*
  Populate the search textbox with options based on the list of devices in the json file.
  Note: This code was mostly written by GPT, with modifications to fit our code.
*/
document.addEventListener("DOMContentLoaded", async function() {
  // get the list of available devices first
  var response = await fetch('/loadDevices');   // replace with database device list later
  possibleDevices = await response.json();

  var options = [];
  for (let i = 0; i < possibleDevices.length; i++) {
    options = options.concat(possibleDevices[i].name);
  }

  console.log(options);
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
  Add an event listener to the body of the table, so that if no devices were detected,
  a message is shown to the user.
*/
document.addEventListener("DOMContentLoaded", (e) => {
  let tableBody = document.getElementById("device-table");
  if (!tableBody.rows.length) {
    tableBody.innerHTML = `<tr><td></td><td colspan="3">You have no devices yet!</td></tr>`;
  }
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


/*
  Add an event listener to the add device submission button to add a new device
*/
document.querySelector(".device-submit").addEventListener("click", async (e) => {
  e.preventDefault();

  let newDeviceName = document.getElementById("deviceName").value;
  let newDeviceWattage = document.getElementById("deviceWattage").value;
  let newDeviceUsage = document.getElementById("deviceUsage").value;
  let errorBox = document.querySelector(".add-error");

  // validate that the input device is from the list of available devices
  // exit out of function and display an error message if not found
  var options = [];
  for (let i = 0; i < possibleDevices.length; i++) {
    options = options.concat(possibleDevices[i].name);
  }

  const result = options.includes(newDeviceName);
  if (!result) {
    errorBox.innerHTML = "Please enter a device from the list.";
    return;
  }

  // validate the values using Joi first before sending to server to add
  const schema = Joi.object({
    device: Joi.string().required(),
    kw:     Joi.number().min(0).max(500),
    usage:  Joi.number().min(0).max(24)
  });
  var validationResult = schema.validate({
    device: newDeviceName, kw: newDeviceWattage, usage: newDeviceUsage});

  // display a relevant error message if any of the inputs are not right
  if (validationResult.error != null) {
    console.log(validationResult.error);
    let errorMsg = validationResult.error.details[0].message;
    if (errorMsg.includes("kw") && errorMsg.includes("greater")) {
      errorBox.innerHTML = "Wattage must be greater than 0!";
    }
    else if (errorMsg.includes("kw") && errorMsg.includes("less")) {
      errorBox.innerHTML = "Wattage looks way to high! Please check again.";
    }
    else if (errorMsg.includes("kw")) {
      errorBox.innerHTML = "Please enter a valid number for wattage.";
    }
    else if (errorMsg.includes("usage")) {
      errorBox.innerHTML = "Usage must be between 0 and 24 hours.";
    }
    else if (errorMsg.includes("device")) {
      errorBox.innerHTML = "You need to enter a device.";
    }
    return;
  }

  // calculate kwh. if the user didn't know the device wattage/usage, give the average
  let kwh = newDeviceWattage * newDeviceUsage;
  if (newDeviceWattage == 0 && newDeviceUsage == 0) {
    let deviceNames = [];
    for (let i = 0; i < possibleDevices.length; i++) {
      deviceNames = deviceNames.concat(possibleDevices[i].name);
    }
    let deviceIndex = deviceNames.indexOf(newDeviceName);
    kwh = possibleDevices[deviceIndex].kWh;
  }

  document.querySelector(".add-error").innerHTML = "<br/>"
  window.location.href = `/addDevice?device=${encodeURIComponent(newDeviceName)}`
      + `&kwh=${encodeURIComponent(kwh)}`;
});
