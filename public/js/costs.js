/*
  Author: Brian Diep
  Description: Creating comparison bar graphs for the user to check their costs
    against the average user's stats.
*/

// Google charts
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {

  var totalCost = parseFloat(document.getElementById('totalCost').value);

  // Average cost in dollars (from the average user)
  var averageCost = 113;
  totalCost *= 30;

  var data = google.visualization.arrayToDataTable([
    ['', 'You', 'Average User',],
    ['CDN', totalCost, averageCost],
  ]);

  // Formatter
  var formatter = new google.visualization.NumberFormat({
    prefix: '$',
    fractionDigits: 2
  });

  // Fomatter
  formatter.format(data, 1); // "You"
  formatter.format(data, 2); // "Average User"

  var materialOptions = {
    chart: {
      position: 'top',
      title: 'Estimated Monthly Projected Costs',
      titleTextStyle: {
        fontSize: 18,
        bold: true
      }
    },
    hAxis: {
      title: 'Monthly Projected Costs',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      minValue: 0,
      format: 'currency',
      gridlines: {
        count: 4
      },
      textStyle: {
        fontSize: 12
      },
    },
    bars: 'horizontal',
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

  var materialChart = new google.visualization.BarChart(document.getElementById('costs_chart_div'));
  materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));

  // Comparing savings
  var savings = averageCost - totalCost;
  var comparison = "";

  if (savings >= 100) {
    comparison = "the equivalent of a fancy dinner for two";
  } else if (savings >= 75) {
    comparison = "the equivalent of a monthly phone bill";
  } else if (savings >= 50) {
    comparison = "the equivalent of a week's worth of groceries";
  } else if (savings >= 25) {
    comparison = "the equivalent of an average meal";
  } else if (savings >= 10) {
    comparison = "the equivalent of a movie ticket and some change";
  } else {
    comparison = "the equivalent of a cup of coffee and some change";
  }

  // Display savings message
  var message = "";
  if (savings > 0) {
    message = `Great work! If you keep this up, you'll be on track to save $${savings.toFixed(2)} more than the average user, which would have been ${comparison}, 30 years ago.`;
  } else if (savings === 0) {
    message = "You've spent the same amount as the average user. Try to reduce the use of your devices to save!";
  } else {
    message = `You'll be on track to spend $${(-savings).toFixed(2)} more than the average user but no worries, its a learning process!`;
  }

  document.getElementById('savings_message').innerText = message;
}
