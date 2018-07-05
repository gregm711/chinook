const url = "/data/" + window.location.pathname.split("/").pop();
const heightDim = 240;
const widthDim = 1000;


function showRow(col) {
    var checkBox = document.getElementById("checkbox-" + col);
    var row = document.getElementById("row-" + col);
    if (checkBox.checked == true) {
        row.style.display = "block";
    } else {
        row.style.display = "none";
    }
}

function createPieChart(ndx, col) {
    var colDim = ndx.dimension(function(d) {
        return d[col];
    });
    var numRecords = colDim.group();
    var colGroup = colDim.group().reduceSum(function(d) {
        return d[col];
    });
    var pieChart = dc.pieChart("#chart-" + col);

    pieChart
        .width(widthDim)
        .height(heightDim)
        .dimension(colDim)
        .group(numRecords)

    return pieChart

}


function createBarChart(ndx, col) {
    var colDim = ndx.dimension(function(d) {
        return d[col];
    });
    var numRecords = colDim.group();
    var barChart = dc.barChart("#chart-" + col);

    barChart
        .width(widthDim)
        .height(heightDim)
        .x(d3.scale.ordinal().rangeRoundBands([0, widthDim], .1))
        .xUnits(dc.units.ordinal)
        .elasticX(true)
        .brushOn(true)
        .dimension(colDim)
        .barPadding(0.1)
        .outerPadding(0.05)
        .group(numRecords)
        .elasticY(true)
        .yAxis().ticks(4)


    return barChart

}

function createTimeChart(ndx, col) {
    var colDim = ndx.dimension(function(d) {
        return d[col];
    });
    var numRecords = colDim.group();
    var minDate = colDim.bottom(1)[0][col];
    var maxDate = colDim.top(1)[0][col];
    var timeChart = dc.lineChart("#chart-" + col);
    timeChart
        .brushOn(true)
        .renderDataPoints(true)
        .xAxisLabel("Date")
        .width(widthDim)
        .height(heightDim)
        .dimension(colDim)
        .group(numRecords)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .yAxis().ticks(4)





    return timeChart

}


function detChartType(ndx, col) {
    var chartType = "";
    var colDim = ndx.dimension(function(d) {
        return d[col];
    });
    var numRecords = colDim.group();
    var num = numRecords.top(Number.POSITIVE_INFINITY).length
    if (col.includes("Date")) {
        chartType = "time"
    } else if (num < 4) {
        chartType = "pie";
    } else {
        chartType = "bar"
    }
    return chartType;
}


d3.json(url, function makeGraphs(recordsJson) {

    var records = recordsJson;
    var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
    var ndx = crossfilter(records);

    // Go through and format dates if possible
    columns.forEach(function(col) {
        if (col.includes("Date")) {
            records.forEach(function(d) {
                d[col] = dateFormat.parse(d[col]);
                d[col].setMinutes(0);
                d[col].setSeconds(0);
            });
        }
    });

    columns.forEach(function(col) {

        var chartType = detChartType(ndx, col)

        switch (chartType) {
            case "time":
                var timeChart = createTimeChart(ndx, col)
                break;
            case "pie":
                var pieChart = createPieChart(ndx, col)
                break;
            case "bar":
                var barChart = createBarChart(ndx, col)
                break;
            default:
                break

        }
    });
    dc.renderAll();

});
