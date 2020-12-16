let getLocationURL = (latitude, longitude, zoom_level) => {
    return LocationAPIUrl + "&lat=" + String(latitude) + "&lon=" + String(longitude) + "&zoom=" + String(zoom_level);
};

let getISSUrl = () => {
    return IssAPIUrl;
};