// Date - Time
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const date = document.querySelector(".date");
const time = document.querySelector(".time");

function updateDateTime() {
   let date_time = new Date();

   let currentDate = `${date_time.getDate()} ${months[date_time.getMonth()]} ${date_time.getFullYear()}`;
   date.innerHTML = `${currentDate}`;

   let hours = (date_time.getHours() % 12 || 12).toString().padStart(2, '0');
   let period = date_time.getHours() < 12 ? "AM" : "PM";
   let minutes = (date_time.getMinutes()).toString().padStart(2, '0');
   time.innerHTML = `${hours}:${minutes} ${period}`;
}
updateDateTime();
setInterval(updateDateTime, 500);
// Date - Time END //

const apiKey = "7e45edad178f00931e17837d7746abce";

let cityInput = document.querySelector(".input");
let searchBtn = document.querySelector(".searchBtn");
let currentTemp = document.querySelector(".currentTemp");
let windInfo = document.querySelector(".windInfo");
let currentWeather = document.querySelector("h1");
let weatherBg = document.querySelector(".weatherApp");
let loaderContainer = document.querySelector(".loader-container");
let errorMsg = document.querySelector(".errorMsg");

searchBtn.addEventListener("click", () => {
   if (cityInput.value.trim() != "") {
      updateWeatherData(cityInput.value);
      cityInput.blur();
   }
});

searchBtn.click();

cityInput.addEventListener("keydown", event => {
   if (event.key == "Enter") {
      searchBtn.click();
   }
})

function getWindDirection(degrees) {
   const directions = ["North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest"];
   let index = Math.round(degrees / 45) % 8;
   return directions[index];
}

// Fetch Data
async function getFetchData(endPoint, city) {
   loaderContainer.classList.remove("d-none");
   let apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
   try {
      let response = await fetch(apiUrl);
      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
   }
   catch (error) {
      console.error(error);
      return { cod: 404 };
   }
}

async function updateWeatherData(city) {
   const weatherData = await getFetchData("weather", city);
   loaderContainer.classList.add("fadeOut");
   setTimeout(() => {
      loaderContainer.classList.add("d-none");
      if (weatherData.cod != 200) {
         errorMessage();
         return;
      }
   }, 3000);

   const {
      main: { temp, humidity },
      weather: [{ id, main }],
      name,
      sys: { country },
      wind: { deg, speed }
   } = weatherData;

   let cityTemp = Math.round(temp);
   currentTemp.innerHTML = `${cityTemp}°C`;
   cityInput.value = `${name}, ${country}`;

   let windDirection = getWindDirection(deg);
   let windSpeed = Math.round(speed * (18 / 5));
   windInfo.innerHTML = `${windDirection}, ${windSpeed} km/h`;

   currentWeather.innerHTML = `${main}`;
   updateForecastData(city);
   switch (main) {
      case "Clouds":
         if (time.innerText.endsWith("PM"))
            weatherBg.style.backgroundImage = `url(imgs/${main}Night.svg)`;
         else
            weatherBg.style.backgroundImage = `url(imgs/${main}.svg)`;
         break;
      case "Rain":
      case "Snow":
      case "Mist":
      case "Thunderstorm":
         weatherBg.style.backgroundImage = `url(imgs/${main}.svg)`;
         break;
      default:
         if (time.innerText.endsWith("PM")) {
            weatherBg.style.backgroundImage = 'url(imgs/ClearNight.svg)';
         }
         else {
            weatherBg.style.backgroundImage = 'url(imgs/Clear.svg)';
         }
         break;
   }
}

const forecastCard = document.querySelectorAll(".forecastCard");
const dailyForecastCard = document.querySelectorAll(".dailyForecastCard");

async function updateForecastData(city) {
   const weatherData = await getFetchData("forecast", city);
   const {
      list
   } = weatherData;
   let dailyIndex = 0;
   for (let i = 0; i < list.length; i++) {
      let forecastDate = list[i].dt_txt.split(" ");
      let hours = forecastDate[1].split(":")[0];
      let weatherStatus = list[i].weather[0].main;
      if (hours == "00" && i != 0) {
         let dailyForecastDate = new Date(forecastDate[0]).getDay();
         let forecastDay = days[dailyForecastDate];
         let dailyIcon = iconStatus(weatherStatus, dailyForecastCard.length);
         dailyForecastCard[dailyIndex].innerHTML = `
            <div class="day-icon">
               <span class="weatherIcon flex-center"><i class="fa-solid ${dailyIcon[dailyIndex]}"></i></span>
               <div class="day__details">
                  <p>${forecastDay}</p>
                  <p class="subText">${weatherStatus}</p>
               </div>
            </div>
            <div class="day__degree">
               <p>${Math.round(list[i].main.temp_min)}°</p>
               <p>${Math.round(list[i].main.temp_max)}°</p>
            </div>`;
         dailyIndex++;
      }
      // Hourly Forecast
      if (i < 12) {
         let hourlyIcon = iconStatus(weatherStatus, forecastCard.length);
         forecastCard[i].innerHTML = `
         <p class="forecastCardTime">${hours}:00</p>
         <span class="weatherIcon flex-center"><i class="fa-solid ${hourlyIcon[i]}"></i></span>
         <p>${Math.round(list[i].main.temp)}°C</p>`;
      }
   }
}

function iconStatus(status, length) {
   let iconCollection = [];
   let iconClass;
   for (let i = 0; i < length; i++) {
      switch (status) {
         case "Clouds":
            iconClass = "fa-cloud";
            break;
         case "Rain":
            iconClass = "fa-cloud-showers-heavy";
            break;
         case "Snow":
            iconClass = "fa-snowflake";
            break;
         case "Mist":
            iconClass = "fa-smog";
            break;
         case "Thunderstorm":
            iconClass = "fa-cloud-bolt";
            break;
         default:
            if (time.innerText.endsWith("PM")) {
               iconClass = "fa-moon";
            }
            else {
               iconClass = "fa-sun";
            }
            break;
      }
      iconCollection.push(iconClass);
   }
   return iconCollection;
}

function errorMessage() {
   errorMsg.classList.add("showError");
   setTimeout(() => {
      errorMsg.classList.remove("showError");
   }, 8000);
}

errorMsg.addEventListener("click", () => {
   errorMsg.classList.remove("showError");
})