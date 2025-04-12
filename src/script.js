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
        document.getElementById("container").classList.add("max-h-[75vh]")


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
        updateCurrentWeather(data)
        updateTodayForecast(dataForecast)
        groupForecastByDate(dataForecast)
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
        let weatherDescrip = item.weather[0].description
        let iconCode = item.weather[0].icon
        let iconUrl = `../assets/icons/${iconCode}.png`

        let formattedtime = item.dt_txt.split(" ")[1].slice(0, 5)
        let temp = Math.round(item.main.temp)

        html += `<div class="today-forecast-card bg-amber-50/10 px-3.5 py-2 rounded-md shadow-md flex flex-col gap-3">
                                        <p class="today-forcast-time text-[12px] text-white/70">${formattedtime}</p>
                                        <div class="today-forecast-temp flex flex-col items-center gap-1">
                                            <img src="${iconUrl}" alt="${weatherDescrip}" title="${weatherDescrip}" class="w-6 h-6">
                                            <p class="today-forecast-temp font-medium uppercase text-sm">${temp}°C</p>
                                        </div>
                                        </div>`
    })
    document.getElementById("today-forecast-cards").innerHTML = html
}

function groupForecastByDate(data) {
    let groupedDataObject = {}

    let dataArray = data.list
    for (const element of dataArray) {
        let dateStr = element.dt_txt.split(" ")[0]

        if (!groupedDataObject[dateStr]) {
            groupedDataObject[dateStr] = [element]
        } else {
            groupedDataObject[dateStr].push(element)
        }
    }
    calculateDailyAverages(groupedDataObject)
}

function calculateDailyAverages(object) {
    let dailySummaries = []
    let today = new Date().toISOString().split("T")[0];

    for (const key in object) {
        if(key === today) continue;
        let dayArray = object[key]

        let hottestItem = dayArray.reduce((prev, curr) => {
            return curr.main.temp > prev.main.temp ? curr : prev;
        });
        let icon = hottestItem.weather[0].icon;
        let description = hottestItem.weather[0].description;

        let avgTemp = Math.round(dayArray.reduce((acc, item) => acc += item.main.temp, 0) / dayArray.length)
        let avgWind = (dayArray.reduce((acc, item) => acc += item.wind.speed, 0) / dayArray.length).toFixed(2)
        let avgCloud = Math.round(dayArray.reduce((acc, item) => acc += item.clouds.all, 0) / dayArray.length)
        let avgHumidity = Math.round(dayArray.reduce((acc, item) => acc += item.main.humidity, 0) / dayArray.length)

        let dailySummary = {
            date: key,
            temp: avgTemp,
            wind: avgWind,
            clouds: avgCloud,
            humidity: avgHumidity,
            icon: icon,
            description: description
        }

        dailySummaries.push(dailySummary)
    }

    updateWeeklyForecast(dailySummaries)
}

function updateWeeklyForecast(array) {
    let weeklyParent = document.getElementById("weekly-cards")
    weeklyParent.innerHTML = ""

    let html = ""
    array.map(element => {
        let iconCode = element.icon
        let iconUrl = `../assets/icons/${iconCode}.png`
        let dayName = new Date(element.date).toLocaleDateString('en-US', { weekday: "short", month: "long", day: "numeric"})

        html += `<div class="weekly-card flex flex-row justify-between bg-amber-50/10 px-4 py-2 rounded-md shadow-md">
                    <div class="day-weather flex flex-col items-start gap-2.5">
                        <p class="weekly-day-name font-semibold">${dayName}</p>
                        <div class="icon-weatherName flex flex-row gap-2 justify-center">
                            <img src="${iconUrl}" alt="${element.description}" class="w-5 h-5"/>
                            <p class="weekly-weather-descrip text-[14px] font-header text-white/60">${element.description}</p>
                        </div>
                        </div>
                        <div class="temp-clouds flex flex-col items-center gap-3">
                        <div class="icon-tempText flex flex-row gap-2 items-center">
                            <i class="fa-solid fa-temperature-three-quarters opacity-70 fa-xs"></i>
                            <p class="weekly-temp font-medium text-sm">${element.temp}°C</p>
                        </div>
                        <div class="icon-cloudText flex flex-row gap-2 items-center">
                            <i class="fa-solid fa-regular fa-cloud opacity-70 fa-xs"></i>
                            <p class="weekly-cloud-percentage font-medium text-sm">${element.clouds}%</p>
                        </div>
                        </div>
                        <div class="wind-humidity flex flex-col items-center gap-3">
                        <div class="icon-windText flex flex-row gap-2 items-center">
                            <i class="fa-solid fa-wind opacity-70 fa-xs"></i>
                            <p class="weekly-wind-speed font-medium text-sm">${element.wind} m/s</p>
                        </div>
                        <div class="icon-humidityText flex flex-row gap-2 items-center">
                            <i class="fa-solid fa-droplet opacity-70 fa-xs"></i>
                            <p class="weekly-humidity-percentage font-medium text-sm">${element.humidity}%</p>
                        </div>
                    </div>
                </div>`
    });
    weeklyParent.innerHTML = html
}