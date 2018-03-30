const map = W.maps;
const queryParameters = {};
const centersUrl = 'https://my-json-server.typicode.com/andreyzagoruy/fake_db/centers/';
const centers = [];

var isCameraCoordinatesSet = false;
var zoomLevel = 13;

const maxLatitudeValue = 90;
const minLatitudeValue = -90;
const maxLongtitudeValue = 180;
const minLongtitudeValue = -180;

function fetchCenter(url, id) {
    return fetch(url + id).then(response => response.ok ? response.json() : null );
}

function createCenterObject(rawCenterData) {
    const centerObject = {
        id: rawCenterData.id,
        name: rawCenterData.name,
        address: rawCenterData.address,
        location: {
            lat: rawCenterData.location.lat,
            lng: rawCenterData.location.lng
        },
        rating: rawCenterData.rating
    }
    return centerObject;
}

function saveCenterDetails(arrayOfCenters, centerToSave) {
    return arrayOfCenters.push(centerToSave);
}

function getPositionObject(lat, lng) {
    if (lat > maxLatitudeValue) lat = maxLatitudeValue;
    if (lat < minLatitudeValue) lat = minLatitudeValue;
    if (lng > maxLongtitudeValue) lng = maxLongtitudeValue;
    if (lng < minLongtitudeValue) lng = minLongtitudeValue;
    return L.latLng(parseFloat(lat), parseFloat(lng));
}

function getBoundariesObject(bottomLeftPoint, upperRightPoint) {
    return L.latLngBounds(bottomLeftPoint, upperRightPoint);
}

function createMarker(markerLocation, markerIcon) {
    return L.marker(markerLocation, { icon: markerIcon });
}

function bindPopup(marker, centerDetails, cssClass) {
    marker.bindPopup('<h2>' + centerDetails.name + '</h2><span class="center-location">' + centerDetails.address + '</span><span class="center-rating">, Rating: ' + centerDetails.rating + '</span>' , { className: cssClass });
}

function drawCenter(center, map, centerIcon = W.map.myMarkers.pulsatingIcon, cssClass = 'center-popup') {
    const centerPosition = getPositionObject(center.location.lat, center.location.lng);
    const centerMarker = createMarker(centerPosition, centerIcon);
    centerMarker.addTo(map);
    bindPopup(centerMarker, center, cssClass);
}

function getAllCoordinates(centersArray, coordinateType) {
    return centersArray.map( coordinate => coordinate.location[coordinateType] );
}

function findMinCoordinate(arrayOfCoordinates) {
    return Math.min(...arrayOfCoordinates);
}

function findMaxCoordinate(arrayOfCoordinates) {
    return Math.max(...arrayOfCoordinates);
}

function findBoundaries(arrayOfCenters) {
    const allLatitudeCoordinates = getAllCoordinates(arrayOfCenters, 'lat');
    const allLongtitudeCoordinates = getAllCoordinates(arrayOfCenters, 'lng');
    const minLatitude = findMinCoordinate(allLatitudeCoordinates);
    const maxLatitude = findMaxCoordinate(allLatitudeCoordinates);
    const minLongtitude = findMinCoordinate(allLongtitudeCoordinates);
    const maxLongtitude = findMaxCoordinate(allLongtitudeCoordinates);
    const verticalCameraMargin = ((maxLatitude + maxLatitudeValue) - (minLatitude + maxLatitudeValue))/32;
    const horizontalCameraMargin = ((maxLongtitude + maxLongtitudeValue) - (minLongtitude + maxLongtitudeValue))/32;
    const bottomLeft = getPositionObject(minLatitude - verticalCameraMargin, minLongtitude - horizontalCameraMargin);
    const upperRight = getPositionObject(maxLatitude + verticalCameraMargin, maxLongtitude + horizontalCameraMargin);
    return [bottomLeft, upperRight];
}

if (location.search) {
    location.search.substr(1).split('&').forEach(function(parameter) {
    const temp = parameter.split('=');
    const parameterKey = temp[0];
    const parameterValues = temp[1] && decodeURIComponent(temp[1]);
    queryParameters[parameterKey] = parameterValues ? parameterValues.split(';') : parameterValues;
  });
}

if (queryParameters['zoom']) zoomLevel = parseInt(queryParameters['zoom']);

if (queryParameters['lat'] && queryParameters['lng']) {
    if (queryParameters['lat'].length > 1 && queryParameters['lng'].length > 1) {
        const bottomLeft = getPositionObject(queryParameters['lat'][0], queryParameters['lng'][0]);
        const upperRight = getPositionObject(queryParameters['lat'][1], queryParameters['lng'][1]);
        const cameraBoundaries = getBoundariesObject(bottomLeft, upperRight);
        map.fitBounds(cameraBoundaries);
        isCameraCoordinatesSet = true;
    } else {
        const cameraPosition = getPositionObject(queryParameters['lat'], queryParameters['lng']);
        map.setView(cameraPosition, zoomLevel);
        isCameraCoordinatesSet = true;
    }
}

if (queryParameters['id']) {
    if (queryParameters['id'].length > 1) {
        let numberOfCentersToFetch = queryParameters['id'].length;
        queryParameters['id'].forEach(function(id) {
            fetchCenter(centersUrl, id)
                .then(response => {
                    if (response !== null) {
                        const center = createCenterObject(response);
                        saveCenterDetails(centers, center);
                        drawCenter(center, map);
                    }
                    numberOfCentersToFetch--;
                    if (!isCameraCoordinatesSet && !numberOfCentersToFetch) {
                        const cameraBoundaries = getBoundariesObject(findBoundaries(centers));
                        map.fitBounds(cameraBoundaries);
                        isCameraCoordinatesSet = true;
                    }
                });
        });
    } else {
        fetchCenter(centersUrl, queryParameters['id'])
            .then(response => {
                if (response === null) return;
                const center = createCenterObject(response);
                saveCenterDetails(centers, center);
                drawCenter(center, map);
                if (!isCameraCoordinatesSet) {
                    const cameraPosition = getPositionObject(center.location.lat, center.location.lng);
                    map.setView(cameraPosition, zoomLevel);
                    isCameraCoordinatesSet = true;
                }
            });
    }
}