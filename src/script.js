let btn = document.querySelector(".github-logo")

btn.addEventListener("click", () => {
    getData()
})

async function getData() {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=***REMOVED***&units=metric`)
        // let responseForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=kolkata&appid=***REMOVED***&units=metric`)
        if (!response.ok) {
            console.log(`${response.status}: ${response.statusText}`)
        }
        let data = await response.json()
        console.log(data)
        displayTodayDetails(data)
    } catch (error) {
        console.log(error)
    }
}

function displayTodayDetails(data) {
    let cityName = data.name
    let country = data.sys.country
    let date = new Date(data.dt)
    let temperature = Math.round(data.main.temp)
    let weatherDescrip = data.weather.description
    let feelsLike = data.main.feels_like
    let windSpeed = data.wind.speed
    let clouds = data.clouds.all
    let humidity = data.main.humidity

    
}