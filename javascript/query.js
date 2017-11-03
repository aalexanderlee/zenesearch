// Initialize Firebase to accept new data input from user.
var config = {
    apiKey: "AIzaSyCpkdbr1OLEgZ7xYuZX4J9S0jiFaWLGKgk",
    authDomain: "zenesearch.firebaseapp.com",
    databaseURL: "https://zenesearch.firebaseio.com",
    projectId: "zenesearch",
    storageBucket: "zenesearch.appspot.com",
    messagingSenderId: "391059269856"
  };
firebase.initializeApp(config);
// Track results from API call.
var resultCounter = 0;
var map;
var infowindow;
var markers = [];
var database = firebase.database();


function validateForm() {
    // Clear the search-results div and prepare new table.
    $('#table > tbody').empty();
    var x = $('#query-input').val().trim();
    console.log("x", x);
    var y = $('#lat-input').val().trim();
    console.log("y", y);
    var z = $('#long-input').val().trim();
    console.log("z", z);
    // Check to make sure all inputs are filled.
    if (x == "" || y == "" || z == "")  {
      $("#search-results").append('<div id="error"> Please fill out the appropriate sections. </div>');
    }
    else {
      $("#error").empty();
      initMap();
    }
}

// Clear previous map and prepare for new input.
function clearMapDiv(){
  $('#map').empty();
}


function initMap() {
  var query = $("#query-input").val().trim();
  var latitude = $("#lat-input").val().trim();
  var longitude = $("#long-input").val().trim();
  var radius = $('input[type="radio"]:checked').val();

  var center = {lat: latitude, lng: longitude};
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 10
  });

  infowindow = new google.maps.InfoWindow();
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: center,
      radius: radius,
      type: ['query']
    }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}


// // Function will generate initial map centered in SF proper.
// function initMap() {
//   clearMapDiv();
//   var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});
//   // Grab data from Firebase limited to 10, and substitute coordinates.
//   database.ref().limitToLast(10).on("child_added", function(snapshot) {
//     var sv = snapshot.val();
//         var center = {lat: sv.latitude, lng: sv.longitude};
//         // Center position at last location saved in Firebase from previous search.
//         var marker = new google.maps.Marker({
//           position: center,
//           map: map,
//         });
//         map.panTo(center);
//
//         // Displays information on markers
//         var companies = sv.company;
//         var infowindow = new google.maps.InfoWindow({
//           content: companies
//         })
//         marker.addListener('click', function() {
//           infowindow.open(map, marker);
//         });
//     });
// }
//
//
//
//
//
// // Show initial map and begin grabbing data for new search.
// function getData() {
//   initMap();
//   // Grab your search term.
//   var yourTopic = $("#topic-input").val().trim();
//   topic = formatQueryString(yourTopic);
//   // Grab your city criteria.
//   var location = $("#city-input").val().trim();
//   city = formatQueryString(location);
//   // Grab your state or province criteria.
//   var state = $("#state-input").val().trim();
//   state = formatQueryString(state);
//   // Grab radius from a selection of 4 options to nearest metropolitan.
//   var radius = $('input[type="radio"]:checked').val();
//
//   infowindow = new google.maps.InfoWindow();
//   var service = new google.maps.places.PlacesService(map);
//   service.nearbySearch({
//     type: ['topic'],
//     formatted_address: "city" + "state",
//     radius: radius
//   }, callback);
// }
//
// function callback(results, status) {
//
//   if (status === google.maps.places.PlacesServiceStatus.OK) {
//     for (var i = 0; i < results.length; i++) {
//       resultCounter++;
//       createMarker(results[i]);
//
//       var tableHead = $("<th>");
//       tableHead.attr("scope", "row");
//       tableHead.attr("id", "result-"+resultCounter);
//
//       $('#table > tbody')
//       .append('<tr>'+tableHead+resultCounter+'</th><td><a href="'+response.results[i].photos[i].html_attributions[0]+'" target="_blank"><h2>'+response.results[i].name+'</h2></a></td><td><h4>'+
//       response.results[i].rating+'</h4></td><td><p>'+response.results[i].formatted_address+'</p></td></tr>');
//
//       var newSearch = {
//         html_attributions: response.results[i].photos[i].html_attributions[0],
//         name: response.results[i].name,
//         rating: response.results[i].rating,
//         formatted_address: response.results[i].formatted_address,
//         latitude: response.results[i].geometry.location.lat,
//         longitude: response.results[i].geometry.location.lng,
//         dateAdded: firebase.database.ServerValue.TIMESTAMP,
//       };
//       database.ref().push(newSearch);
//     }
//   }
// };
//
//


// Format all informal searches to correct concatenated format.
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

//Calls document functions.
$(document).ready(function(){

$(".panel-body").on("click", "#submit-button", function(event) {
  event.preventDefault();

  // Automatically scrolls down to search-results div once submitted.
  $('html,body').animate({
        scrollTop: $("#search-results").offset().top},
        'slow');

  validateForm();

}); // On-click for submit.

}); // Document on ready.
