const map = W.maps;
const queryParameters = {};
const centersUrl = 'https://my-json-server.typicode.com/andreyzagoruy/fake_db/centers/';
const centers = [];

function getAllCoordinates(centersArray, coordinateType) {
    return centersArray.map( coordinate => coordinate.location[coordinateType] );
}

function findMinCoordinate(arrayOfCoordinates) {
    return Math.min(...arrayOfCoordinates);
}

function findMaxCoordinate(arrayOfCoordinates) {
    return Math.max(...arrayOfCoordinates);
}

function findBoundaries() {
    
}

function getPositionObject(lat, lng) {
    return L.latLng(parseFloat(lat), parseFloat(lng));
}

function fetchCenter(url, id) {
    return fetch(url + id).then(response => response.json());
}

function saveCenterDetails(arrayOfCenters, centerToSave) {
    return arrayOfCenters.push(centerToSave);
}

function createMarker(markerLocation, markerIcon) {
    return L.marker(markerLocation, { icon: markerIcon });
}

function bindPopup(marker, centerDetails, cssClass) {
    marker.bindPopup('<h2>' + centerDetails.name + '</h2><span class="center-location">' + centerDetails.address + '</span><span class="center-rating">, Rating: ' + centerDetails.rating + '</span>' , { className: cssClass });
}

function drawMarker(marker, map) {
    marker.addTo(map);
}

if (location.search) {
  location.search.substr(1).split('&').forEach(function(parameter) {
    const temp = parameter.split('=');
    const parameterKey = temp[0];
    const parameterValues = temp[1] && decodeURIComponent(temp[1]);
    queryParameters[parameterKey] = parameterValues ? parameterValues.split(';') : parameterValues;
  });
}
if (queryParameters['lat'] && queryParameters['lng']) {
    const position = L.latLng(parseFloat(queryParameters['lat']), parseFloat(queryParameters['lng']));
    map.setView(position, 13);
} else {
    map.locate({
        setView: true
    });
}

if (queryParameters['id']) queryParameters['id'].forEach(function(id) {
    fetchCenter(centersUrl, id)
        .then(center => {
            const centerPosition = getPositionObject(center.location.lat, center.location.lng);
            const centerMarker = createMarker(centerPosition, W.map.myMarkers.pulsatingIcon);
            saveCenterDetails(centers, center);
            drawMarker(centerMarker, map);
            bindPopup(centerMarker, center, 'center-popup');
        });
});