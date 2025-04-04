// let btn = document.querySelector("#btn")
// let displayDiv = document.querySelector("#displayDiv")

// btn.addEventListener("click", () => {
//     getData()
// })

// async function getData() {
//     try {
//         let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=kolkata&appid=***REMOVED***&units=metric`)
//         if (!response.ok) {
//             console.log(`${response.status}: ${(await response).statusText}`)
//         }
//         let data = await response.json()
//         // console.log(data)
//         console.log(new Date(data.dt * 1000))
//         displayDetails(data)
//     } catch (error) {
//         console.log(error)
//     }
// }

// function displayDetails(data) {
//     let p = document.createElement("p")
//     p.innerHTML = data.main.temp
//     console.log(data)

//     displayDiv.appendChild(p)
// }