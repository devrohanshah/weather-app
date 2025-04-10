// Constants and variables
const KELVIN = 273;
const key = "82005d27a116c2880c8f0fcb866998a0";
const citiesApiKey = "82005d27a116c2880c8f0fcb866998a0"; // Using the same key for simplicity

// DOM Elements
const iconElement = document.getElementById("weather-icon");
const tempElement = document.getElementById("temperature");
const descElement = document.getElementById("description");
const locationElement = document.getElementById("location");
const notificationElement = document.getElementById("notification");
const dateTimeElement = document.getElementById("date-time");
const windElement = document.getElementById("wind");
const humidityElement = document.getElementById("humidity");
const pressureElement = document.getElementById("pressure");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const hourlyForecastElement = document.getElementById("hourly-forecast");
const loadingElement = document.getElementById("loading");
const weatherGradient = document.querySelector(".weather-gradient");
const suggestionsContainer = document.getElementById("suggestions-container");

// Popular cities for initial suggestions
const popularCities = [
    "London", "New York", "Tokyo", "Paris", "Sydney", 
    "Dubai", "Mumbai", "Toronto", "Berlin", "Singapore"
];

// App data
const weather = {
    temperature: {
        value: undefined,
        unit: "celsius"
    },
    description: "",
    iconId: "",
    city: "",
    country: "",
    wind: "",
    humidity: "",
    pressure: "",
    date: "",
    hourlyForecast: []
};

// Initialize app
window.addEventListener("load", () => {
    if ('geolocation' in navigator) {
        showLoading();
        navigator.geolocation.getCurrentPosition(setPosition, showError);
    } else {
        showNotification("Browser doesn't support geolocation");
    }
    
    // Set current date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

// Event listeners
searchBtn.addEventListener("click", () => {
    searchWeather(searchInput.value);
    suggestionsContainer.classList.remove("active");
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchWeather(searchInput.value);
        suggestionsContainer.classList.remove("active");
    }
});

// Search suggestion implementation
searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    
    if (query.length === 0) {
        suggestionsContainer.classList.remove("active");
        return;
    }
    
    if (query.length >= 2) {
        fetchCitySuggestions(query);
    }
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.classList.remove("active");
    }
});

// Temperature unit toggle
tempElement.addEventListener("click", () => {
    if (weather.temperature.value === undefined) return;
    
    if (weather.temperature.unit === "celsius") {
        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);
        fahrenheit = Math.floor(fahrenheit);
        
        tempElement.innerHTML = `${fahrenheit}<span>°F</span>`;
        weather.temperature.unit = "fahrenheit";
    } else {
        tempElement.innerHTML = `${weather.temperature.value}<span>°C</span>`;
        weather.temperature.unit = "celsius";
    }
});

// Functions
function setPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    
    getWeather(latitude, longitude);
}

function showError(error) {
    hideLoading();
    showNotification(error.message);
}

function showNotification(message) {
    notificationElement.style.display = "block";
    notificationElement.innerHTML = message;
    
    setTimeout(() => {
        notificationElement.style.display = "none";
    }, 5000);
}

function showLoading() {
    loadingElement.style.display = "flex";
}

function hideLoading() {
    loadingElement.style.display = "none";
}

function getWeather(latitude, longitude) {
    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
    
    fetch(api)
        .then(response => {
            if (!response.ok) {
                throw new Error("Weather data not available");
            }
            return response.json();
        })
        .then(data => {
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
            weather.wind = data.wind.speed;
            weather.humidity = data.main.humidity;
            weather.pressure = data.main.pressure;
            
            // Get hourly forecast
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast data not available");
            }
            return response.json();
        })
        .then(data => {
            // Get the first 5 forecast items (3-hour intervals)
            weather.hourlyForecast = data.list.slice(0, 5).map(item => {
                return {
                    time: new Date(item.dt * 1000),
                    temp: Math.floor(item.main.temp - KELVIN),
                    icon: item.weather[0].icon
                };
            });
            
            displayWeather();
            hideLoading();
        })
        .catch(error => {
            hideLoading();
            showNotification(error.message);
        });
}

function searchWeather(city) {
    if (!city) {
        showNotification("Please enter a city name");
        return;
    }
    
    showLoading();
    let api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`;
    
    fetch(api)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            weather.temperature.value = Math.floor(data.main.temp - KELVIN);
            weather.description = data.weather[0].description;
            weather.iconId = data.weather[0].icon;
            weather.city = data.name;
            weather.country = data.sys.country;
            weather.wind = data.wind.speed;
            weather.humidity = data.main.humidity;
            weather.pressure = data.main.pressure;
            
            // Get hourly forecast
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${key}`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Forecast data not available");
            }
            return response.json();
        })
        .then(data => {
            // Get the first 5 forecast items (3-hour intervals)
            weather.hourlyForecast = data.list.slice(0, 5).map(item => {
                return {
                    time: new Date(item.dt * 1000),
                    temp: Math.floor(item.main.temp - KELVIN),
                    icon: item.weather[0].icon
                };
            });
            
            displayWeather();
            hideLoading();
        })
        .catch(error => {
            hideLoading();
            showNotification(error.message);
        });
}

function displayWeather() {
    iconElement.innerHTML = `<img src="icon/${weather.iconId}.png" alt="${weather.description}">`;
    tempElement.innerHTML = `${weather.temperature.value}<span>°${weather.temperature.unit === "celsius" ? "C" : "F"}</span>`;
    descElement.innerHTML = weather.description;
    locationElement.innerHTML = `${weather.city}, ${weather.country}`;
    windElement.innerHTML = `${weather.wind} m/s`;
    humidityElement.innerHTML = `${weather.humidity}%`;
    pressureElement.innerHTML = `${weather.pressure} hPa`;
    
    // Display hourly forecast
    hourlyForecastElement.innerHTML = "";
    weather.hourlyForecast.forEach(item => {
        const forecastTime = item.time.getHours() + ":00";
        hourlyForecastElement.innerHTML += `
            <div class="forecast-item">
                <div class="forecast-time">${forecastTime}</div>
                <img class="forecast-icon" src="icon/${item.icon}.png" alt="Forecast">
                <div class="forecast-temp">${item.temp}°C</div>
            </div>
        `;
    });
    
    // Set background gradient based on weather
    setWeatherBackground(weather.iconId);
}

function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    dateTimeElement.innerHTML = now.toLocaleDateString('en-US', options);
}

function celsiusToFahrenheit(temperature) {
    return (temperature * 9/5) + 32;
}

function setWeatherBackground(iconId) {
    let timeOfDay = iconId.includes('d') ? 'day' : 'night';
    let weatherType = iconId.substring(0, 2);
    
    // Clear previous classes
    weatherGradient.className = 'weather-gradient';
    
    if (timeOfDay === 'night') {
        weatherGradient.classList.add('night');
        document.body.style.color = "#fff";
        return;
    }
    
    switch (weatherType) {
        case '01': // clear sky
            weatherGradient.classList.add('sunny');
            document.body.style.color = "#fff";
            break;
        case '02': // few clouds
        case '03': // scattered clouds
        case '04': // broken clouds
            weatherGradient.classList.add('cloudy');
            document.body.style.color = "#fff";
            break;
        case '09': // shower rain
        case '10': // rain
        case '11': // thunderstorm
            weatherGradient.classList.add('rainy');
            document.body.style.color = "#fff";
            break;
        case '13': // snow
            weatherGradient.classList.add('snowy');
            document.body.style.color = "#333";
            break;
        default:
            weatherGradient.classList.add('cloudy');
            document.body.style.color = "#fff";
    }
}

// City suggestions functions
function fetchCitySuggestions(query) {
    // Use OpenWeatherMap API's Geocoding API for city suggestions
    const api = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${citiesApiKey}`;
    
    fetch(api)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch suggestions");
            }
            return response.json();
        })
        .then(cities => {
            displaySuggestions(cities);
        })
        .catch(error => {
            // If API fails, fall back to popular cities filter
            const filteredCities = popularCities.filter(city => 
                city.toLowerCase().includes(query.toLowerCase())
            );
            
            const formattedCities = filteredCities.map(city => {
                return { name: city, country: "" };
            });
            
            displaySuggestions(formattedCities);
        });
}

function displaySuggestions(cities) {
    if (cities.length === 0) {
        suggestionsContainer.classList.remove("active");
        return;
    }
    
    suggestionsContainer.innerHTML = "";
    
    cities.forEach(city => {
        const countryCode = city.country || "";
        const suggestionItem = document.createElement("div");
        suggestionItem.classList.add("suggestion-item");
        suggestionItem.innerHTML = `
            <i class="fas fa-map-marker-alt"></i>
            <span>${city.name}${countryCode ? `, ${countryCode}` : ""}</span>
        `;
        
        suggestionItem.addEventListener("click", () => {
            searchInput.value = city.name;
            searchWeather(city.name);
            suggestionsContainer.classList.remove("active");
        });
        
        suggestionsContainer.appendChild(suggestionItem);
    });
    
    suggestionsContainer.classList.add("active");
}

// Show popular cities as suggestions on focus
searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim() === "") {
        const formattedCities = popularCities.map(city => {
            return { name: city, country: "" };
        });
        
        displaySuggestions(formattedCities);
    }
});
