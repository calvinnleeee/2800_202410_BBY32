document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('/dashboardDevices');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const json = await response.text();
    console.log('Fetched JSON:', json); // Log the fetched JSON string

    userDevicesHistory = JSON.parse(json);

    // Check and duplicate device history for missing dates
    checkAndDuplicateDeviceHistory();

    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(() => {
      drawPieChart(userDevicesHistory);
      drawBarGraph(userDevicesHistory, 'week'); // Default to weekly
    });
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

function checkAndDuplicateDeviceHistory() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (userDevicesHistory.length === 0) return;

  // Find the latest entry
  let latestEntry = userDevicesHistory[userDevicesHistory.length - 1];
  let latestDate = new Date(latestEntry.date);
  latestDate.setHours(0, 0, 0, 0);

  while (latestDate < today) {
    latestDate.setDate(latestDate.getDate() + 1);
    const newEntry = {
      date: latestDate.toISOString(),
      user_devices: JSON.parse(JSON.stringify(latestEntry.user_devices))
    };
    userDevicesHistory.push(newEntry);
  }
}

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
    drawBarGraph(filteredData, period);
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
    title: 'Energy Consumption per Device',
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

  const midpoint = Math.ceil(devicesWithColors.length / 2);
  const leftColumn = devicesWithColors.slice(0, midpoint);
  const rightColumn = devicesWithColors.slice(midpoint);

  let legendHtml = '<div style="display: flex; justify-content: center;">';
  legendHtml += '<ul style="list-style: none; padding: 0; margin: 0 20px;">';
  leftColumn.forEach(device => {
    const deviceName = device.name.charAt(0).toUpperCase() + device.name.slice(1);
    legendHtml += `<li><span style="display: inline-block; width: 10px; height: 10px; background-color: ${device.color}; margin-right: 8px;"></span>${deviceName}</li>`;
  });
  legendHtml += '</ul>';

  legendHtml += '<ul style="list-style: none; padding: 0; margin: 0 20px;">';
  rightColumn.forEach(device => {
    const deviceName = device.name.charAt(0).toUpperCase() + device.name.slice(1);
    legendHtml += `<li><span style="display: inline-block; width: 10px; height: 10px; background-color: ${device.color}; margin-right: 8px;"></span>${deviceName}</li>`;
  });
  legendHtml += '</ul>';
  legendHtml += '</div>';

  const legendDiv = document.getElementById('piechart-legend');
  legendDiv.innerHTML = legendHtml;
}

function drawBarGraph(filteredData, period) {
  if (!filteredData.length) {
    console.error('No devices data available');
    return;
  }

  let dataArray = [["Date", "kWh", { role: "style" }, "CO2e (kg)", { role: "style" }]];

  if (period === 'week') {
    const dailyData = {};

    // Initialize dailyData for the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyData[dateString] = { kWh: 0, CO2e: 0 };
    }

    filteredData.forEach(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      if (dailyData[entryDate]) {
        entry.user_devices.forEach(device => {
          const kWh = parseFloat(device.kWh);
          dailyData[entryDate].kWh += kWh;
          dailyData[entryDate].CO2e += (kWh * 127.82) / 1000;
        });
      }
    });

    for (const [date, data] of Object.entries(dailyData)) {
      dataArray.push([date, data.kWh, "color: #76A7FA", data.CO2e, "color: #FF6347"]);
    }
  } else if (period === 'month') {
    const weeklyData = {};

    // Initialize weeklyData for the past 4 weeks
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekString = `Week ${4 - i}`;
      weeklyData[weekString] = { kWh: 0, CO2e: 0 };
    }

    filteredData.forEach(entry => {
      const entryDate = new Date(entry.date);
      const weekIndex = Math.floor((Date.now() - entryDate) / (7 * 24 * 60 * 60 * 1000));
      if (weekIndex < 4) {
        const weekString = `Week ${4 - weekIndex}`;
        entry.user_devices.forEach(device => {
          const kWh = parseFloat(device.kWh);
          weeklyData[weekString].kWh += kWh;
          weeklyData[weekString].CO2e += (kWh * 127.82) / 1000;
        });
      }
    });

    for (const [week, data] of Object.entries(weeklyData)) {
      dataArray.push([week, data.kWh, "color: #76A7FA", data.CO2e, "color: #FF6347"]);
    }
  } else if (period === 'year') {
    const monthlyData = {};

    // Initialize monthlyData for the past 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      monthlyData[dateString] = { kWh: 0, CO2e: 0 };
    }

    filteredData.forEach(entry => {
      const entryDate = new Date(entry.date);
      const entryMonth = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`;
      if (monthlyData[entryMonth]) {
        entry.user_devices.forEach(device => {
          const kWh = parseFloat(device.kWh);
          monthlyData[entryMonth].kWh += kWh;
          monthlyData[entryMonth].CO2e += (kWh * 127.82) / 1000;
        });
      }
    });

    for (const [month, data] of Object.entries(monthlyData)) {
      dataArray.push([month, data.kWh, "color: #76A7FA", data.CO2e, "color: #FF6347"]);
    }
  }

  const data = google.visualization.arrayToDataTable(dataArray);

  const view = new google.visualization.DataView(data);
  view.setColumns([0, 1, 2, 3, 4]);

  const options = {
    title: period === 'week' ? "Daily Energy Consumption and CO2e for the Past Week" :
           period === 'month' ? "Weekly Energy Consumption and CO2e for the Past Month" :
           "Monthly Energy Consumption and CO2e for the Past Year",
    width: "100%",
    height: 400,
    bar: { groupWidth: "80%" },
    legend: { position: "none" },
    hAxis: {
      textStyle: { fontSize: 10 } // Adjust font size to fit longer labels if necessary
    },
    series: {
      0: { color: '#76A7FA' },
      1: { color: '#FF6347' }
    }
  };

  const chart = new google.visualization.ColumnChart(document.getElementById("columnchart_values"));
  chart.draw(view, options);
}
