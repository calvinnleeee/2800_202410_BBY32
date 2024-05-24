// Taken from google Charts
// Load Google Charts and define callback function
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {
    var totalKwh = parseFloat(document.getElementById('totalKwh').value);
    var data = google.visualization.arrayToDataTable([
        ['', 'You', 'Average User'],
        ['Kwh', totalKwh, 1000], 
    ]);

    // Define chart options
    var materialOptions = {
        chart: {
            title: 'Usage'
        },
        hAxis: {

            minValue: 0, 
        },
        bars: 'horizontal',
    };

    // Create and draw the chart
    var materialChart = new google.charts.Bar(document.getElementById('chart_div'));
    materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
}