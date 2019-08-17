var myMap = L.map("map", {
    center: [39.381266, -97.922211],
    zoom: 4.5
  });
  
  L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);
  
  var file = "static/origin_flight_summary_data.csv";
  
  d3.csv(file, function(data) {
  
    console.log("csv", data);
  
    // var markers = L.markerClusterGroup();
  
    for (var i = 0; i < data.length; i++) {
        var latitude = data[i].origin_latitude;
        var longitude = data[i].origin_longitude;
        // console.log("location", latitude)
        // console.log("longitude", longitude)
        // if (latitude, longitude) {      
        //     L.marker([latitude, longitude])
        //     markers.addLayer(L.marker([latitude, longitude]).bindPopup(data[i].ORIGIN_AIRPORT_NAME));
        // }
        var location = ([latitude, longitude])
        var mean_delays = data[i].flight_count_delay_ratio
        // console.log("mean delays", typeof mean_delays)
        var delays_corrected = parseFloat(mean_delays)
        // console.log("mean delays", delays_corrected)
        var round_delays = Math.round(delays_corrected)
        console.log("rounded delays", round_delays)



        var color = "";
        if (round_delays >= 50000) {
          color = "red";
        }
        // else if(round_delays < 0) {
        //     color = "green";
        //   }        
        else {
          color = "green";
        }   

        L.circle(location, {
            fillOpacity: 0.75,
            color: "white",
            fillColor: color,
            // Adjust radius
            radius: (round_delays) 
          }).bindPopup("<h1>" + (data[i].origin_airport_name) + "</h1> <hr> <h3>Mean Delays: " + (round_delays) + "</h3>").addTo(myMap);
        }
    });
         
    // myMap.addLayer(markers);


  
  