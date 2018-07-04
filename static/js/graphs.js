queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, recordsJson) {

	//Clean data
	var records = recordsJson;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");

	records.forEach(function(d) {
		d["timestamp"] = dateFormat.parse(d["InvoiceDate"]);
		d["timestamp"].setMinutes(0);
		d["timestamp"].setSeconds(0);
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["timestamp"]; });
  var customerDim = ndx.dimension(function(d) { return d["CustomerId"]; });
	var allDim = ndx.dimension(function(d) {return d;});


	//Group Data
	var numRecordsByDate = dateDim.group();
  var customerRecords = customerDim.group();

	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["timestamp"];
	var maxDate = dateDim.top(1)[0]["timestamp"];

    //Charts

	var timeChart = dc.barChart("#time-chart");

  // var customerChart = dc.barChart("#customer-chart");



  // customerChart
  //   .width(650)
  //   .height(140)
  //   .dimension(customerDim)
  //   .group(customerRecords)
  //   .x(d3.time.scale().domain([minDate, maxDate]))

	timeChart
		.width(650)
		.height(140)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)

		// .x(d3.time.scale().domain([minDate, maxDate]))
		// .elasticY(true)
		// .yAxis().ticks(4);

	dc.renderAll();

};
