
var originAirportUrl = "/origin_code_all";

d3.json(originAirportUrl).then(function(data) {
  console.log(data)



  // var data = data;



  // function buildCharts(origin_airport) {
  //   var originAirportUrl = `/origin_code_metadata/${origin_airport}`;
  //   d3.json(originAirportUrl).then(function(data) {

  //     var locations = data
  //     console.log(locations)

  //   })
  // }
  // buildCharts()

  // Function to determine marker size based on population
  function markerSize(flight_count) {
    return flight_count / 1;
  }

  function markerSize2(mean_arrival_delay) {
    return mean_arrival_delay * 5000;
  }

  // var data = [
  //   {
  //   "flight_count": 32467,
  //   "flight_count_delay_ratio": 15300.180793053372,
  //   "mean_arrival_delay": 2.1220010690815334,
  //   "origin_airport": "MKE",
  //   "origin_airport_name": "General Mitchell International Airport",
  //   "origin_city": "Milwaukee",
  //   "origin_latitude": 42.94722,
  //   "origin_longitude": -87.89658,
  //   "origin_state": "WI"
  //   },
  //   {
  //     "flight_count": 2058,
  //     "flight_count_delay_ratio": 54687.92,
  //     "mean_arrival_delay": 0.03763171098845961,
  //     "origin_airport": "LCH",
  //     "origin_airport_name": "Lake Charles Regional Airport",
  //     "origin_city": "Lake Charles",
  //     "origin_latitude": 30.1261,
  //     "origin_longitude": -93.2234,
  //     "origin_state": "LA"
  //   }
  // ]
  // An array containing all of the information needed to create city and state markers
  // var locations = [
  //   {
  //     coordinates: [40.7128, -74.0059],
  //     state: {
  //       name: "New York State",
  //       population: 19795791
  //     },
  //     city: {
  //       name: "New York",
  //       population: 8550405
  //     }
  //   },
  //   {
  //     coordinates: [34.0522, -118.2437],
  //     state: {
  //       name: "California",
  //       population: 39250017
  //     },
  //     city: {
  //       name: "Lost Angeles",
  //       population: 3971883
  //     }
  //   },
  //   {
  //     coordinates: [41.8781, -87.6298],
  //     state: {
  //       name: "Michigan",
  //       population: 9928300
  //     },
  //     city: {
  //       name: "Chicago",
  //       population: 2720546
  //     }
  //   },
  //   {
  //     coordinates: [29.7604, -95.3698],
  //     state: {
  //       name: "Texas",
  //       population: 26960000
  //     },
  //     city: {
  //       name: "Houston",
  //       population: 2296224
  //     }
  //   },
  //   {
  //     coordinates: [41.2524, -95.9980],
  //     state: {
  //       name: "Nebraska",
  //       population: 1882000
  //     },
  //     city: {
  //       name: "Omaha",
  //       population: 446599
  //     }
  //   }
  // ];

  // Define arrays to hold created city and state markers
  var flightCountMarkers = [];
  var meanArrivalDelayMarkers = [];

  // Loop through locations and create city and state markers
  for (var i = 0; i < data.length; i++) {
    // Setting the marker radius for the state by passing population into the markerSize function
    meanArrivalDelayMarkers.push(
      L.circle([data[i].origin_latitude, data[i].origin_longitude], {
        stroke: false,
        fillOpacity: 0.75,
        color: "white",
        fillColor: "white",
        radius: markerSize2(data[i].mean_arrival_delay)
      }).bindPopup("<h1>" + data[i].origin_airport_name + "</h1> <hr> <h3>Mean Arrival Delay: " + data[i].mean_arrival_delay + "</h3>")    //"</h3> <h3>"
    );

    // Setting the marker radius for the city by passing population into the markerSize function
    flightCountMarkers.push(
      L.circle([data[i].origin_latitude, data[i].origin_longitude], {
        stroke: false,
        fillOpacity: 0.75,
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
