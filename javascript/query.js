// Initialize Firebase
var config = {
    apiKey: "AIzaSyCS4KuIbLP5fBej1eOxbNdS3ssOQijwadg",
    authDomain: "test1-49f56.firebaseapp.com",
    databaseURL: "https://test1-49f56.firebaseio.com",
    projectId: "test1-49f56",
    storageBucket: "test1-49f56.appspot.com",
    messagingSenderId: "373692440483"
};

firebase.initializeApp(config);
var resultCounter = 0;
var map;
var markers = [];
var database = firebase.database();

var tl = new TimelineMax({repeat:600000, repeatDelay:1, yoyo:true});
tl.staggerTo("h1,h2", 0.2, {className:"+=superShadow", top:"-=10px", ease:Power1.easeIn}, "0.3", "start")


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

  var options = {
    zoom: 10,
    center: {lat: 37.773972, lng: -122.431297}
  };

  var map = new google.maps.Map(document.getElementById('map'), options);

  database.ref().limitToLast(10).on("child_added", function(snapshot) {
    var sv = snapshot.val();

        var tribeca = {lat: sv.latitude, lng: sv.longitude};
        var marker = new google.maps.Marker({
          position: tribeca,
          map: map,
        });

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
  // var queryURL = /*"https://cors.now.sh/"+*/"https://api.indeed.com/ads/apisearch?publisher=1665103808901378&q="+title+"&l="+city+"%2C+"+state+"&sort=&radius="+radius+"&st=&jt=&start=&limit=&fromage=&filter=&latlong=1&co=us&chnl=&userip=1.2.3.4&useragent=Mozilla/%2F4.0%28Firefox%29&v=2&format=json"
  // Original coordinates from Places API = &location=42.3675294,-71.186966
  var queryURL = "https://maps.googleapis.com/maps/api/place/textsearch/json?query="+topic+"+"+city+"+"+state+"&radius="+radius+"&key=AIzaSyD4W7R9ba_TgScFBewx6wp5VE5zpffpuAY"


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
      $('#table > tbody')
        .append('<tr>'+tableHead+resultCounter+'</th><td><a href="'+response.results[i].photos[i].html_attributions[0]+'" target="_blank"><h2>'+response.results[i].name+'</h2></a></td><td><h4>'+
        response.results[i].rating+'</h4></td><td><p>'+response.results[i].formatted_address+'</p></td></tr>');


      //Define search result terms
      var newSearch = {
        // topic: response.results[i].type,
        topic: response.results[i].name,
        location: response.results[i].formatted_address,
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
