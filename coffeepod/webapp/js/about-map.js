function createMap() {
  const hanoi = {lat: 21.0278, lng: 105.8342};
  const googleSF = {lat: 37.773972, lng: -122.431297};
  const college = {lat: 34.0973, lng: -117.7131};
  const ams = {lat: 21.0065, lng: 105.7977};

  const map = new google.maps.Map(
      document.getElementById("map"));

  const hanoiMarker = addMarker(hanoi, 'Ha Noi, my hometown', map, true);
  const collegeMarker = addMarker(college, "Pomona College, where I'm studying", map, true);
  const googleSFMarker = addMarker(googleSF, "Google San Francisco", map, false);
  const amsMarker = addMarker(ams, "Hanoi-Amsterdam, my highschool", map, false);
  

  //default state of map: show two primary markers
  let allPlaces = [college, hanoi];
  let bounds = new google.maps.LatLngBounds();
  for (let i = 0; i < allPlaces.length; i++) {
    bounds.extend(allPlaces[i]);
  }

  map.fitBounds(bounds);

  allMarkers = [hanoiMarker, collegeMarker];

  for (let i = 0; i < allMarkers.length; i++) {
      allMarkers[i].addListener('click', function() {
          map.setZoom(12);
          map.setCenter(allMarkers[i].getPosition());
        });
      allMarkers[i].addListener('dblclick', function() {
            map.fitBounds(bounds);
        });
  }

  //Set some markers visible only when zooming in
  let allMarkersHidden = [googleSFMarker, amsMarker];

  for (let i = 0; i < allMarkersHidden.length; i++) {
      allMarkersHidden[i].addListener('dblclick', function() {
          map.fitBounds(bounds);
        });
  }

  google.maps.event.addListener(map, 'zoom_changed', function() {
    var zoom = map.getZoom();
    // iterate over markers and call setVisible
    for (let i = 0; i < allMarkersHidden.length; i++) {
        allMarkersHidden[i].setVisible(zoom >= 8);
    }
  });

  //add info windows for some markers
  addLandmark(map, amsMarker, "I was the class monitor for 12 English 1, class of 2018 at Hanoi-Amsterdam high school.");

}

/** Add a marker to the map*/
function addMarker(position, title, map, visible ) {
    return new google.maps.Marker({
    position: position,
    map: map,
    visible: visible,
    title: title
  });
}

/** Adds a marker that shows an info window when clicked. */
function addLandmark(map, marker, description) {
  const infoWindow = new google.maps.InfoWindow({content: description});
  marker.addListener('click', () => {
    infoWindow.open(map, marker);
    //close infoWindow if the user zooms out
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() <= 10) {
            infoWindow.close();
        };
    });
  });
}