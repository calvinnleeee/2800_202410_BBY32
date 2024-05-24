function calculateMonthlyCost(kWh, costPerKWh) {
    // Convert costPerKWh from cents to dollars
    costPerKWh /= 100; 

    // Calculate total cost
    var totalCost = kWh * costPerKWh;

    return totalCost.toFixed(2); // Round to 2 decimal places
}

var kWh = 1000; // kWh per month
var costPerKWh = 11.4; // cents per kWh

var monthlyCost = calculateMonthlyCost(kWh, costPerKWh);
console.log("Monthly cost: $" + monthlyCost);
