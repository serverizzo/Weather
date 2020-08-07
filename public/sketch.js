const tenMilesInMeters = 16093;

// setup map
var mymap = L.map('mapid').setView([51.505, -0.09], 3);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY2VydmVyaXp6b2UiLCJhIjoiY2tjdzMwZDdmMGE0ZzJwcnUzNW5hdzZuYyJ9.pc3PtCFHL_MvqUCykFbORA'
}).addTo(mymap);


function updatePleaseWait() {
    document.getElementById('waiting').textContent = "";
}


// p5 function -- first to execute 
function setup() {
    noCanvas();
    geolocate("first")

}


let isOn = false
let circle;
let centerFunction = function () {
    circle.setLatLng(mymap.getCenter())
    console.log("I moved!")
}

function toggleCircle() {

    if (isOn) {
        deleteCircle()
        geolocate()
        document.getElementById("geolocateButtonText").innerHTML = "Change my coordinates"
    }
    else {
        // create visual indicator
        makeCircle()
        // change button text to geolocate
        document.getElementById("geolocateButtonText").innerHTML = "Geolocate here"
    }
    isOn = !isOn
}

function deleteCircle() {
    // remove event listener for movement
    mymap.off("move", centerFunction)
    // remove circle
    circle.remove()
    console.log("removed listener")
}

function makeCircle() {
    const ll = mymap.getCenter()
    console.log(ll)
    latitude = ll.lat;
    longitude = ll.lng;

    circle = L.circle(mymap.getCenter(), {
        color: '#9000ff',
        fillColor: '#9000ff',
        fillOpacity: 0.5,
        radius: tenMilesInMeters
    }).addTo(mymap);


    // add event listener for movement (panning)
    mymap.on("move", centerFunction)
}




async function geolocate(myInput) {
    if ('geolocation' in navigator) {
        console.log("Geolocation avalible. Please wait for location.")

        navigator.geolocation.getCurrentPosition(async (position) => {
            // console.log(position);

            // toFixed truncates the decimal

            let latitude, longitude
            console.log("myInput: ", myInput)
            if (myInput === "first") {
                console.log("executed")
                latitude = position.coords.latitude.toFixed(3)
                longitude = position.coords.longitude.toFixed(3)
            }
            else {
                const ll = mymap.getCenter()
                console.log(ll)
                latitude = ll.lat;
                longitude = ll.lng;
            }

            //update html
            document.getElementById("lon").textContent = longitude
            document.getElementById("lat").textContent = latitude
            // console.log(longitude)
            // console.log(latitude)



            // request weather from server endpoint
            const latlon = `${latitude},${longitude}`
            const weather_response = await fetch(`/weather/${latlon}`)
            const weatherInfojson = await weather_response.json()
            // console.log(weatherInfojson)

            // update weather
            document.getElementById("weatherBase").textContent = weatherInfojson.name;
            document.getElementById("weather").textContent = weatherInfojson.weather[0].main;
            document.getElementById("tempature").textContent = weatherInfojson.main.temp;
            document.getElementById("feelsLike").textContent = weatherInfojson.main.feels_like;


            // request air quality from server endpoint
            const aq_response = await fetch(`/aq/${latlon}`)
            const aq_json = await aq_response.json();
            console.log(aq_json)

            // put data in database
            const data = {
                latitude,
                longitude,
                weatherInfojson,
                aq_json
            }
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }
            const response = await fetch('/api', options)
            const json = await response.json();
            console.log(json)


            //  change zoom and position of map
            // mymap.setZoom
            mymap.setView([latitude, longitude], 10)

            var marker = L.marker([latitude, longitude]).addTo(mymap);
            marker.bindPopup("You are here.").openPopup();

            for (let i = 0; i < aq_json.results.length; i++) {
                const curr = aq_json.results[i]
                const aqNode = L.marker([curr.coordinates.latitude, curr.coordinates.longitude]).addTo(mymap);

                let measurements = "";
                for (let j = 0; j < curr.measurements.length; j++) {
                    measurements +=
                        `<br>
                        Pollutant: ${curr.measurements[j].parameter} <br>
                        Value: ${curr.measurements[j].value} ${curr.measurements[j].unit}  <br>
                        Updates: ${curr.measurements[j].lastUpdated} <br>
                        Source: ${curr.measurements[j].sourceName} <br>
                        `
                }

                const popupContent = aqNode.bindPopup(`<p>
                    City: ${curr.city}, <br>
                    Coordinates: ${curr.coordinates.latitude}, ${curr.coordinates.longitude} <br>
                    Location: ${curr.location} <br>
                    Measurements: <br> ${measurements}
                    </p>`)
            }

            updatePleaseWait()

        })
    } else {
        console.log("Geolocation unavalible")
    }

    console.log("Button function completed.");
}