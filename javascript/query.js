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

window.onload = function() {
      initMap({lat:37.7749, lng:-122.4194});
}

// This function will distinguish input errors and notify.
function validateForm() {
    // Clear before use.
    $('#table > tbody').empty();
    // Set values from input boxes to variables.
    var x = $('#topic-input').val().trim();
    console.log("x", x);
    var y = $('#city-input').val().trim();
    console.log("y", y);
    var z = $('#state-input').val().trim();
    console.log("z", z);
    // Confirm everything is filled out.
    if (x == "" || y == "" || z == "")  {
      $("#search-results").append('<div id="error"> Please fill out the appropriate sections. </div>');
    }
    else {
      $("#error").empty();
      initMap();
      getData();
    }
}

// Clear the map of previous map between searches/refresh.
function clearMapDiv(){
  $('#map').empty();
}

// Initialize the map after the clearing previous version.
function initMap(location) {
  clearMapDiv();
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic) + "+";
  // Uncomment to grab the last saved data from Firebase.
  // database.ref().limitToLast(10).on("child_added", function(snapshot) {
  //       var sv = snapshot.val();
        // Center the initial map to San Francisco proper.
        var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});
        map.panTo({lat:37.7749, lng:-122.4194}); // map.panTo(center);
        // var center = {lat: sv.latitude, lng: sv.longitude};
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
        // Here, add the criteria you require for request returned from PlacesService() below.
        // var request = {
        //   location: {lat:37.7749, lng:-122.4194},
        //   radius: $('input[type="radio"]:checked').val(),
        //   query: topic
        // };
        // service = new google.maps.places.PlacesService(map);
        // service.textSearch(request, callback);
  // }); // Close snapshot retrieval function from Firebase database.
} // Close initMap()

// Change the city and state user input to latitude/longitude values for request in initMap() and getData().
function geoCoder() {
  var radius = $('input[type="radio"]:checked').val();

  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic) + "+";

  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  var state = $("#state-input").val().trim();
  state = formatQueryString(state);

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
            var marker = new google.maps.Marker({
              position: {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}, //{lat: sv.latitude, lng: sv.longitude},
              map: map,
            });
            var infowindow = new google.maps.InfoWindow({
              content: "Current location."
            })
            marker.addListener('click', function() {
              infowindow.open(map, marker);
            });


            var request = {
                radius : radius,
                location : {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()},
                query : query,
                key : 'AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM'
            };
            var service = new google.maps.places.PlacesService(map); //map_inst
            service.textSearch(request, callback);
            console.log ("Request succeeded: " + callback);


          }
  });
}

function getData() {
  clearMapDiv();
  geoCoder();
  // initMap();
  function produceSearch(query) {
  // These are our user inputs and search parameters
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic) + "+";
  // console.log(topic);
  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  // console.log(city);
  var state = $("#state-input").val().trim();
  state = "+" + formatQueryString(state);
  // console.log(state);
  var query = topic+city+state;
  console.log(query);
  var radius = $('input[type="radio"]:checked').val();
  console.log(radius);
    // Set _params to be the request object for callback criteria.
    // Change location from Firebase in initMap() => {lat: parseFloat(sv.latitude), lng: parseFloat(sv.longitude)}
    // Set the location from geoCoder() => {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}
    // var request = {
    //     radius : radius,
    //     location : app.modules.mapsProvider.getLatLng({lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}),
    //     query : query,
    //     key : 'AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM'
    // };
    // var service = new google.maps.places.PlacesService(map); //map_inst
    // service.textSearch(request, callback);
    // console.log ("Request succeeded: " + callback);

    // var request = {
    //   location: {lat:37.7749, lng:-122.4194},
    //   radius: $('input[type="radio"]:checked').val(),
    //   query: topic
    // };
    // service = new google.maps.places.PlacesService(map);
    // service.textSearch(request, callback);
  } // Close produceSearch()
} // Close getData()

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(status)
    // Iterate through results from callback.
    for (var i=0; i<results.length; i++) {
      resultCounter++;

      var tableHead = $("<th>");
      tableHead.attr("scope", "row");
      tableHead.attr("id", "result-"+resultCounter);
      console.log(resultCounter);
      console.log(results);
      console.log(status);

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
      // Format name and address correctly for href link joining and searching for <a></a>.
      var formatName = formatQueryString(results[i].name);
      // var formatAddress = formatQueryString(results[i].formatted_address);
      // <a href="'+addshit+'" target="_blank"><h2></h2> </a>
      // <a href="'+results.photos+'" target="_blank"><h2>'+results.place.name+'</h2></a>
      // document.getElementById("aaa").href
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h2>'+results[i].name+'</h2></a></td><td><h4>'+someRating+'</h4></td><td><h4>'+pricing+'</h4></td><td><a href="https://www.google.com/maps?q='+formatName+'" target="_blank"><h4>'+results[i].formatted_address+'</h4></a></td></tr>');

      var newSearch = {
        name: formatName,
        rating: someRating,
        pricing_level: pricing,
        formatted_address: results[i].formatted_address,
        // lat: results[i].geometry.location.lat,
        // lng: results[i].geometry.location.lng,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      };
    }
    //Push search results to Firebase
    database.ref().push(newSearch);
  }
} // Close callback()

// Concatenate spaces for query parameters if necessary. (i.e. san+francisco, etc.)
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

// Calls document functions upon the submit button trigger.
$(document).ready(function(){
  $(".panel-body").on("click", "#submit-button", {passive: true}, function(event) {
    event.preventDefault();
    //Automatically scroll down to search-results div
    $('html,body').animate({scrollTop: $("#search-results").offset().top}, 'slow');
    validateForm();
  });
});
