// OpenWeatherMap's base URL and my own API.
let API = {
    URL: "https://api.openweathermap.org/data/2.5",
    KEY: "***REMOVED***"
}

// Basic variables of DOM elements depending on frequency of usage.
let message = document.getElementById("message-box")
let loader = document.getElementById("loader")
let container = document.getElementById("container")
let postSearch = document.getElementById("post-search")

// Function to get and show current date and time on the UI.
function setDateTime() {
    const now = new Date()
    document.getElementById("currentDate").textContent =
        now.toLocaleString('en-US', { dateStyle: 'full' })
    document.getElementById("currentTime").textContent =
        now.toLocaleString('en-US', { timeStyle: 'short' })
}

// setInterval to refresh the time every 1-second to keep the time in sync with real world and the function execution.
setInterval(setDateTime, 1000)
setDateTime()

// Location Pin variable
let locationPin = document.getElementById("currentLocation")

/**
 * function to listen click events of location pin icon —
 * remove existing post-search (if any)
 * remove message-box (if any)
 * set container height to default with the help of helper function
 * then call OWM's API to show details on UI
 */
locationPin.addEventListener("click", () => {
    postSearch.classList.add("hidden")
    message.classList.remove("hidden")
    setContainerHeightToDefault()

    // Message to allow location request.
    message.innerHTML = `<img src="../assets/icons/location-arrow.png" alt="weather-hero-icon" class="w-[100px] sm:w-[140px] md:w-[180px] rotate-45 mb-3">
                         <p class="font-semibold">Please allow the location request</p>`

    /**
     * Using Geolocation API to get the actual location of the user (after permission)
     * if yes to the permission — removes loader icon → remove post search box → remove message box → set container height → send user's coordinates (latitute and longitude) to call OWM's API.
     * if no to the permission — take the reason → check what's the reason → show the message based on rejection reason on message box
     */
    navigator.geolocation.getCurrentPosition((position) => {
        loader.classList.remove("hidden")
        postSearch.classList.add("hidden")
        document.getElementById("message-box").classList.add("hidden")
        setContainerHeightToDefault()
        getCurrentData(position.coords)
    }, (error) => {
        if (error.code == 1) {
            showError("Location permission denied, please enable GPS, try again later or try searching a city name", "unknown-pin")
        }
        if (error.code == 2) {
            showError("Location unavailable, please try again later or try searching a city name", "unknown-pin")
        }
        if (error.code == 3) {
            showError("Location request timed-out, please try again", "unknown-pin")
        }
    }, { timeout: 5000 })
})

// More basic variables of DOM elements depending on frequency of usage.
let input = document.getElementById("inputBox")
let dropdown = document.getElementById("dropdown")

// Listening to click event on input box to show dropdown with recent searches
input.addEventListener("click", () => {

    // Parsing the existing array of recentSearches from localStorage
    let recent = JSON.parse(localStorage.getItem("recentSearches"))

    // ending function execution if nothing found in recentSearches array
    if (!recent || recent.length === 0) return

    // show dropdown → visibility: hidden for date to prevent overlapping → removing bottom border radius of input for consistency.
    dropdown.classList.remove("hidden")
    document.getElementById("currentDate").classList.add("invisible")
    input.classList.add("rounded-b-none")

    // html variable to store whole html with styling and recentSearches data to be added on to dropdown
    let html = ""
    recent.map(city => {
        html += `<span class="py-1 px-2 cursor-pointer rounded transition duration-300 ease-in-out hover:bg-white/30 z-50">${city.charAt(0).toUpperCase() + city.slice(1)}</span>`
    })
    
    // adding span element for recentSearches to UI.
    dropdown.innerHTML = html
})

// Similar to above listener, but just listening to inputs.
input.addEventListener("input", () => {
    let recent = JSON.parse(localStorage.getItem("recentSearches"))

    if (!recent || recent.length === 0) return

    dropdown.classList.remove("hidden")
    document.getElementById("currentDate").classList.add("invisible")
    input.classList.add("rounded-b-none")

    let html = ""
    recent.map(city => {
        html += `<span class="py-1 px-2 cursor-pointer rounded transition duration-300 ease-in-out hover:bg-white/30">${city.charAt(0).toUpperCase() + city.slice(1)}</span>`
    })
    dropdown.innerHTML = html
})

// listening when input box is out of focus, so that dropdown can be removed from UI with a bit of delay for consistency.
input.addEventListener("blur", () => {
    setTimeout(() => {
        dropdown.classList.add("hidden")
        document.getElementById("currentDate").classList.remove("invisible")
        input.classList.remove("rounded-b-none")
    }, 150)
})

/**
 * listening to click event on dropdown div element
 * checking if the click is on <span> element, if yes:
 * removing loader icon
 * removing dropdown after click
 * removing post search state
 * removing message box
 * adding back border radius to input box
 * sending textContent of <span> element to function to get weather details of the clicked location name
 */
dropdown.addEventListener("click", (e) => {
    if (e.target.nodeName == "SPAN") {
        loader.classList.remove("hidden")
        dropdown.classList.add("hidden")
        postSearch.classList.add("hidden")
        message.classList.add("hidden")
        input.classList.remove("rounded-b-none")
        getCityData(e.target.textContent)
    }
})

/**
 * Listening keyup on input box, if key is "Enter":
 * check if no input value, if nothing stop the exucution, if yes:
 * passing the input through many input validations to ensure clean input value is sent for API call.
 */
input.addEventListener("keyup", (e) => {
    if (e.key == "Enter") {
        if (!input.value) {
            return;
        }

        // check if input value length is more than 1 letter, if not, show relevant error pop-up for 2.5s and stop the execution
        if (input.value.length < 2) {
            document.getElementById("error").classList.remove("hidden")
            document.getElementById("error").textContent = `Please enter more than ${input.value.length} letter.`
            setTimeout(() => {
                document.getElementById("error").textContent = ""
            }, 2500)
            return;
        }

        // check if single/many blank space being sent as a input, if yes, call helper function to show relevant message and stop the execution
        if (input.value == " " || input.value.trim().length < 1) {
            showError("Invalid Input, try entering a location name", "unknown")
            input.value = "";
            return;
        }

        // check if after removing black spaces, the input is more than 1 letter, setup the container and send data to call OWM's API or show relevant error on UI.
        if (input.value.trim().length > 1) {
            loader.classList.remove("hidden")
            postSearch.classList.add("hidden")
            document.getElementById("message-box").classList.add("hidden")
            setContainerHeightToDefault()
            getCityData(input.value)
            input.value = "";
            dropdown.classList.add("hidden")
            input.classList.remove("rounded-b-none")
        } else {
            showError("Invalid Input, try entering a location name", "unknown")
            input.value = "";
            return;
        }
    }
})

// Function to majorly call OWM's APIs, handle API errors and sending data to helper function to process further and show on UI.
async function getCityData(input) {

    // Again making sure the input received in clean, if not, show error and stop the execution.
    input = input.trim()
    if (!input || input.length <= 1) {
        showError("Invalid or empty input received.", "unknown")
        return
    }

    /**
     * Try block to do following things:
     * Call OWM's Current Weather and Weekly Forecast API
     * If bad response received → check its status → set height of container to default and then send response detail and error message to function who handle API error, if good response:
     * Convert the received responses (in promise) to JSON.
     * Send data to updateCurrentWeather, updateRecentSearches, updateTodayForecast and groupForecastByDate for relevant purposes (each functions responsibility explained inside them).
     */
    try {
        let response = await fetch(`${API.URL}/weather?q=${input}&appid=${API.KEY}&units=metric`)
        let responseForecast = await fetch(`${API.URL}/forecast?q=${input}&appid=${API.KEY}&units=metric`)
        if (!response.ok) {
            setContainerHeightToDefault()
            showAPIError(response, "City Not Found")
            return
        }
        if (!responseForecast.ok) {
            setContainerHeightToDefault()
            showAPIError(responseForecast, "Forecast Unavailable")
            return
        }
        let data = await response.json()
        let dataForecast = await responseForecast.json()
        updateCurrentWeather(data)
        updateRecentSearches(input)
        updateTodayForecast(dataForecast)
        groupForecastByDate(dataForecast)
    } catch (error) {
        console.log(error)
    }
}

// Same as above function but with coordinates received after permission of user by event listener function of location-pin icon
async function getCurrentData(coords) {
    try {
        let response = await fetch(`${API.URL}/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API.KEY}&units=metric`)
        let responseForecast = await fetch(`${API.URL}/forecast?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API.KEY}&units=metric`)
        if (!response.ok) {
            setContainerHeightToDefault()
            showAPIError(response, "City Not Found")
            return
        }
        if (!responseForecast.ok) {
            setContainerHeightToDefault()
            showAPIError(responseForecast, "Forecast Unavailable")
            return
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

// Setting the container height to default for consistency throughout mentioned devices.
function setContainerHeightToDefault() {
    container.classList.remove("max-h-[80vh]", "h-[70vh]")
    container.classList.add("h-screen", "sm:h-[70vh]")
}

// Setting up the container height to show weather details on UI.
function setContainerHeightForPostSearch() {
    container.classList.remove("h-screen", "sm:h-[70vh]")
    container.classList.add("max-h-full", "sm:max-h-[80vh]")
}

// Function to handle showing post search layout
function showPostSearchLayout() {
    message.classList.add("hidden")
    postSearch.classList.remove("hidden")
    setContainerHeightForPostSearch()
    loader.classList.add("hidden")
}

// Function to show current weather and air condition details on UI.
function updateCurrentWeather(data) {
    
    // Calling showPostSearchLayout to make sure it is visible on UI.
    showPostSearchLayout()

    // Varibles to keep specific data from the received data from API.
    let cityName = data.name
    let country = data.sys.country

    /**
     * Variable to store temperature and making sure:
     * to round off to lower ceiling to make sure it is a whole number, as response gives temperature with decimal places
     * to check if temperature is in centigrade (°C) not in Kelvin (OWM's default unit), if yes, show error on message box and stop the execution.
     */
    let temperature = Math.round(data.main.temp)
    if (temperature > 100 || temperature < -50) {
        setContainerHeightToDefault()
        showError("Weather data seems invalid. Please try again", "unknown")
        return
    }

    // Varibles to keep specific data from the received data from API.
    let weatherDescrip = data.weather[0].description
    let feelsLike = Math.round(data.main.feels_like) // round off to make sure it is a whole number
    let windSpeed = data.wind.speed
    let clouds = data.clouds.all
    let humidity = data.main.humidity
    let iconCode = data.weather[0].icon
    let iconUrl = `../assets/icons/${iconCode}.png` // base URL with iconCode received as per response

    // Getting current date and formatting it to be — Month DD, YYYY with options object.
    let now = new Date()
    let options = { month: "long", day: "numeric", year: "numeric" }

    // Adding specific details to relevant divs after formatting to show on UI.
    document.getElementById("cityName").textContent = `${cityName}, ${country}`
    document.getElementById("todayDate").textContent = now.toLocaleString('en-US', options) // formatting date based on options object
    document.getElementById("currentTemp").textContent = `${temperature} °C`
    document.getElementById("weatherDescrip").textContent = weatherDescrip
    document.getElementById("realfeel-value").textContent = `${feelsLike} °C`
    document.getElementById("wind-value").textContent = `${windSpeed} m/s`
    document.getElementById("clouds-value").textContent = `${clouds == 0 ? "—" : clouds + "%"}` // making sure if there are no clouds, an "—"(em dash) is shown rather than "0%"
    document.getElementById("humidity-value").textContent = `${humidity}%`

    // Making sure weatherIcon div is empty to avoid icon stacking and safely adding img to weatherIcon div with relevant stylings.
    document.getElementById("weatherIcon").innerHTML = ""
    document.getElementById("weatherIcon").innerHTML = `<img src="${iconUrl}" alt="${weatherDescrip}" class="w-12 h-12 lg:w-16 lg:h-16">`
}

// Function to format the date based on OWM's API dt_txt: YYYY-MM-DD HH:MM:SS to match and filter based on today's date and return the today's date in format: YYYY-MM-DD.
function formattedDate() {
    let now = new Date()
    let year = now.getFullYear()
    let month = String(now.getMonth() + 1).padStart(2, "0")
    let date = String(now.getDate()).padStart(2, "0")

    let finalDate = `${year}-${month}-${date}`
    return finalDate
}

// Function to filter forecast response array from API based on formattedDate function.
function filterArray(data) {
    let newArray = data.list.filter(item => item.dt_txt.startsWith(formattedDate()))
    return newArray
}

// Function to format and update Today Forecast section with the data received on the UI.
function updateTodayForecast(data) {

    // Storing the filtered array received from filterArray function.
    let filteredArray = filterArray(data)

    // Getting the length of the array to update the number of available forecasts on the UI.
    let todayForecastCount = filteredArray.length
    document.getElementById("todayForecastCount").textContent = `${todayForecastCount} available forecast${todayForecastCount < 2 ? "" : 's'}`

    // Updating the HTML of a Today Forecast Card with its styling and then keep adding to the today forecast cards parent.
    let html = ""
    filteredArray.map(item => {
        let weatherDescrip = item.weather[0].description
        let iconCode = item.weather[0].icon
        let iconUrl = `../assets/icons/${iconCode}.png` // base URL with iconCode received as per response

        let formattedtime = item.dt_txt.split(" ")[1].slice(0, 5) // Getting OWM's API dt_txt: YYYY-MM-DD HH:MM:SS to show HH:MM on UI.
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

/**
 * Function to group the same date data into an object
 * checking if the date exist in the object already
 * if yes, pushes the whole element into the existing array
 * if not, creates an array for that date with the item as its first element
 * then send the object to calculateDailyAverages to process further
 */
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

/**
 * Function to calculate the average of the weather details
 * which were grouped into an object with key being date and value being array of grouped data of same date
 * majorly, in this function, it takes array of each dates from the given object to find the average of each weather details to get more viable data.
 */
function calculateDailyAverages(object) {

    // Declaring an empty array to store array objects containing averages of weather details for each dates.
    let dailySummaries = []
    let today = new Date().toISOString().split("T")[0]; // Splitting OWM's API dt_txt: YYYY-MM-DD HH:MM:SS to only keep the next dates other than user's current date

    for (const key in object) {
        if (key === today) continue; // Continuing and falling over for next iteration after loop finds current date is equal to first date in the object key
        let dayArray = object[key] // If not current date, then go over and get the key's value

        // This find the hottest item from the array of same date elements based on its temperature to get hottest item's icon to show on UI.
        let hottestItem = dayArray.reduce((prev, curr) => {
            return curr.main.temp > prev.main.temp ? curr : prev;
        });
        
        // Accessing hottest item's icon and its weather description
        let icon = hottestItem.weather[0].icon;
        let description = hottestItem.weather[0].description;

        // Extracting and finding averages of each weather details
        let avgTemp = Math.round(dayArray.reduce((acc, item) => acc += item.main.temp, 0) / dayArray.length)
        let avgWind = (dayArray.reduce((acc, item) => acc += item.wind.speed, 0) / dayArray.length).toFixed(2) // wind speed need to have two more decimal places, hence, toFixed
        let avgCloud = Math.round(dayArray.reduce((acc, item) => acc += item.clouds.all, 0) / dayArray.length)
        let avgHumidity = Math.round(dayArray.reduce((acc, item) => acc += item.main.humidity, 0) / dayArray.length)

        // Storing averages of weather details into an object for each date
        let dailySummary = {
            date: key,
            temp: avgTemp,
            wind: avgWind,
            clouds: avgCloud,
            humidity: avgHumidity,
            icon: icon,
            description: description
        }

        // Storing object with averages to the array
        dailySummaries.push(dailySummary)
    }

    // Sending the array of objects to updateWeeklyForecast to show on UI.
    updateWeeklyForecast(dailySummaries)
}

// Function to show wekkly weather details on UI as cards.
function updateWeeklyForecast(array) {
    
    // Accessing weekly card's parent and clearing it before addition
    let weeklyParent = document.getElementById("weekly-cards")
    weeklyParent.innerHTML = ""

    // Accessing each object and extracting each average values and showing on UI
    let html = ""
    array.map(element => {
        let iconCode = element.icon
        let iconUrl = `../assets/icons/${iconCode}.png` // Base URL with iconCode

        // Converting the date YYYY-MM-DD → Weekday, Month DD to show on UI
        let dayName = new Date(element.date).toLocaleDateString('en-US', { weekday: "short", month: "long", day: "numeric" }) 

        html += `<div class="weekly-card flex flex-row justify-between bg-amber-50/10 px-4 py-2 rounded-md shadow-md">
                    <div class="day-weather flex flex-col items-start gap-2.5">
                        <p class="weekly-day-name font-semibold text-sm">${dayName}</p>
                        <div class="icon-weatherName flex flex-row gap-2 justify-center">
                            <img src="${iconUrl}" alt="${element.description}" class="w-5 h-5"/>
                            <p class="weekly-weather-descrip text-[14px] font-header text-white/60">${element.description}</p>
                        </div>
                        </div>
                        <div class="temp-clouds flex flex-col items-center gap-3">
                        <div class="icon-tempText flex flex-row gap-2 items-center">
                            <i class='bx bxs-thermometer opacity-70' style='color:#ffffff' ></i>
                            <p class="weekly-temp font-medium text-sm">${element.temp}°C</p>
                        </div>
                        <div class="icon-cloudText flex flex-row gap-2 items-center">
                            <i class='bx bx-cloud opacity-70' style='color:#ffffff' ></i>
                            <p class="weekly-cloud-percentage font-medium text-sm">${element.clouds == 0 ? "-" : element.clouds + "%"}</p>
                        </div>
                        </div>
                        <div class="wind-humidity flex flex-col items-center gap-3">
                        <div class="icon-windText flex flex-row gap-2 items-center">
                            <i class='bx bx-wind opacity-70' style='color:#ffffff' ></i>
                            <p class="weekly-wind-speed font-medium text-sm">${element.wind} m/s</p>
                        </div>
                        <div class="icon-humidityText flex flex-row gap-2 items-center">
                            <i class='bx bx-droplet opacity-70' style='color:#ffffff' ></i>
                            <p class="weekly-humidity-percentage font-medium text-sm">${element.humidity}%</p>
                        </div>
                    </div>
                </div>`
    });
    weeklyParent.innerHTML = html
}

/**
 * Function to format and store validated inputs from user after successful search in localStorage.
 * Keeping it to maximum of 5 recent searches that can be stored in localStorage.
 */
function updateRecentSearches(input) {

    // converting each input into lowercase and trimming any blank spaces
    let lowerInput = input.toLowerCase().trim()

    // Getting the already available array from localStorage, if nothing found then create a new array as fallback.
    let recent = JSON.parse(localStorage.getItem("recentSearches")) || []

    /**
     * If the localStorage's array 
     * does not include input → then add that into the 0th index of the array
     * does include input → remove it regardless of its index and add it at the 0th index as recent search
     */
    if (!recent.includes(lowerInput)) {
        recent.unshift(lowerInput)
    } else {
        recent.splice(recent.indexOf(lowerInput), 1)
        recent.unshift(lowerInput)
    }

    // Making sure the recent searches should not be more than 5 recent searches, any 6th element pops out from the last index
    if (recent.length > 5) recent.pop()

    // Adding back the array to localStorage by editing and as string
    localStorage.setItem("recentSearches", JSON.stringify(recent))
}

/**
 * Function responsible to only handle and show API errors by using parameters:
 * response: the bad response with error details.
 * errorText: custom error message that can be passed as argument and shown on UI.
 */
function showAPIError(response, errorText) {
    // showing messag box → hiding loader icon → hiding post-search state → clearing message box and adding error icon and relevant message
    message.classList.remove("hidden")
    loader.classList.add("hidden")
    postSearch.classList.add("hidden")
    message.innerHTML = ""
    message.innerHTML = `<img src="../assets/icons/unknown.png" alt="unknown-icon" class="w-[100px] sm:w-[140px] md:w-[180px]">
                         <p class="font-semibold w-[80%]">${response.status}: ${response.statusText == "Not Found" ? errorText : response.statusText}</p>`
}

/**
 * Function responsible to handle normal errors by using parameters:
 * errorText: custom error message that can be passed as argument and shown on UI.
 * imgText: name of icon and alt to be used.
 * after showing error, making sure to set container height to default to maintain consistency
 */
function showError(errorText, imgText) {
    message.classList.remove("opacity-0")
    loader.classList.add("hidden")
    postSearch.classList.add("hidden")
    message.innerHTML = ""
    message.innerHTML = `<img src="../assets/icons/${imgText}.png" alt="${imgText}" class="w-[100px] sm:w-[140px] md:w-[180px]">
                         <p class="font-semibold w-[80%]">${errorText}</p>`
    setContainerHeightToDefault()                         
}