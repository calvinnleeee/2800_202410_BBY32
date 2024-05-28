const period = document.querySelectorAll('a');

// Convert NodeList to an array and select only the first 3 elements
const firstThreeLinks = Array.from(period).slice(0, 3);

firstThreeLinks.forEach(time => {
  time.addEventListener('click', (event) => {
    event.preventDefault();
    firstThreeLinks.forEach(t => t.className = 'nav-link text-success');
    time.className = 'nav-link active text-success';
  });
});

// Convert NodeList to an array and select only the second 3 elements
const secondsThreeLinks = Array.from(period).slice(3, 7);

secondsThreeLinks.forEach(time => {
  time.addEventListener('click', (event) => {
    event.preventDefault();
    secondsThreeLinks.forEach(t => t.className = 'nav-link text-success');
    time.className = 'nav-link active text-success';
  });
});

let possibleDevices = undefined;

// fetches all the devices a user has
// assisted by chatgpt to write the google chart portions
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('/dashboardDevices');
    possibleDevices = await response.json();

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(drawPieChart);
    google.charts.setOnLoadCallback(drawBarGraph);
  } catch (error) {
    console.error('Error loading devices:', error);
  }
});

// draws the piechart onto the ejs file
// utilizes google charts open source pie chart to display visuals
function drawPieChart() {
  if (!possibleDevices) {
    console.error('No devices data available');
    return;
  }

  const dataArray = [['Device', 'kWh']];
  possibleDevices.forEach(device => {
    dataArray.push([device.name, parseFloat(device.kWh)]);
  });

  const data = google.visualization.arrayToDataTable(dataArray);

  const colors = generateColors(possibleDevices.length);

  const options = {
    title: 'Energy Consumption per Device',
    legend: { position: 'none' },
    width: '100%',
    height: 400,
    colors: colors
  };

  const chart = new google.visualization.PieChart(document.getElementById('piechart'));
  google.visualization.events.addListener(chart, 'ready', () => {
    createCustomLegend(possibleDevices, colors, data);
  });
  chart.draw(data, options);
}

function generateColors(numberOfColors) {
  const colors = [];
  const baseColors = ['#76A7FA', '#FF6347', '#FFD700', '#ADFF2F', '#32CD32', '#FF4500', '#8A2BE2', '#FF1493', '#00CED1', '#20B2AA'];
  for (let i = 0; i < numberOfColors; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
}

function createCustomLegend(devices, colors, data) {
  const devicesWithColors = [];

  for (let i = 1; i < data.getNumberOfRows(); i++) {
    const deviceName = data.getValue(i, 0);
    const deviceKWh = data.getValue(i, 1);
    devicesWithColors.push({
      name: deviceName,
      kWh: deviceKWh,
      color: colors[i - 1]
    });
  }

  devicesWithColors.sort((a, b) => b.kWh - a.kWh);

  let legendHtml = '<ul style="list-style: none; padding: 0;">';
  devicesWithColors.forEach(device => {
    const deviceName = device.name.charAt(0).toUpperCase() + device.name.slice(1);
    legendHtml += `<li><span style="display: inline-block; width: 10px; height: 10px; background-color: ${device.color}; margin-right: 8px;"></span>${deviceName}</li>`;
  });
  legendHtml += '</ul>';

  const legendDiv = document.getElementById('piechart-legend');
  legendDiv.innerHTML = legendHtml;
}

function drawBarGraph() {
  let totalKWh = 0;
  possibleDevices.forEach(device => {
    totalKWh += parseFloat(device.kWh);
  });

  const CO2e = (totalKWh * 127.82) / 1000;

  const dataArray = [["Measurement", "Value", { role: "style" }]];
  dataArray.push(["Total kWh", totalKWh, "color: #76A7FA"]);
  dataArray.push(["CO2e (kg)", CO2e, "color: #FF6347"]);

  const data = google.visualization.arrayToDataTable(dataArray);

  const view = new google.visualization.DataView(data);
  view.setColumns([0, 1,
    {
      calc: "stringify",
      sourceColumn: 1,
      type: "string",
      role: "annotation"
    },
    2]);

  const options = {
    title: "Total Energy Consumption and CO2e",
    width: "100%",
    height: 400,
    bar: { groupWidth: "95%" },
    legend: { position: "none" },
  };

  const chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
  chart.draw(view, options);
  }

