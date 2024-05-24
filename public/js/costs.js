google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {
    var data = google.visualization.arrayToDataTable([
        ['', 'You', 'Average User'],
        ['Dollars', 0.2, 0.4],
    ]);

    var materialOptions = {
        chart: {
            title: 'Costs'
        },
        hAxis: {
            title: '$',
            minValue: 0,
        },
        bars: 'horizontal',
    };

    var materialChart = new google.charts.Bar(document.getElementById('costs_chart_div'));
    materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
}