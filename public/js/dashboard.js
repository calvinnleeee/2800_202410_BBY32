document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('/dashboardDevices');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.text();
    console.log('Fetched JSON:', json); // Log the fetched JSON string

    userDevicesHistory = JSON.parse(json);

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => drawPieChart(userDevicesHistory));
    google.charts.setOnLoadCallback(() => drawBarGraph(userDevicesHistory));
  } catch (error) {
    console.error('Error loading devices:', error);
  }
});

const period = document.querySelectorAll('a');

// Convert NodeList to an array and select only the first 3 elements
const firstThreeLinks = Array.from(period).slice(0, 3);

firstThreeLinks.forEach(time => {
  time.addEventListener('click', (event) => {
    event.preventDefault();
    firstThreeLinks.forEach(t => t.className = 'nav-link text-success');
    time.className = 'nav-link active text-success';
    filterData(time.textContent.toLowerCase(), 'pie');
  });
});

// Convert NodeList to an array and select only the second 3 elements
const secondsThreeLinks = Array.from(period).slice(3, 6);

secondsThreeLinks.forEach(time => {
  time.addEventListener('click', (event) => {
    event.preventDefault();
    secondsThreeLinks.forEach(t => t.className = 'nav-link text-success');
    time.className = 'nav-link active text-success';
    filterData(time.textContent.toLowerCase(), 'bar');
  });
});

let userDevicesHistory = [];

// Filter data based on period
function filterData(period, chartType) {
  const now = new Date();
  let filteredData = [];

  console.log(period);
  console.log(`Filtering data for period: ${period}`);

  if (period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredData = userDevicesHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      console.log(`Entry date: ${entryDate}, Week ago: ${weekAgo}`);
      return entryDate >= weekAgo;
    });
  } else if (period === 'month') {
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    filteredData = userDevicesHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      console.log(`Entry date: ${entryDate}, Month ago: ${monthAgo}`);
      return entryDate >= monthAgo;
    });
  } else if (period === 'year') {
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    filteredData = userDevicesHistory.filter(entry => {
      const entryDate = new Date(entry.date);
      console.log(`Entry date: ${entryDate}, Year ago: ${yearAgo}`);
      return entryDate >= yearAgo;
    });
  }

  console.log(`Filtered data length: ${filteredData.length}`);

  if (chartType === 'pie') {
    drawPieChart(filteredData);
  } else if (chartType === 'bar') {
    drawBarGraph(filteredData);
  }
}

// Draws the pie chart onto the ejs file
// Utilizes Google Charts open-source pie chart to display visuals
function drawPieChart(filteredData) {
  if (!filteredData.length) {
    console.error('No devices data available');
    return;
  }

  const dataArray = [['Device', 'kWh']];
  const deviceTotals = {};

  filteredData.forEach(entry => {
    entry.user_devices.forEach(device => {
      deviceTotals[device.name] = (deviceTotals[device.name] || 0) + parseFloat(device.kWh);
    });
  });

  for (const [name, kWh] of Object.entries(deviceTotals)) {
    dataArray.push([name, kWh]);
  }

  const data = google.visualization.arrayToDataTable(dataArray);

  const colors = generateColors(Object.keys(deviceTotals).length);

  const options = {
    title: 'Total Energy Consumption per Device',
    legend: { position: 'none' },
    width: '100%',
    height: 400,
    colors: colors
  };

  const chart = new google.visualization.PieChart(document.getElementById('piechart'));
  google.visualization.events.addListener(chart, 'ready', () => {
    createCustomLegend(deviceTotals, colors);
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

function createCustomLegend(deviceTotals, colors) {
  const devicesWithColors = [];

  let index = 0;
  for (const [name, kWh] of Object.entries(deviceTotals)) {
    devicesWithColors.push({
      name: name,
      kWh: kWh,
      color: colors[index]
    });
    index++;
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

function drawBarGraph(filteredData) {
  if (!filteredData.length) {
    console.error('No devices data available');
    return;
  }

  let totalKWh = 0;

  filteredData.forEach(entry => {
    entry.user_devices.forEach(device => {
      totalKWh += parseFloat(device.kWh);
    });
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
