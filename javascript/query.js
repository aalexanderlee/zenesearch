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
var markers = [];
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

window.onload = function() {
      initMap({lat:37.7749, lng:-122.4194});
}

// Initialize the map after the clearing previous version.
function initMap(location) {
  clearMapDiv();
  // Uncomment below segment if you want to grab the last 10 saved data-sets from Firebase.
  // database.ref().limitToLast(10).on("child_added", function(snapshot) {
  //       var sv = snapshot.val();
        // Center the initial map to San Francisco proper.
        var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});
        map.panTo({lat:37.7749, lng:-122.4194}); // map.panTo(center);
        // var center = {lat: sv.latitude, lng: sv.longitude}; // Most recent Firebase lat & lng pairing.
        var marker = new google.maps.Marker({
          position: {lat:37.7749, lng:-122.4194},
          map: map,
        });
        // var type = sv.type;
        var infowindow = new google.maps.InfoWindow({
          content: "Wurrr u atz?!"
        })
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
  // }); // Close snapshot retrieval function from Firebase database.
} // Close initMap()

// Change the city and state user input to latitude/longitude values for request in initMap() and getData().
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

  var query = topic+city+state;
  // Grab the library for translating city to lat and lng.
  var geocoder =  new google.maps.Geocoder();
  geocoder.geocode( {'address': city + state}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
            console.log("location : " + results[0].geometry.location.lat() + " " +results[0].geometry.location.lng());
            var location = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
            initMap({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()});

            // Generate the map for new location from user input
            var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}});
            map.panTo({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}); // map.panTo(center);

            // for (var i = 0; i < results.length; i++) {
            //
            // var marker = new google.maps.Marker({
            //   position: {lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()}, //{lat: sv.latitude, lng: sv.longitude},
            //   map: map,
            // });
            // var infowindow = new google.maps.InfoWindow({
            //   content: results[i].formatted_address
            // })
            // marker.addListener('click', function() {
            //   infowindow.open(map, marker);
            // });
            //
            // }

            // Substitute this request in for possible produceSearch() in getData().
            var request = {
                radius : radius,
                location : {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
                query : query,
                key : 'AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM'
            };
            var service = new google.maps.places.PlacesService(map); //map_inst
            service.textSearch(request, callback);
            console.log ("Request succeeded: " + callback);

            for (var i = 0; i < results.length; i++) {

            var marker = new google.maps.Marker({
              position: {lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()}, //{lat: sv.latitude, lng: sv.longitude},
              map: map,
            });
            var infowindow = new google.maps.InfoWindow({
              content: results[i].formatted_address
            })
            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });

            }



      }
  });
}


function getData() {
  clearMapDiv();
  geoCoder();
} // Close getData()


function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(status)
    // Iterate through results from callback.
    for (var i=0; i<results.length; i++) {
      resultCounter++;
      // Append table structure.
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
      // Format name href link joining and searching.
      var formatName = formatQueryString(results[i].name);
      // var formatAddress = formatQueryString(results[i].formatted_address); (No point, this can confuse the request.)
      // Note to self: DO NOT USE results.photos.html_attributes for <a> linkage, it totally sucks.
      // <a href="'+addshit+'" target="_blank"><h2></h2> </a>
      // <a href="'+results.photos+'" target="_blank"><h2>'+results.place.name+'</h2></a>
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h2>'
        +results[i].name+'</h2></a></td><td><h4>'
        +someRating+'</h4></td><td><h4>'
        +pricing+'</h4></td><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h4>'
        +results[i].formatted_address+'</h4></a></td></tr>');

      var newSearch = {
        name: formatName,
        rating: someRating,
        pricing_level: pricing,
        formatted_address: results[i].formatted_address,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      };
    }
    //Push search results to Firebase
    database.ref().push(newSearch);
  }
} // Close callback()

// Calls document functions upon the submit button trigger.
$(document).ready(function(){
  $(".panel-body").on("click", "#submit-button", {passive: true}, function(event) {
    event.preventDefault();
    //Automatically scroll down to search-results div
    $('html,body').animate({scrollTop: $("#search-results").offset().top}, 'slow');
    validateForm();
  });
});
