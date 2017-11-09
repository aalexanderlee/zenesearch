// Firebase is initialized to pass and retrieve request data from Google Places API.
var config = {
    apiKey: "AIzaSyCpkdbr1OLEgZ7xYuZX4J9S0jiFaWLGKgk",
    authDomain: "zenesearch.firebaseapp.com",
    databaseURL: "https://zenesearch.firebaseio.com",
    projectId: "zenesearch",
    storageBucket: "zenesearch.appspot.com",
    messagingSenderId: "391059269856"
};
firebase.initializeApp(config);

// Initialize result counter as the returned data entry IDs
var resultCounter = 0;
var map;
var marker = null;
var markerArr = [];
var database = firebase.database();

// The Green Sock library supplies the header's motion effect.
var tl = new TimelineMax({repeat:600000, repeatDelay:1, yoyo:true});
tl.staggerTo("h1,h2", 0.2, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start")

// This function will help distinguish input errors and notify the user.
function validateForm() {
    // Clear before use.
    $('#table > tbody').empty();
    var topic = $('#topic-input').val().trim();
    console.log("Topic: ", topic);
    var city = $('#city-input').val().trim();
    console.log("City: ", city);
    var state = $('#state-input').val().trim();
    console.log("State: ", state);
    // Confirm everything is filled out.
    if (topic == "" || city == "" || state == "")  {
      $("#search-results").append('<div id="error"> Please fill out the appropriate sections. </div>');
    }
    else {
      $("#error").empty();
      initMap();
      getData();
    }
}

// Concatenate spaces for query parameters when necessary. (i.e. san+francisco, etc.)
function formatQueryString(str) {
    var finalString;
    var splitString = str.split(" ");
    if (splitString.length > 1) {
      finalString = splitString.join("+");
    }
    else {
      finalString = str;
    }
    return finalString;
 }

// Clear the map of previous map between searches/refresh.
function clearMapDiv(){
  $('#map').empty();
}

// Tokyo map loads first.
window.onload = function() {
      initMap({lat:35.6895, lng:139.6917});
}

// Initialize the map after the clearing previous version.
function initMap(location) {
  clearMapDiv();
        // Center the initial map at Tokyo, Japan.
        var tokyo = {lat:35.6895, lng:139.6917}
        var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center: tokyo});
        map.panTo(tokyo);
        // Create marker for Tokyo center.
        var marker = new google.maps.Marker({
          position: tokyo,
          map: map
        });
        var arigato = "Home: Tokyo, JP";
        var infowindow = new google.maps.InfoWindow({
          content: '<a href="https://www.google.com/maps/place/tokyo+japan/" target="_blank"><p>'+arigato+'</p></a>'
        })
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
} // Close initMap()

// Change user input to {lat,lng} values for request in initMap() and getData().
function geoCoder() {
  var radius = $('input[type="radio"]:checked').val();
  console.log("Radius: ", radius);

  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic);
  console.log("Topic: ", topic);

  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  console.log("City: ", city);

  var state = $("#state-input").val().trim();
  state = formatQueryString(state);
  console.log("State/Province: ", state);

  var query = topic + "+" + city + "+" + state;
  console.log("Query: ", query);

  // Grab the library for relating city name to latitude and longitude pairing.
  var geocoder =  new google.maps.Geocoder();
  geocoder.geocode( {'address': query}, function(results, status) {
    for (var i = 0; i < results.length; i++) {
      if (status == google.maps.GeocoderStatus.OK) {
            var userLocation = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
            console.log("Location : ", userLocation);
            var location = userLocation;
            // initMap(location);

            // Generate the map for new location from user input
            var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center: location});
            map.panTo(location);

            // Get the names and addresses using the location, query, and radius acquired.
            var request = {
                radius : radius,
                location : location,
                query : query,
                key : 'AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM'
            };

            // Inject request object to textSearch() for callback() below.
            var service = new google.maps.places.PlacesService(map);
            service.textSearch(request, callback);
            console.log ("Request succeeded: " + callback);
      }
    }
  });
} // Close geoCoder()

// Retrieve the results[i] from callback.
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(status);
    var map = new google.maps.Map(document.getElementById('map'), {zoom: 11, center: results[0].geometry.location});

    // Iterate through results from callback.
    for (var i=0; i < results.length; i++) {
      console.log("THIS IS A RESULT: ", results);
      var resGeo = {lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()};
      markerArr.push(resGeo);
      resultCounter++;
      map.panTo(resGeo);

      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      var latLng = new google.maps.LatLng(results[i].geometry.location.lat(), results[i].geometry.location.lng());
      // createMarker();
      var marker = new google.maps.Marker({
        place: {placeId:results[i].place_id, //results[0].geometry.location,
        location: results[i].geometry.location
        },
        map: map,
      });
      // map.addTo(marker);
      var content = '<a href="https://www.google.com/maps?q='+results[i].formatted_address+'" target="_blank"><p>'+results[i].name+'</p></a>'
      var infowindow = new google.maps.InfoWindow({
        content: content
      });
      marker.addListener('click', function() {
        infowindow.open(map, this);
      });

      google.maps.event.addListener(marker, 'click', (function(marker, content) {
            return function() {
                infowindow.setContent(content);
                infowindow.open(map, marker);
            }
      })(marker, content));

      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      // Append table.
      var tableHead = $("<th>");
      tableHead.attr("scope", "row");
      tableHead.attr("id", "result-"+resultCounter);
      console.log(status);
      console.log(resultCounter);
      console.log(results);
      // If API returns undefined, notify there is no rating.
      var someRating = results[i].rating;
      if (someRating === undefined) {
        someRating = "Merrrp. No ratings here.";
      }
      // If API returns undefined, notify there is no price tier.
      var pricing = results[i].price_level;
      if (pricing === undefined) {
        pricing = "Priceless.";
      }
      // Format name to one .concat() string.
      var formatName = formatQueryString(results[i].name);

      // Append results[i] as table contents.
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h2>'
        +results[i].name+'</h2></a></td><td><h4>'
        +someRating+'</h4></td><td><h4>'
        +pricing+'</h4></td><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h4>'
        +results[i].formatted_address+'</h4></a></td></tr>');

      var newData = {
        name: results[i].name,
        rating: someRating,
        pricing_level: pricing,
        latitude: results[i].geometry.location.lat(),
        longitude: results[i].geometry.location.lng(),
        formatted_address: results[i].formatted_address,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      };
    }//For loop
    //Push search results to Firebase
    database.ref().push(newData);
  } // Close if statement
    // Call accessFirebase() to execute.;
} // Close callback()

// // Uncomment to grab all the iterations out from Firebase to the last 10 objects.
// function accessFirebase() {
//   clearMapDiv();
//
//   database.ref().limitToLast(10).on("child_added", function(snapshot) {
//     // Signify database name.
//     var sv = snapshot.val();
//     var center = {lat: sv.latitude, lng: sv.longitude};
//     console.log("THIS IS THE CENTER: ", center);
//     console.log("Address: ", sv.formatted_address);
//
//     var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center: center});
//     var marker = new google.maps.Marker({
//       position: center,
//       map: map,
//     });
//     map.panTo(center);
//     var infowindow = new google.maps.InfoWindow({
//       content: '<a href="https://www.google.com/maps?q='+sv.formatted_address+'" target="_blank"><p>'+sv.name+'</p></a>'
//     })
//     marker.addListener('click', function() {
//       infowindow.open(marker.get(map), marker);
//     })
//   })
//   // database.ref().remove()
// }


function getData() {
  clearMapDiv();
  geoCoder();
  // callback();
} // Close getData()


// Calls document functions upon the submit button trigger.
$(document).ready(function(){
  $(".panel-body").on("click", "#submit-button", {passive: true}, function(event) {
    event.preventDefault();
    //Automatically scroll down to search-results div
    $('html,body').animate({scrollTop: $("#search-results").offset().top}, 'slow');
    validateForm();
  });
});
