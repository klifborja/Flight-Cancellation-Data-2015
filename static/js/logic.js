// LEAFLET MAP
var originAirportUrl = "/origin_code_all";

d3.json(originAirportUrl).then(function(data) {
  console.log(data)


  // scaling factor to change how big the circles are
  function markerSize(flight_count) {
    return flight_count / 2;
  }

  function markerSize2(mean_arrival_delay) {
    return mean_arrival_delay * 3500;
  }


  // Define arrays to hold created city and state markers
  var flightCountMarkers = [];
  var meanArrivalDelayMarkers = [];

  // Loop through locations and create city and state markers
  for (var i = 0; i < data.length; i++) {
    // Setting the marker radius for the state by passing population into the markerSize function
    meanArrivalDelayMarkers.push(
      L.circle([data[i].origin_latitude, data[i].origin_longitude], {
        stroke: false,
        fillOpacity: 0.6,
        color: "white",
        fillColor: "white",
        radius: markerSize2(data[i].mean_arrival_delay)
      }).bindPopup("<h1>" + data[i].origin_airport_name + "</h1> <hr> <h3>Mean Arrival Delay: " + data[i].mean_arrival_delay + "</h3>")    //"</h3> <h3>"
    );

    // Setting the marker radius for the city by passing population into the markerSize function
    flightCountMarkers.push(
      L.circle([data[i].origin_latitude, data[i].origin_longitude], {
        stroke: false,
        fillOpacity: 0.6,
        color: "purple",
        fillColor: "purple",
        radius: markerSize(data[i].flight_count)
      }).bindPopup("<h1>" + data[i].origin_airport_name + " (" +  data[i].origin_airport + ")" + "</h1> <hr> <h3>" + data[i].origin_city + ", " +  data[i].origin_state + "</h3> <hr> <h3>Flight Count: " + data[i].flight_count + "</h3>")
    );
  }

  // Define variables for our base layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Create two separate layer groups: one for cities and one for states
  var meanArrivalDelay = L.layerGroup(meanArrivalDelayMarkers);
  var flightCount = L.layerGroup(flightCountMarkers);

  // Create a baseMaps object
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create an overlay object
  var overlayMaps = {
    "Mean Arrival Delay": meanArrivalDelay,
    "Flights per Year": flightCount
  };

  // Define a map object
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [darkmap, meanArrivalDelay, flightCount]
  });

  // Pass our map layers into our layer control
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

})



// LINE CHART

var cancellationUrl = "/line";

d3.json(cancellationUrl).then(function(data) {
  console.log(data)

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



// PIE CHART
var airlineUrl = "/pie";

d3.json(airlineUrl).then(function(dataset) {
  console.log(dataset)

  
  // chart dimensions
  var width = 1400;
  var height = 800;

  // a circle chart needs a radius
  var radius = Math.min(width, height) / 2;

  // legend dimensions
  var legendRectSize = 25; // defines the size of the colored squares in legend
  var legendSpacing = 6; // defines spacing between squares

  // define color scale
  var color = d3.scaleOrdinal(d3.schemePaired);
  // var color = d3.scaleOrdinal()
  //     .range(["#0033FF", "#009900", "#0066FF", "#009966", "#0099FF", "00CC00", "00CCFF", "00FF33", "00FFFF", "33FFFF", "6600CC", "666600", "CC3300", "CC6600"]);

  var svg = d3.select('#chart') // select element in the DOM with id 'chart'
      .append('svg') // append an svg element to the element we've selected
      .attr('width', width) // set the width of the svg element we just added
      .attr('height', height) // set the height of the svg element we just added
      .append('g') // append 'g' element to the svg element
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

  var arc = d3.arc()
      .innerRadius(0) // none for pie chart
      .outerRadius(radius); // size of overall chart

  var pie = d3.pie() // start and end angles of the segments
      .value(function (d) { return d.count; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in descending value. this will mess with our animation so we set it to null

  // define tooltip
  var tooltip = d3.select('#chart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected                                    
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

  tooltip.append('div') // add divs to the tooltip defined above                            
      .attr('class', 'label'); // add class 'label' on the selection                         

  tooltip.append('div') // add divs to the tooltip defined above                     
      .attr('class', 'count'); // add class 'count' on the selection                  

  tooltip.append('div') // add divs to the tooltip defined above  
      .attr('class', 'percent'); // add class 'percent' on the selection

  dataset.forEach(function (d) {
      d.count = +d.count; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
  });

  // creating the chart
  var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(dataset)) //associate dataset with the path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', function (d) { return color(d.data.label); }) // use color scale to define fill of each label in dataset
      .each(function (d) { this._current - d; }); // creates a smooth animation for each track

  // mouse event handlers are attached to path so they need to come after its definition
  path.on('mouseover', function (d) {  // when mouse enters div      
      var total = d3.sum(dataset.map(function (d) { // calculate the total number of tickets in the dataset         
          return (d.enabled) ? d.count : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase                                      
      }));
      var percent = Math.round(1000 * d.data.count / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.label); // set current label           
      tooltip.select('.count').html(d.data.count + " Total Minutes Delayed"); // set current count            
      tooltip.select('.percent').html(percent + '%'); // set percent calculated above          
      tooltip.style('display', 'block'); // set display                     
  });

  path.on('mouseout', function () { // when mouse leaves div                        
      tooltip.style('display', 'none'); // hide tooltip for that element
  });

  path.on('mousemove', function (d) { // when mouse moves                  
      tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
          .style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
  });

  // define legend
  var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function (d, i) {
          var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
          var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
          var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
          var vert = i * height - offset; // the top of the element is shifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
          return 'translate(' + horz + ',' + vert + ')'; //return translation       
      });

  // adding colored squares to legend
  legend.append('rect') // append rectangle squares to legend                                   
      .attr('width', legendRectSize) // width of rect size is defined above                        
      .attr('height', legendRectSize) // height of rect size is defined above                      
      .style('fill', color) // each fill is passed a color
      .style('stroke', color) // each stroke is passed a color
      .on('click', function (label) {
          var rect = d3.select(this); // this refers to the colored squared just clicked
          var enabled = true; // set enabled true to default
          var totalEnabled = d3.sum(dataset.map(function (d) { // can't disable all options
              return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
          }));

          if (rect.attr('class') === 'disabled') { // if class is disabled
              rect.attr('class', ''); // remove class disabled
          } else { // else
              if (totalEnabled < 2) return; // if less than two labels are flagged, exit
              rect.attr('class', 'disabled'); // otherwise flag the square disabled
              enabled = false; // set enabled to false
          }

          pie.value(function (d) {
              if (d.label === label) d.enabled = enabled; // if entry label matches legend label
              return (d.enabled) ? d.count : 0; // update enabled property and return count or 0 based on the entry's status
          });

          path = path.data(pie(dataset)); // update pie with new data

          path.transition() // transition of redrawn pie
              .duration(750) // 
              .attrTween('d', function (d) { // 'd' specifies the d attribute that we'll be animating
                  var interpolate = d3.interpolate(this._current, d); // this = current path element
                  this._current = interpolate(0); // interpolate between current value and the new value of 'd'
                  return function (t) {
                      return arc(interpolate(t));
                  };
              });
      });

  // adding text to legend
  legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) { return d; });

})


// DONUT 1 GRAPH
var donut1Url = "/donut1";

d3.json(donut1Url).then(function(dataset) {
  console.log(dataset)

  var div = d3.select("body").append("div").attr("class", "toolTip");

  
  // legend dimensions
  var legendRectSize = 25; // defines the size of the colored squares in legend
  var legendSpacing = 6; // defines spacing between squares
  
  var width = 800,
      height = 600,
      radius = Math.min(width, height) / 2;
  
  var color = d3.scaleOrdinal()   //
      .range(["#009FFF", "#FF3F00", "#FFBF00", "#029F00"]);
  
  var arc = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);
  
  var pie = d3.pie()
      .sort(null)
      .startAngle(1.1 * Math.PI)
      .endAngle(3.1 * Math.PI)
      .value(function (d) { return d.total; });
  
  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
  
  var g = svg.selectAll(".arc")
      .data(pie(dataset))
      .enter().append("g")
      .attr("class", "arc");
  
  g.append("path")
      .style("fill", function (d) { return color(d.data.label); })
      .transition().delay(function (d, i) {
          return i * 500;
      }).duration(500)
      .attrTween('d', function (d) {
          var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
          return function (t) {
              d.endAngle = i(t);
              return arc(d)
          }
      });
  g.append("text")
      .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .transition()
      .delay(1000)
      .text(function (d) { return d.data.label; });
  
  d3.selectAll("path").on("mousemove", function (d) {
      div.style("left", d3.event.pageX + 10 + "px");
      div.style("top", d3.event.pageY - 25 + "px");
      div.style("display", "inline-block");
      div.html((d.data.label) + "<br>" + (d.data.total) + "<br>" + (d.data.percent) + "%");
  });
  
  d3.selectAll("path").on("mouseout", function (d) {
      div.style("display", "none");
  });
  
  
  //d3.select("body").transition().style("background-color", "#d3d3d3");
  function type(d) {
      d.total = +d.total;
      return d;
  }
  
  // define legend
  var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function (d, i) {
          var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
          var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
          var horz = -2 * legendRectSize; // the legend is shifted to the left to make room for the text
          var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
          return 'translate(' + horz + ',' + vert + ')'; //return translation       
      });
  
  // adding colored squares to legend
  legend.append('rect') // append rectangle squares to legend                                   
      .attr('width', legendRectSize) // width of rect size is defined above                        
      .attr('height', legendRectSize) // height of rect size is defined above                      
      .style('fill', color) // each fill is passed a color
      .style('stroke', color) // each stroke is passed a color
      .on('click', function (label) {
          var rect = d3.select(this); // this refers to the colored squared just clicked
          var enabled = true; // set enabled true to default
          var totalEnabled = d3.sum(dataset.map(function (d) { // can't disable all options
              return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
          }));
  
  
      });
  
  // adding text to legend
  legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) { return d; }); // return label

})


// DONUT 2 GRAPH

var donut2Url = "/donut2";

d3.json(donut2Url).then(function(dataset) {
  console.log(dataset)

    // chart dimensions
  var width = 800;
  var height = 600;

  // a circle chart needs a radius
  var radius = Math.min(width, height) / 2;
  var donutWidth = 100; // size of donut hole. 

  // legend dimensions
  var legendRectSize = 25; // defines the size of the colored squares in legend
  var legendSpacing = 6; // defines spacing between squares

  // define color scale
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // calculate new total
  var total = d3.sum(dataset, d => d.count);

  // define new total section
  var newTotal = d3.select('.new-total-holder')
      .append('span')
      .attr('class', 'newTotal').text(total);

  var svg = d3.select('#chart') // select element in the DOM with id 'chart'
      .append('svg') // append an svg element to the element we've selected
      .attr('width', width) // set the width of the svg element we just added
      .attr('height', height) // set the height of the svg element we just added
      .append('g') // append 'g' element to the svg element
      .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')'); // our reference is now to the 'g' element. centerting the 'g' element to the svg element

  var arc = d3.arc()
      .innerRadius(radius - donutWidth) // radius - donutWidth = size of donut hole. use 0 for pie chart
      .outerRadius(radius); // size of overall chart

  var pie = d3.pie() // start and end angles of the segments
      .value(function (d) { return d.count; }) // how to extract the numerical data from each entry in our dataset
      .sort(null); // by default, data sorts in oescending value. this will mess with our animation so we set it to null

  // define tooltip   

  var tooltip = d3.select('#chart') // select element in the DOM with id 'chart'
      .append('div') // append a div element to the element we've selected                                    
      .attr('class', 'tooltip'); // add class 'tooltip' on the divs we just selected

  tooltip.append('div') // add divs to the tooltip defined above
      .attr('class', 'label'); // add class 'label' on the selection
  tooltip.append('div') // add divs to the tooltip defined above   
      .attr('class', 'count'); // add class 'count' on the selection                  
  tooltip.append('div') // add divs to the tooltip defined above  
      .attr('class', 'percent'); // add class 'percent' on the selection

  dataset.forEach(function (d) {
      d.count = +d.count; // calculate count as we iterate through the data
      d.enabled = true; // add enabled property to track which entries are checked
  });

  // creating the chart
  var path = svg.selectAll('path') // select all path elements inside the svg. specifically the 'g' element. they don't exist yet but they will be created below
      .data(pie(dataset)) //associate dataset wit he path elements we're about to create. must pass through the pie function. it magically knows how to extract values and bakes it into the pie
      .enter() //creates placeholder nodes for each of the values
      .append('path') // replace placeholders with path elements
      .attr('d', arc) // define d attribute with arc function above
      .attr('fill', function (d) { return color(d.data.label); }) // use color scale to define fill of each label in dataset
      .each(function (d) { this._current - d; }); // creates a smooth animation for each track

  // mouse event handlers are attached to path so they need to come after its definition
  path.on('mouseover', function (d) {  // when mouse enters div      
      var total = d3.sum(dataset.map(function (d) { // calculate the total number of tickets in the dataset         
          return (d.enabled) ? d.count : 0; // checking to see if the entry is enabled. if it isn't, we return 0 and cause other percentages to increase                                      
      }));
      var percent = Math.round(1000 * d.data.count / total) / 10; // calculate percent
      tooltip.select('.label').html(d.data.label); // set current label           
      tooltip.select('.count').html(d.data.count); // set current count            
      tooltip.select('.percent').html(percent + '%'); // set percent calculated above          
      tooltip.style('display', 'block'); // set display                     
  });

  path.on('mouseout', function () { // when mouse leaves div                        
      tooltip.style('display', 'none'); // hide tooltip for that element
  });

  path.on('mousemove', function (d) { // when mouse moves                  
      tooltip.style('top', (d3.event.layerY + 10) + 'px') // always 10px below the cursor
          .style('left', (d3.event.layerX + 10) + 'px'); // always 10px to the right of the mouse
  });

  // define legend
  var legend = svg.selectAll('.legend') // selecting elements with class 'legend'
      .data(color.domain()) // refers to an array of labels from our dataset
      .enter() // creates placeholder
      .append('g') // replace placeholders with g elements
      .attr('class', 'legend') // each g is given a legend class
      .attr('transform', function (d, i) {
          var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
          var offset = height * color.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
          var horz = -2 * legendRectSize; // the legend is shifted to the left to make room for the text
          var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
          return 'translate(' + horz + ',' + vert + ')'; //return translation       
      });

  // adding colored squares to legend
  legend.append('rect') // append rectangle squares to legend                                   
      .attr('width', legendRectSize) // width of rect size is defined above                        
      .attr('height', legendRectSize) // height of rect size is defined above                      
      .style('fill', color) // each fill is passed a color
      .style('stroke', color) // each stroke is passed a color
      .on('click', function (label) {
          var rect = d3.select(this); // this refers to the colored squared just clicked
          var enabled = true; // set enabled true to default
          var totalEnabled = d3.sum(dataset.map(function (d) { // can't disable all options
              return (d.enabled) ? 1 : 0; // return 1 for each enabled entry. and summing it up
          }));
          if (rect.attr('class') === 'disabled') { // if class is disabled
              rect.attr('class', ''); // remove class disabled
          } else { // else
              if (totalEnabled < 2) return; // if less than two labels are flagged, exit
              rect.attr('class', 'disabled'); // otherwise flag the square disabled
              enabled = false; // set enabled to false
          }

          pie.value(function (d) {
              if (d.label === label) d.enabled = enabled; // if entry label matches legend label
              return (d.enabled) ? d.count : 0; // update enabled property and return count or 0 based on the entry's status
          });

          path = path.data(pie(dataset)); // update pie with new data

          path.transition() // transition of redrawn pie
              .duration(750) // 
              .attrTween('d', function (d) { // 'd' specifies the d attribute that we'll be animating
                  var interpolate = d3.interpolate(this._current, d); // this = current path element
                  this._current = interpolate(0); // interpolate between current value and the new value of 'd'
                  return function (t) {
                      return arc(interpolate(t));
                  };
              });

          // calculate new total
          var newTotalCalc = d3.sum(dataset.filter(function (d) { return d.enabled; }), d => d.count)
          // console.log(newTotalCalc);

          // append newTotalCalc to newTotal which is defined above
          newTotal.text(newTotalCalc);
      });

  // adding text to legend
  legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) { return d; }); // return label



})

// BAR GRAPH
var barUrl = "/bar";

d3.json(barUrl, function (d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  return d;
  }).then(function(data) {
    console.log(data)

  var svg = d3.select("svg"),
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom,
  g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // The scale spacing the groups:
  var x0 = d3.scaleBand()
  .rangeRound([0, width])
  .paddingInner(0.1);

  // The scale for spacing each group's bar:
  var x1 = d3.scaleBand()
  .padding(0.05);

  var y = d3.scaleLinear()
  .rangeRound([height, 0]);

  var z = d3.scaleOrdinal()
  .range(["#009FFF", "#FF3F00", "#FFBF00", "#029F00"]);


  var keys = Object.keys(data[0]).filter(h => h !== "airline");
  console.log(keys);


  console.log('keys');
  console.log(keys);
  x0.domain(data.map(function (d) { return d.airline; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { return d[key]; }); })]).nice();

  g.append("g")
      .selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function (d) { return "translate(" + x0(d.airline) + ",0)"; })
      .selectAll("rect")
      .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })
      .enter().append("rect")
      .attr("x", function (d) { return x1(d.key); })
      .attr("y", function (d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function (d) { return height - y(d.value); })
      .attr("fill", function (d) { return z(d.key); });

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Total Minutes");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 17)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", z)
      .attr("stroke", z)
      .attr("stroke-width", 2)
      .on("click", function (d) { update(d) });

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function (d) { return d; });

  var filtered = [];

  ////
  //// Update and transition on click:
  ////

  function update(d) {

      //
      // Update the array to filter the chart by:
      //

      // add the clicked key if not included:
      if (filtered.indexOf(d) == -1) {
          filtered.push(d);
          // if all bars are un-checked, reset:
          if (filtered.length == keys.length) filtered = [];
      }
      // otherwise remove it:
      else {
          filtered.splice(filtered.indexOf(d), 1);
      }

      //
      // Update the scales for each group(/airlines)'s items:
      //
      var newKeys = [];
      keys.forEach(function (d) {
          if (filtered.indexOf(d) == -1) {
              newKeys.push(d);
          }
      })
      x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(data, function (d) { return d3.max(keys, function (key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();

      // update the y axis:
      svg.select(".y")
          .transition()
          .call(d3.axisLeft(y).ticks(null, "s"))
          .duration(500);


      //
      // Filter out the bands that need to be hidden:
      //
      var bars = svg.selectAll(".bar").selectAll("rect")
          .data(function (d) { return keys.map(function (key) { return { key: key, value: d[key] }; }); })

      bars.filter(function (d) {
          return filtered.indexOf(d.key) > -1;
      })
          .transition()
          .attr("x", function (d) {
              return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width")) / 2;
          })
          .attr("height", 0)
          .attr("width", 0)
          .attr("y", function (d) { return height; })
          .duration(500);

      //
      // Adjust the remaining bars:
      //
      bars.filter(function (d) {
          return filtered.indexOf(d.key) == -1;
      })
          .transition()
          .attr("x", function (d) { return x1(d.key); })
          .attr("y", function (d) { return y(d.value); })
          .attr("height", function (d) { return height - y(d.value); })
          .attr("width", x1.bandwidth())
          .attr("fill", function (d) { return z(d.key); })
          .duration(500);


      // update legend:
      legend.selectAll("rect")
          .transition()
          .attr("fill", function (d) {
              if (filtered.length) {
                  if (filtered.indexOf(d) == -1) {
                      return z(d);
                  }
                  else {
                      return "white";
                  }
              }
              else {
                  return z(d);
              }
          })
          .duration(100);

  }

});


