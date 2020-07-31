const express = require('express');
const Datastore = require('nedb')
const fetch = require('node-fetch');
require('dotenv').config();

const tenMilesInMeters = 16093;

const {
    request,
    response
} = require('express');


const app = express();
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on ${port}`))
app.use(express.static('public'))
app.use(express.json({
    limit: '1mb'
}))

const database = new Datastore('myDatabase.db')
database.loadDatabase()

app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
        response.json(data)
    });
})

app.post('/api', (request, response) => {
    // console.log("I recieved something :o")
    data = request.body
    data.timestamp = Date.now()
    database.insert(data)
    // return the data entered
    response.json(data)
})

app.get('/weather/:latlon', async (request, response) => {
    const latlon = request.params.latlon.split(',');
    // console.log(latlon)
    const lat = latlon[0]
    const lon = latlon[1]
    // console.log(lat)
    // console.log(lon)


    const APIKey = process.env.API_KEY
    // const lat = 
    // const weatherInfoRaw = await fetch(`http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=e29af522f201978c509b3a6b5b306841`)
    // const weatherInfoRaw = await fetch(`http://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=${APIKey}`)
    const weatherInfoRaw = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=imperial`)
    // const weatherInfoRaw = await fetch(`https://api.openweathermap.org/data/2.5/?q=NewYorkCity,NY&appid=${APIKey}`)
    // .catch(err => console.log(err))
    // api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={your api key}
    // api.openweathermap.org/data/2.5/weather?q={city name},{state code}&appid={your api key}

    const weatherInfojson = await weatherInfoRaw.json()
    // console.log(weatherInfojson)
    response.json(weatherInfojson)
})

app.get('/aq/:latlon', async (request, response) => {

    latlon = request.params.latlon.split(",")
    const lat = latlon[0]
    const lon = latlon[1]
    // Air Quality -- Note: radius = 16093meters = 10 miles
    const aq_response = await fetch(`https://api.openaq.org/v1/latest?coordinates=${lat},${lon}&radius=${tenMilesInMeters}`)
    const aq_data = await aq_response.json()
    console.log(aq_data)

    response.json(aq_data)
})