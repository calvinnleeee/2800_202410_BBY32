google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {
    var data = google.visualization.arrayToDataTable([
        ['', 'You', 'Average User'],
        ['kWh', 0.2, 0.4],
    ]);

    var materialOptions = {
        chart: {
            title: 'Usage'
        },
        hAxis: {
            title: 'kWh Used',
            minValue: 0,
        },
        bars: 'horizontal',
    };

    var materialChart = new google.charts.Bar(document.getElementById('chart_div'));
    materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
}