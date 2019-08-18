
// set the dimensions and margins of the graph
var margin = {top: 10, right: 100, bottom: 150, left: 250},
    width = 990 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//Set the variables for the lines and the axis
var line,
    x, y, yAxis, xAxis;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")

//Read the data"    
d3.csv("../../db/Monthly_Cancellation.csv", function(data) {

    console.log(data);

    // List of Airlines
    var allGroup = ["Select Airline","Alaska Airlines Inc.", "American Airlines Inc.", "American Eagle Airlines Inc.", "Atlantic Southeast Airlines", 
                    "Delta Air Lines Inc.", "Frontier Airlines Inc.", "Hawaiian Airlines Inc.", "JetBlue Airways", "Skywest Airlines Inc.", 
                    "Southwest Airlines Co.", "Spirit Air Lines", "US Airways Inc.", "United Air Lines Inc.", "Virgin America"]

    data.forEach(function(tempdata) {
       
        tempdata.month = +tempdata.month
        tempdata.cancelled = +tempdata.cancelled;
    });    

    // add the options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
     	.data(allGroup)
        .enter()
    	.append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A color scale: one color for each group
    var myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

    // Add X axis 
    x = d3.scaleLinear()
      .domain([0, 12])
      .range([ 0, width ]);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    y = d3.scaleLinear()
      .domain( [0, d3.max(data, data => data.cancelled)+ 50])
      .range([ height, 0 ]);

    svg.append("g")
        .attr("id","y-axis")
      .call(d3.axisLeft(y));
    
    // Initialize line
    line = svg
        .append('g')
        .append("path")
        .datum("")
        .attr("d", d3.line()
            .x(function(d) { return x(d.month) })
            .y(function(d) { return y(d.cancelled) })
        )
            .attr("stroke", function(d){ return myColor("Select Airline") })
            .style("stroke-width", 4)
            .style("fill", "none")    
    
    // A function that update the chart
    function update(selectedGroup) {

      // Create new data filter with the selection
        var dataFilter = data.map(function(d){
            if (selectedGroup == d.airline)
                return d;
        })
        
        dataFilter = dataFilter.filter(function( element ) {
            return element !== undefined;   
        });
        console.log("after filter for :" + selectedGroup );
        console.log(dataFilter);

        // Update the y axis as the data changes
        y = d3.scaleLinear()
            .domain( [0, d3.max(dataFilter, data => data.cancelled)])
            .range([ height, 0 ]);
        d3.select("#y-axis")    
            .call(d3.axisLeft(y));

    
        line
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.line()
                .x(function(d) { return x(d.month) })
                .y(function(d) { return y(d.cancelled) })
            )
            .attr("stroke", function(d){ return myColor(selectedGroup) })
        
        // Display the result text
        d3.select("#display-result").text("The Maximum cancelled flights for "+selectedGroup +" are " + d3.max(dataFilter, data => data.cancelled));    
                                   
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)    
       
    })

    // Create axes labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("dy", "-2.5em")
        .attr("class", "axisText")
        .text("Cancelled");
    
    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("Month");

})