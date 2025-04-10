function setDateTime() {
    let now = new Date()
    document.getElementById("currentDate").textContent = now.toLocaleString('en-US', { dateStyle: 'full' })
    document.getElementById("currentTime").textContent = now.toLocaleString('en-US', { timeStyle: 'short' })
}
setInterval(setDateTime, 1000);

let input = document.getElementById("inputBox")
input.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        document.getElementById("message-box").classList.add("hidden")
        document.getElementById("post-search").classList.remove("hidden")

        document.getElementById("container").classList.remove("h-[70vh]")
        document.getElementById("container").classList.add("max-h-[70vh]")


        if (input.value.trim().length > 1) {
            console.log(input.value)
            getData(input.value)
            input.value = ""
        }
    }
})

setDateTime()

async function getData(input) {
    try {
        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${input}&appid=***REMOVED***&units=metric`)
        let responseForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${input}&appid=***REMOVED***&units=metric`)
        if (!response.ok) {
            console.log(`${response.status}: ${response.statusText}`)
        }
        if (!responseForecast.ok) {
            console.log(`${responseForecast.status}: ${responseForecast.statusText}`)
        }
        let data = await response.json()
        let dataForecast = await responseForecast.json()
        console.log(data)
        // console.log(dataForecast)
        updateCurrentWeather(data)
        updateTodayForecast(dataForecast)
    } catch (error) {
        console.log(error)
    }
}

function updateCurrentWeather(data) {
    let cityName = data.name
    let country = data.sys.country
    let temperature = Math.round(data.main.temp)
    let weatherDescrip = data.weather[0].description
    let feelsLike = Math.round(data.main.feels_like)
    let windSpeed = data.wind.speed
    let clouds = data.clouds.all
    let humidity = data.main.humidity
    let iconCode = data.weather[0].icon
    let iconUrl = `../assets/icons/${iconCode}.png`

    let now = new Date()
    let options = { month: "long", day: "numeric", year: "numeric" }

    document.getElementById("cityName").textContent = `${cityName}, ${country}`
    document.getElementById("todayDate").textContent = now.toLocaleString('en-US', options)
    document.getElementById("currentTemp").textContent = `${temperature} °C`
    document.getElementById("weatherDescrip").textContent = weatherDescrip
    document.getElementById("realfeel-value").textContent = `${feelsLike} °C`
    document.getElementById("wind-value").textContent = `${windSpeed} m/s`
    document.getElementById("clouds-value").textContent = `${clouds == 0 ? "-" : clouds + "%"}`
    document.getElementById("humidity-value").textContent = `${humidity}%`

    let img = document.createElement("img")
    img.setAttribute("src", iconUrl)
    img.setAttribute("alt", weatherDescrip)
    img.classList.add("w-13", "h-13")
    document.getElementById("weatherIcon").innerHTML = ""
    document.getElementById("weatherIcon").appendChild(img)
}

function formattedDate() {
    let now = new Date()
    let year = now.getFullYear()
    let month = String(now.getMonth() + 1).padStart(2, "0")
    let date = String(now.getDate()).padStart(2, "0")

    let finalDate = `${year}-${month}-${date}`
    return finalDate
}

function filterArray(data) {
    let newArray = data.list.filter(item => item.dt_txt.startsWith(formattedDate()))
    return newArray
}

function updateTodayForecast(data) {
    let filteredArray = filterArray(data)

    let todayForecastCount = filteredArray.length
    document.getElementById("todayForecastCount").textContent = `${todayForecastCount} available forecast${todayForecastCount < 2 ? "" : 's'}`

    let html = ""
    filteredArray.map(item => {
        let iconCode = item.weather[0].icon
        let weatherDescrip = item.weather[0].description
        let iconUrl = `../assets/icons/${iconCode}.png`

        let formattedtime = item.dt_txt.split(" ")[1].slice(0, 5)
        let temp = Math.round(item.main.temp)

        html += `<div class="today-forecast-card bg-amber-50/10 px-3.5 py-2 rounded-md shadow-md flex flex-col gap-3">
                                        <p class="today-forcast-time text-[12px] text-white/70">${formattedtime}</p>
                                        <div class="today-forecast-temp flex flex-col items-center gap-1">
                                            <img src="${iconUrl}" alt="${weatherDescrip}" class="w-6 h-6">
                                            <p class="today-forecast-temp font-medium uppercase text-sm">${temp}°C</p>
                                        </div>
                                        </div>`
    })
    document.getElementById("today-forecast-cards").innerHTML = html
    console.log(data)
}