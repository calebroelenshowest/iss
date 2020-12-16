// Variables : Map
mapboxgl.accessToken
    = 'pk.eyJ1IjoiY2FsZWJyb2VsZW5zIiwiYSI6ImNraTc1OGg5YjAzZTMyem80ZzU4b2hncWcifQ.zIZBL4QUcNQihaHU0dW1lw';

let map;
let map_iss_line_points = {
    'type': 'Feature',
    'properties': {},
    'geometry': {'type': 'LineString', 'coordinates': []}
};
// Variables : Markers
let map_markers = {type: "FeatureCollection", features: []};
let device_marker = null;
let iss_marker = null;
let device_marker_item = null;
let iss_marker_item = null;
let iss_center = false;

// Variables : Locations

let location_device = {};
let location_iss = {};

// Variables : API

let prev_sunset_api_url = null;
let prev_sunset_api_data = null;
let visible_times = [];
let space_station_full_data;

// Variables : Extra

let enable_notification = false;

// Start code

const showSite = () => {
    let splash_screen = document.querySelector(".c-loading-view");
    splash_screen.style.animationName = "splash_screen";
    splash_screen.style.animationDuration = "5s";
    splash_screen.style.animationFillMode = "forwards";

};

const createMap = async () => {
    // Create the map
    map = new mapboxgl.Map({
        container: 'iss_map',                               // Div that should contain map
        style: 'mapbox://styles/mapbox/streets-v11',        // Style layer
        center: [50.9254581, 3.2384068999999998],           // Starting location
        zoom: 1,                                            // Starting zoom
        renderWorldCopies: false                            // Disable horizontal world duplication.
    });
    // Add layers to the map when the map is being/load(ed).
    map.on("load",
        function () {
            // Add source for points to draw line which shows trajectory of the ISS.
            map.addSource("map_iss_line_points", {'type': 'geojson', 'data': map_iss_line_points});
            // Add layer to display the line
            map.addLayer(
                {
                    'id' : 'map_iss_line_points',
                    'type' : 'line',
                    'source' : 'map_iss_line_points',
                    'layout' : {'line-join' : 'round', 'line-cap' : 'round'},
                    'paint' : {'line-color': '#999', 'line-width': 4}
                }
            );
            // Layer added done : Task done.
        });
};

const startApp = async () => {
    // Starting application
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(locationSuccess, locationFailed);
    } else {
        // Set location data to null since getting location failed.
        location_device.lat = null;
        location_device.lon = null;
    }
    // Adding Device marker
    if(location_device.lat !== null && typeof location_device.lat !== "undefined"){
        device_marker = createMarker(location_device, "You");
    } else {
        let locate_device_on_map_btn = document.querySelector(".js-you-focus");
        locate_device_on_map_btn.classList.add("disabled");

    }
    // Now getting location of the ISS
    await getSpaceStationLocation();
    // Adding ISS marker
    if(location_iss.lat || location_iss.lon !== null){
        iss_marker = createMarker(location_iss, "ISS");
    }
    // Getting passing times and adding to HTML
    if(location_device.lat !== null){
        await updateTimeTable();
    } else {
        document.querySelector(".js-table").innerHTML =
            "<p>Failed to get location. Please allow location and reload.</p>";
    }

    // Create marker ITEMS
    let iss_div = document.createElement("div");
    iss_div.className = "marker marker-iss";
    let device_div = document.createElement("div");
    device_div.className = "marker marker-you";
    iss_marker_item = new mapboxgl.Marker(iss_div);
    device_marker_item = new mapboxgl.Marker(device_div);

    if(location_device.lat !== null){
        device_marker_item.setLngLat([location_device.lon, location_device.lat]);
        device_marker_item.addTo(map);
    }

    if(location_iss.lat !== null){
        iss_marker_item.setLngLat([location_iss.lon, location_iss.lat]);
        iss_marker_item.addTo(map);
        document.querySelector(".js-you-focus").classList.remove("disabled");
    }

    // Initiating last steps before looping code

    let thread = window.setInterval(cycle, 2500);

};



let fetchData = async (url, data={}) => {
    return await fetch(url, data)
        .then((r) => r.json())
        .catch((err) => console.log(err));
};

const updateTimeTable = async () => {

    let url =
        `https://cors-anywhere.herokuapp.com/http://api.open-notify.org/iss-pass.json?lat=${location_device.lat}&lon=${location_device.lon}&n=5`;

    let data = await fetchData(url,
        {"Origin": "http://api.open-notify.org",
            headers: {"Origin": "http://api.open-notify.org"}});

    if(data["message"] === "success"){
        for(let item of data["response"]){
            let date = new Date(item["risetime"]*1000);
            let url_visible_data =
                `https://api.sunrise-sunset.org/json?lat=${location_device.lat}&lng=${location_device.lon}
            &date=${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}&formatted=0`;

            // Is data different from last time? : Don't request new data.
            let data_sunset;
            if(url_visible_data !== prev_sunset_api_url){
                // There is a difference: Request new data.
                data_sunset = await fetch(url_visible_data);
                prev_sunset_api_data = data_sunset;
                prev_sunset_api_url = url_visible_data;
            } else {
                // Now difference in data : Switch data to previous data.
                data_sunset = prev_sunset_api_data;
                prev_sunset_api_data = url_visible_data;
            }
            // Get data from received data (ISS risetime data).
            let date_string = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
            let minutes_string = date.getMinutes();
            if(minutes_string < 10){
                minutes_string = "0" + minutes_string.toString();
            }
            let time_hour = date.getHours();
            let time_minutes = date.getMinutes();
            let time_seconds = date.getSeconds();
            let time_string = `${time_hour}:${minutes_string}:${time_seconds}`;
            let minutes = Math.floor(item["duration"]/60);
            let seconds = item["duration"] - minutes * 60;
            let duration = `${minutes}m ${seconds}s`;
            let visible_string = "";

            // Check for visibility (SunSet API data)
            if(data_sunset["status"] === 200 || data_sunset["status"] === "OK"){
                let date_rise_iss = date;
                let date_sun_rise = new Date(Date.parse(data_sunset["sunrise"]));
                let date_sun_set = new Date(Date.parse(data_sunset["sunset"]));


                if(date_rise_iss < date_sun_set && date_rise_iss > date_sun_rise) {
                    visible_string = "YES";
                    visible_times.push(date_rise_iss);
                } else {
                    visible_string = "NO";

                }

                // Updating HTML:
                let html = `<tr class="c-table-item"><td>${date_string}</td><td>${time_string}</td><td>${duration}</td><td>${visible_string}</td></tr>`;
                document.querySelector(".js-table").innerHTML += html;
            }
        }
    } else {
        console.log("Failed to get sunset data");
    }
};

const createMarker = (location, name) => {
    return {
        type: 'Feature',
        geometry: {
            type: "Point",
            coordinates: [location.lon, location.lat]
        },
        properties: {
            title: name,
            description: `marker${name}`
        }
    };
};

const getSpaceStationLocation = async () => {
    let iss_fetch_data = await fetchData("https://api.wheretheiss.at/v1/satellites/25544");
    if(iss_fetch_data !== null){    // Fetch data should not be null
        // Found location: Push to variables.
        location_iss.lat = iss_fetch_data["latitude"];
        location_iss.lon = iss_fetch_data["longitude"];
        space_station_full_data = iss_fetch_data;
    } else {
        // Since getting location failed : setting as null
        location_iss.lat = null;
        location_iss.lon = null;
    }
};

const locationSuccess = (location_data) => {
    // Set location data.
    location_device.lat = location_data.coords.latitude;
    location_device.lon = location_data.coords.longitude;
};

const locationFailed = (location_data) => {
    // Set location data to null since getting location failed.
    location_device.lat = null;
    location_device.lon = null;
};

let registerClicks = () => {
    // Register events

    // Event 1: Switch
    let center_iss_switch = document.querySelector(".js-switch");
    let center_iss_switch_empty = document.querySelector(".js-switch-iss-empty");
    let center_iss_switch_text = document.querySelector(".js-switch-iss");

    center_iss_switch.addEventListener("click", function () {
        if(center_iss_switch_empty.style.order === "0"){
            center_iss_switch_text.innerHTML = "ON";
            center_iss_switch_empty.style.order = 1;
            iss_center = true;
        } else {
            center_iss_switch_text.innerHTML = "OFF";
            center_iss_switch_empty.style.order = 0;
            iss_center = false;
        }
    });

    // Event 2: Notify on pass
    let notify_bell = document.querySelector(".js-notify-div");
    notify_bell.addEventListener("click", function () {
        let notify_status = document.querySelector(".js-notify-status");
        let notify_yes = document.querySelector(".js-notify-yes");
        let notify_no = document.querySelector(".js-notify-no");
        if(enable_notification){
            notify_status.innerHTML = "DISABLED";
            notify_yes.classList.remove("animate-notify");
            notify_no.classList.remove("u-hide");
            notify_yes.classList.add("u-hide");
            enable_notification = false;
        } else {
            notify_status.innerHTML = "ENABLED";
            notify_yes.classList.remove("u-hide");
            notify_no.classList.add("u-hide");
            notify_yes.classList.add("animate-notify");
            enable_notification = true;
        }
    });

    // Event 3: Open pop up and close
    let notify_popup_open = document.querySelector(".js-notify");
    let notify_popup_close = document.querySelectorAll(".js-popup-close");
    let notify_popup_content = document.querySelector(".js-popup");
    // Internal pop up toggle
    let togglePopUp = () => {
      notify_popup_content.classList.toggle("u-hide");
    };
    notify_popup_open.addEventListener("click", togglePopUp);
    for(let close_btn of notify_popup_close){
        close_btn.addEventListener("click", togglePopUp);
    }

    // Event 4: Center on device location
    let center_you_btn = document.querySelector(".js-you-focus");
    center_you_btn.addEventListener("click", function () {
        // Stop the focus on the ISS
        center_iss_switch_empty.style.order = 0;
        center_iss_switch_text.innerHTML = "OFF";
        iss_center = false;
        // Lets fly to our location
        if(location_device.lat !== null){
            map.flyTo({center: [location_device.lon, location_device.lat]});
        }
    });

    // Event 5: Center on ISS location
    let center_iss_btn = document.querySelector(".js-iss-focus");
    center_iss_btn.addEventListener("click", function () {
        map.flyTo({center: [location_iss.lon, location_iss.lat]});
    });

};

let distanceBetween = () => {
    return turf.distance([location_device.lon, location_device.lat], [location_iss.lon, location_iss.lat],
        {"units": "kilometers"});
};

let cycle = async () => {
    // Update items every 2.5s
    await getSpaceStationLocation();
    if(location_iss.lat !== null){
        // Update the location of the marker
        iss_marker_item.setLngLat([location_iss.lon, location_iss.lat]);
        // Update the line trajectory
        let source = map.getSource("map_iss_line_points");
        map_iss_line_points.geometry.coordinates.push([location_iss.lon, location_iss.lat]);
        source.setData(map_iss_line_points);

        // Is the map center on?
        if(iss_center){
            map.flyTo({center: [location_iss.lon, location_iss.lat]});
        }

        // Update stats
        let distance_between = `${distanceBetween().toFixed(2)} km`;
        let distance_height = `${space_station_full_data["altitude"].toFixed(2)} km`;
        let velocity = `${space_station_full_data["velocity"].toFixed(2)} km/h`;
        let longitude = `${location_iss.lon.toFixed(3)}°`;
        let latitude = `${location_iss.lat.toFixed(3)}°`;
        document.querySelector(".js-speed").innerHTML = velocity;
        document.querySelector(".js-latitude").innerHTML = latitude;
        document.querySelector(".js-longitude").innerHTML = longitude;
        document.querySelector(".js-altitude").innerHTML = distance_height;
        document.querySelector(".js-between-distance").innerHTML = distance_between;

        // Notify if needed
        if(visible_times.length !== 0){
            let next_time= visible_times[0];
            let next_time_minus_ten = new Date(new Date().getTime() + 10*60000);
            if(next_time < next_time_minus_ten){
                // Notify the user!
                visible_times[0].remove();
                try {
                    let audio = new Audio("../mp3/Alarm-ringtone.mp3");
                    await audio.play();

                } catch (e) {
                    console.log("Tried playing a sound!");
                }
            }
        }
    }
};

const init_app = async () => {
    console.info("DOMContentLoaded triggered");
    // Start of code
    registerClicks();
    await createMap();
    await startApp();
    showSite();

};

document.addEventListener("DOMContentLoaded", init_app);
