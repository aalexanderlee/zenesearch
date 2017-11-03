// Initialize Firebase
var config = {
    apiKey: "AIzaSyCpkdbr1OLEgZ7xYuZX4J9S0jiFaWLGKgk",
    authDomain: "zenesearch.firebaseapp.com",
    databaseURL: "https://zenesearch.firebaseio.com",
    projectId: "zenesearch",
    storageBucket: "zenesearch.appspot.com",
    messagingSenderId: "391059269856"
  };
firebase.initializeApp(config);
var resultCounter = 0;
var map;
var markers = [];
var database = firebase.database();

// var tl = new TimelineMax({repeat:600000, repeatDelay:1, yoyo:true});
// tl.staggerTo("h1,h2", 0.2, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start")


function validateForm() {
    //Clear the search-results div
    $('#table > tbody').empty();

    var x = $('#topic-input').val().trim();
    console.log("x", x);
    var y = $('#city-input').val().trim();
    console.log("y", y);
    var z = $('#state-input').val().trim();
    console.log("z", z);

    if (x == "" || y == "" || z == "")  {
      $("#search-results").append('<div id="error"> Please fill out the appropriate sections. </div>');
    }
    else {
      $("#error").empty();
      getData();
    }
}



function clearMapDiv(){
  $('#map').empty();
}

function initMap() {

  clearMapDiv();

  var map = new google.maps.Map(document.getElementById('map'), {zoom: 10, center:{lat:37.7749, lng:-122.4194}});

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
    });
}


function getData() {
  var yourTopic = $("#topic-input").val().trim();
  topic = formatQueryString(yourTopic);

  var location = $("#city-input").val().trim();
  city = formatQueryString(location);

  var state = $("#state-input").val().trim();
  state = formatQueryString(state);

  var radius = $('input[type="radio"]:checked').val();

  // Insert before queryURL if jsonp doesn't work - "https://cors.now.sh/"
  // var queryURL = /*"https://cors.now.sh/"+*/"https://api.indeed.com/ads/apisearch?publisher=1665103808901378&q="+topic+"&l="+city+"%2C+"+state+"&sort=&radius="+radius+"&st=&jt=&start=&limit=&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json"
  // Original coordinates from Places API = &location=42.3675294,-71.186966
  // Original key = AIzaSyD4W7R9ba_TgScFBewx6wp5VE5zpffpuAY
  var queryURL = "https://cors.now.sh/"+"https://maps.googleapis.com/maps/api/place/textsearch/json?query="+topic+"+"+city+"+"+state+"&radius="+radius+"&key=AIzaSyAEqiSu63n6-F2BKTTuF_CnvsTpyUsYiNM";


  //Call on Indeed queryURL
  $.ajax({
    url: queryURL,
    dataType: "jsonp",
    method: "GET"
    }).done(function(response) {

    answer = response;
    console.log("Query URL: "+queryURL);

    //Iterate through Indeed response
    for (var i=0; i<response.results.length; i++) {
      resultCounter++;

      var tableHead = $("<th>");
      tableHead.attr("scope", "row");
      tableHead.attr("id", "result-"+resultCounter);
      // var jobLink = response.results[i].jobtitle

      //Appends new divs
      // $('#table > tbody')
      //   .append('<tr>'+tableHead+resultCounter+'</th><td><a href="'+response.results[i].url+'" target="_blank"><h2>'+response.results[i].jobtitle+'</h2></a></td><td><h4>'+
      //   response.results[i].company+'</h4></td><td><p>'+response.results[i].snippet+'</p></td></tr>');

      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="'+response.results[i].photos[i].html_attributions[0]+'" target="_blank"><h2>'+response.results[i].name+'</h2></a></td><td><h4>'+
        response.results[i].rating+'</h4></td><td><p>'+response.results[i].formatted_address+'</p></td></tr>');

      //Define search result terms
      var newSearch = {
      //  job_title: response.results[i].jobtitle,
      //  location: response.results[i].formattedLocation,
      //  company: response.results[i].company,
      //  latitude: response.results[i].latitude,
      //  longitude: response.results[i].longitude,
      //  dateAdded: firebase.database.ServerValue.TIMESTAMP,
        html_attributions: response.results[i].photos[i].html_attributions[0],
        name: response.results[i].name,
        rating: response.results[i].rating,
        formatted_address: response.results[i].formatted_address,
        latitude: response.results[i].geometry.location.lat,
        longitude: response.results[i].geometry.location.lng,
        dateAdded: firebase.database.ServerValue.TIMESTAMP,
      };

      //Push search results to Firebase
      database.ref().push(newSearch);

    } //Close for loop

  }); //Close ajax response

} //Close getData function


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

//Calls document functions
$(document).ready(function(){


$(".panel-body").on("click", "#submit-button", function(event) {
  event.preventDefault();

  //Automatically scroll down to search-results div
  $('html,body').animate({
        scrollTop: $("#search-results").offset().top},
        'slow');

  validateForm();

});//onclick

}); // document on ready
