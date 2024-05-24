// Taken from google Charts
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {

    var totalCost = parseFloat(document.getElementById('totalCost').value);

    var data = google.visualization.arrayToDataTable([
        ['', 'You', 'Average User'],
        ['CDN', '$ '+ totalCost, '$ '+ 114],
    ]);

    var materialOptions = {
        chart: {
            title: 'Costs'
        },
        hAxis: {
            title: '',
            minValue: 0,
        },
        bars: 'horizontal',
    };

    var materialChart = new google.charts.Bar(document.getElementById('costs_chart_div'));
    materialChart.draw(data, google.charts.Bar.convertOptions(materialOptions));
}
