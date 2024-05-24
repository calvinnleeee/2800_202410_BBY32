// Taken from google Charts
google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawMaterial);

function drawMaterial() {

    var totalCost = parseFloat(document.getElementById('totalCost').value);

    // Average cost in dollars
    var averageCost = 114;

    var data = google.visualization.arrayToDataTable([
        ['', 'You', 'Average User'],
        ['CDN', '$ '+ totalCost, '$ '+ averageCost],
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
        message = `Great work! You've currently saving $${savings.toFixed(2)} more than the average user, which would have been ${comparison}, 30 years ago.`;
    } else if (savings === 0) {
        message = "You've spent the same amount as the average user. Try to reduce the use of your devices to save!";
    } else {
        message = `You've spent $${(-savings).toFixed(2)} more than the average user but no worries, its a learning process!`;
    }

    document.getElementById('savings_message').innerText = message;
}
