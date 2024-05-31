/*
  Author: Brian Diep
  Description: Creating comparison bar graphs for the user to check their usage
    against the average user's stats.
*/

// Google charts
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {
  var totalKwh = parseFloat(document.getElementById('totalKwh').value);
  var data = google.visualization.arrayToDataTable([
    ['', 'You', 'Average User'],
    ['kWh', totalKwh, 33] , 
  ]);

  // Formatter
  var formatter = new google.visualization.NumberFormat({
    suffix: ' kWh',
    fractionDigits: 2
  });

  // Formatter
  formatter.format(data, 1); // "You"
  formatter.format(data, 2); // "Average User" 

  // Define chart options
  var materialOptions = {
    chart: {
      title: 'Today\'s Current Energy Consumption',
      titleTextStyle: {
        fontSize: 18,
        bold: true
      }
    },
    hAxis: {
      title: 'Today\'s Current Energy Usage',
      minValue: 0,
      format: '# kWh',
      gridlines: {
        count: 3
      },
      textStyle: {
        fontSize: 13
      },
      titleTextStyle: {
        fontSize: 14,
        bold: true
      }
    },
    vAxis: {
      title: ''
    },
    bars: 'horizontal',
    annotations: {
      alwaysOutside: true,
      textStyle: {
        fontSize: 14,
        color: '#000',
        auraColor: 'none'
      }
    },
    series: {
      0: { color: '#519E5C' },  // 'You'
      1: { color: '#90C2E7' }   // 'Average User'
    },
    legend: {
      position: 'top',
      textStyle: {
        fontSize: 14
      }
    },
  };

  // Create and draw the chart
  var materialChart = new google.visualization.BarChart(document.getElementById('chart_div'));
  materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
}
