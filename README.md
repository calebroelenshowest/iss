# International Space Station Tracker
* Track the ISS and get notified if it passes.
* Various stats like speed and altitude.
* Timetable with times the ISS passes.

Known bugs and issues: 
* If the location is not allowed, the site could behave strangly. Allow location and reload.
* One of the API's uses an external extra api to avoid CORS. This API can be slow sometimes so loading the webpage can take a while.
* When this ISS goes over the border of the map, the tracking line will create one straight line at the bottom or top of the map.
