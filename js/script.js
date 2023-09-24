window.addEventListener('load', () => {
});
const cityInput = document.querySelector('.container_weather-input_city');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const currentWeatherDiv = document.querySelector('.current-weather');
const weatherCardsContent = document.querySelector('.current-weather_days-cards');
const API_KEY = 'f1b0af1ec261210461f44958f7b9709c';

// 273.15 es para convertir la temperatura a Celsius
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="current-weather_details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <figure class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </figure>`
    } else {
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6> 
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    // console.log(`${WEATHER_API_URL}`);
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log(data); 
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            })
            console.log(fiveDaysForecast);
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsContent.innerHTML = "";

            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsContent.insertAdjacentHTML("beforeend", html);
                }
            })
        }).catch(() => {
            alert("¡An error occurred while fetching the weather forecast!");
        })
}
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        return;
    }
    // console.log(cityName);
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`
    fetch(GEOCODING_API_URL)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (!data.length) {
                return alert(`No coordinates found for ${cityName}`)
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        }).catch(() => {
            alert("¡An error occurred while fetching the coordinates!");
        })
}
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        const REVERSE_API_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
        fetch(REVERSE_API_URL)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("¡An error occurred while fetching the city name!");
            })
    },error => {
        console.log(error);
        if (error.code === error.PERMISSION_DENIED) {
            alert("Geolocation request denied. Please reset location permission to grant access again.");
        } else {
            alert("Geolocation request error. Please reset location permission.");
        }
    });
}
locationBtn.addEventListener('click', getUserCoordinates);
searchBtn.addEventListener('click', getCityCoordinates);
cityInput.addEventListener('keyup', e => e.key === 'Enter' && getCityCoordinates);