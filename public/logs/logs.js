// setup map
var mymap = L.map('mapid').setView([51.505, -0.09], 2);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiY2VydmVyaXp6b2UiLCJhIjoiY2tjdzMwZDdmMGE0ZzJwcnUzNW5hdzZuYyJ9.pc3PtCFHL_MvqUCykFbORA'
}).addTo(mymap);


async function getData() {
    const response = await fetch("../../api")
    const json = await response.json()
    console.log(json)

    for (item in json) {
        console.log(json[item])
        const data = json[item]
        var marker = L.marker([data.latitude, data.longitude]).addTo(mymap);
        marker.bindPopup("You are here.").openPopup();

        // air quality
        for (let i = 0; i < data.aq_json.results.length; i++) {
            const curr = data.aq_json.results[i]
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
    }
}

// var marker = L.marker([latitude, longitude]).addTo(mymap);
// marker.bindPopup("You are here.").openPopup();

// for (let i = 0; i < aq_json.results.length; i++) {
//     const curr = aq_json.results[i]
//     const aqNode = L.marker([curr.coordinates.latitude, curr.coordinates.longitude]).addTo(mymap);

//     let measurements = "";
//     for (let j = 0; j < curr.measurements.length; j++) {
//         measurements +=
//             `<br>
//         Pollutant: ${curr.measurements[j].parameter} <br>
//         Value: ${curr.measurements[j].value} ${curr.measurements[j].unit}  <br>
//         Updates: ${curr.measurements[j].lastUpdated} <br>
//         Source: ${curr.measurements[j].sourceName} <br>
//         `
//     }

//     const popupContent = aqNode.bindPopup(`<p>
//         City: ${curr.city}, <br>
//         Coordinates: ${curr.coordinates.latitude}, ${curr.coordinates.longitude} <br>
//         Location: ${curr.location} <br>
//         Measurements: <br> ${measurements}
//         </p>`)
// }


// 