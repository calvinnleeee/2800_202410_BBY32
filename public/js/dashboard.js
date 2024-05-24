const period = document.querySelectorAll('a');

period.forEach(time => {
    time.addEventListener('click', (event) => {
        event.preventDefault();
        period.forEach(t => t.className = 'nav-link text-success');
        time.className = 'nav-link active text-success';
    });
});


let possibleDevices = undefined;

document.addEventListener("DOMContentLoaded", async function() {
  try {
    const response = await fetch('/dashboardDevices');
    possibleDevices = await response.json();

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);
  } catch (error) {
    console.error('Error loading devices:', error);
  }
});

function drawChart() {
  if (!possibleDevices) {
    console.error('No devices data available');
    return;
  }

  const dataArray = [['Device', 'kWh']];
  possibleDevices.forEach(device => {
    dataArray.push([device.name, parseFloat(device.kWh)]);
  });

  const data = google.visualization.arrayToDataTable(dataArray);

  const options = {
    legend: { position: 'bottom' },
    width: '100%',
    height: '100%'
  };

  const chart = new google.visualization.PieChart(document.getElementById('piechart'));
  chart.draw(data, options);
}


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
