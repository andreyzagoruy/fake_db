const map = W.maps;
const queryParameters = {};
const centersUrl = 'https://my-json-server.typicode.com/andreyzagoruy/fake_db/centers/';
const centers = [];

function drawCenter(centerId) {
    fetch(centersUrl + centerId)
        .then(response => response.json())
        .then(center => {
            const centerPosition = L.latLng(parseFloat(center.location.lat), parseFloat(center.location.lng));
            const centerMarker = L.marker(centerPosition, {
                icon: W.map.myMarkers.pulsatingIcon
            });
    
            centers.push(centerMarker);
            centerMarker.addTo(map);
            
            centerMarker.bindPopup(
                '<h2>' + center.name + '</h2><span class="center-location">' + center.address + '</span><span class="center-rating">, Rating: ' + center.rating + '</span>', {
                className: 'center-popup'
            });
        })
        .catch(error => {
            console.error(`Error querying centers: ${error.message}`);
        });
}

if (location.search) {
  location.search.substr(1).split('&').forEach(function(parameter) {
    const temp = parameter.split('=');
    const parameterKey = temp[0];
    const parameterValues = temp[1] && decodeURIComponent(temp[1]);
    queryParameters[parameterKey] = parameterValues ? parameterValues.split(';') : parameterValues;
  });
}
if (queryParameters['lat'] && queryParameters['long']) {
    const position = L.latLng(parseFloat(queryParameters['lat']), parseFloat(queryParameters['long']));
    map.setView(position, 13);
} else {
    map.locate({
        setView: true
    });
}

if (queryParameters['id']) queryParameters['id'].forEach(function(id) {
    drawCenter(id);
});