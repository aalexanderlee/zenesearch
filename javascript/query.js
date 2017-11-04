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

// Initialize the map after the clearing previous version.
function initMap() {
  clearMapDiv();
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic);
  // Center the new map in San Francisco proper.
  var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});
  // Grab the last saved data from Firebase.
  database.ref().limitToLast(10).on("child_added", function(snapshot) {
    var sv = snapshot.val();
        var center = {lat: sv.latitude, lng: sv.longitude};
        var marker = new google.maps.Marker({
          position: center,
          map: map,
        });
        map.panTo(center);
        var companies = sv.company;
        var infowindow = new google.maps.InfoWindow({
          content: companies
        })
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
        //Here you add the fields you require for request for PlacesService()
        var request = {
          location: center,
          radius: $('input[type="radio"]:checked').val(),
          types: ['topic']
        };
        service = new google.maps.places.PlacesService(map);
        service.textSearch(request, callback);
  });
}


function getData() {
  initMap();
  // These are our user inputs and search parameters
  //var Arr = [];
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic);
  //Arr.push(topic);
  var location = $("#city-input").val().trim();
  city = formatQueryString(location);
  //Arr.push(city);
  var state = $("#state-input").val().trim();
  state = formatQueryString(state);
  //Arr.push(state);
  var searchTerm = topic+city+state;
  var radius = $('input[type="radio"]:checked').val();

  function produceSearch(searchTerm) {
    //_params
    var request = {
        radius : radius,
        type : ['searchTerm'],
        location : app.modules.mapsProvider.getLatLng(position),
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
    for (var i=0; i<results.results[i].length; i++) {
      resultCounter++;
      // var place = results[i];
      // var photos = place.photos[i].html_attributions[i];
      // var service = new google.maps.places.PlacesService(map); //map_inst
      // service.createMarker(place);
      var tableHead = $("<th>");
      tableHead.attr("scope", "row");
      tableHead.attr("id", "result-"+resultCounter);

      // <a href="'+addshit+'" target="_blank"><h2></h2> </a>
      // <a href="'+results.photos+'" target="_blank"><h2>'+results.place.name+'</h2></a>
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><h2>'+results.results[i].name+'</h2></td><td><h4>'+
        results.results[i].rating+'</h4></td><td><p>'+results.results[i].formatted_address+'</p></td></tr>');

      var newSearch = {
        html_attributions: results.results[i].photos,
        name: results.results[i].name,
        rating: results.results[i].rating,
        formatted_address: results.results[i].formatted_address,
        latitude: results.results[i].geometry.location.lat,
        longitude: results.results[i].geometry.location.lng,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      };
      //Push search results to Firebase
      database.ref().push(newSearch);
    }
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
