function createMap() {

  const austinTexas = {lat: 30.2672, lng: -97.7431};
  const googleMTV = {lat: 37.419857, lng: -122.078827};
  const nyc = {lat: 40.7128, lng: -74.0060};
  const pomona = {lat: 34.0973, lng: -117.7131};

  const map = new google.maps.Map(
      document.getElementById("map"));

  const austinTexasMarker = addMarker(austinTexas, 'Austin, TX', map, true);
  const pomonaMarker = addMarker(pomona, "Claremont, CA", map, true);
  const googleMTVMarker = addMarker(googleMTV, "Google Mountain View", map, true);
  const nycMarker = addMarker(nyc, "NYC", map, true);
  

  //default state of map: show two primary markers
  let allPlaces = [austinTexas, googleMTV, nyc, pomona];
  let bounds = new google.maps.LatLngBounds();
  for (let i = 0; i < allPlaces.length; i++) {
    bounds.extend(allPlaces[i]);
  }

  map.fitBounds(bounds);

  //add info windows for some markers
  addLandmark(map, austinTexasMarker, "Maria's hometown");
  addLandmark(map, pomonaMarker, "Phuong's college");
  addLandmark(map, nycMarker, "Sara's hometown");
  addLandmark(map, googleMTVMarker, "Google, where coffeepod was founded. We were not physically there though. This was built through Google Meet :)");

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