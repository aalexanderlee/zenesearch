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

// This function will distinguish input errors and notify.
function validateForm() {
    // Clear the search-results div.
    $('#table > tbody').empty();
    // Set values from input boxes to variables.
    var x = $('#topic-input').val().trim();
    console.log("x", x);
    var y = $('#city-input').val().trim();
    console.log("y", y);
    var z = $('#state-input').val().trim();
    console.log("z", z);
    // Check to confirm they were filled out.
    if (x == "" || y == "" || z == "")  {
      $("#search-results").append('<div id="error"> Please fill out the appropriate sections. </div>');
    }
    else {
      $("#error").empty();
      initMap();
      getData();
    }
}

// Clear the map of previous map.
function clearMapDiv(){
  $('#map').empty();
}

// This will help change the city to latitude/longitude values
function geoCoder() {
  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  var state = $("#state-input").val().trim();
  state = formatQueryString(state);
  // Grab the library for translating city to lat and lng.
  var geocoder =  new google.maps.Geocoder();
  geocoder.geocode( {'address': city + state}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log("location : " + results[0].geometry.location.lat() + " " +results[0].geometry.location.lng());
            var location = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()}
          }
  });
}

// Initialize the map after the clearing previous version.
function initMap() {
  clearMapDiv();
  geoCoder();
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic) + "+";
  // Center the new map in San Francisco proper.
  var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});
  // Grab the last saved data from Firebase.
  database.ref().limitToLast(10).on("child_added", function(snapshot) {
        var sv = snapshot.val();
        // var center = {lat: sv.latitude, lng: sv.longitude};
        var marker = new google.maps.Marker({
          position: {lat:37.7749, lng:-122.4194},
          map: map,
        });
        map.panTo({lat:37.7749, lng:-122.4194});
        var type = sv.type;
        var infowindow = new google.maps.InfoWindow({
          content: type
        })
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
        // Here you add the fields you require for request for PlacesService()
        var request = {
          location: {lat:37.7749, lng:-122.4194},
          radius: $('input[type="radio"]:checked').val(),
          types: ['topic']
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
  });
}


function getData() {
  clearMapDiv();
  initMap();
  // These are our user inputs and search parameters
  //var Arr = [];
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic) + "+";
  // console.log(topic);
  //Arr.push(topic);
  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  // console.log(city);
  //Arr.push(city);
  var state = $("#state-input").val().trim();
  state = "+" + formatQueryString(state);
  // console.log(state);
  //Arr.push(state);
  var query = topic+city+state;
  console.log(query);
  var radius = $('input[type="radio"]:checked').val();
  console.log(radius);

  function produceSearch(query) {
    //_params
    var request = {
        radius : radius,
        type : ['query'],
        location : app.modules.mapsProvider.getLatLng({lat: parseFloat(sv.latitude), lng: parseFloat(sv.longitude)}),
        key : 'AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM'
    };
    var service = new google.maps.places.PlacesService(map); //map_inst
    service.textSearch(request, callback);
    console.log ("Request succeeded: " + callback);
  }
} // Close getData()

function callback(results, status) {
  // results is "response"
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(status)
    // Limit results to prevent excessive iterations through response.results[i]
    for (var i=0; i<results.length; i++) {
      resultCounter++;
      // var place = results[i];
      // var photos = place.photos[i].html_attributions[i];
      // var service = new google.maps.places.PlacesService(map); //map_inst
      // service.createMarker(place);
      var tableHead = $("<th>");
      tableHead.attr("scope", "row");
      tableHead.attr("id", "result-"+resultCounter);
      console.log(resultCounter);
      console.log(results);
      console.log(status);

      // <a href="'+addshit+'" target="_blank"><h2></h2> </a>
      // <a href="'+results.photos+'" target="_blank"><h2>'+results.place.name+'</h2></a>
      // document.getElementById("aaa").href
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="+results[i].photos[i].html_attributions[0]+" target="_blank"><h2>'+results[i].name+'</h2></a></td><td><h4>'+
        results[i].rating+'</h4></td><td><p>'+results[i].formatted_address+'</p></td></tr>');

      // var newSearch = {
      //   photo_attributions: results[i].photos[i].html_attributions[0],
      //   type: results[i].name,
      //   rating: results[i].rating,
      //   formatted_address: results[i].formatted_address,
      //   lat: results[i].geometry.location.lat,
      //   lng: results[i].geometry.location.lng,
      //   dateAdded: firebase.database.ServerValue.TIMESTAMP,
      // };
    }
    //Push search results to Firebase
    //database.ref().push(newSearch);
  }
} // Close callback()


function formatQueryString(str) {
    var finalString;
    var splitString = str.split(" ");
    // If there was a space, concatenate it.
    if (splitString.length > 1) {
      finalString = splitString.join("+");
    }
    else {
      finalString = str;
    }
    return finalString;
 }

//Calls document functions
$(document).ready(function(){
  $(".panel-body").on("click", "#submit-button", {passive: true}, function(event) {
    event.preventDefault();
    //Automatically scroll down to search-results div
    $('html,body').animate({scrollTop: $("#search-results").offset().top}, 'slow');
    validateForm();
  });// On click trigger.
}); // Document on ready
