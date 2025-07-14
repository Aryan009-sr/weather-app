// script.js
const OPENWEATHER_API_KEY = '4c7c01a68f9c2f41f833bd43ec63abd8';
let UNITS = 'metric'; // Initially 'metric' for Celsius, will be toggled based on button

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const recentCitiesDropdown = document.getElementById('recent-cities-dropdown');

const currentWeatherSection = document.getElementById('current-weather');
const locationName = document.getElementById('location-name');
const dateTime = document.getElementById('date-time');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

const extendedForecastSection = document.getElementById('extended-forecast');
const forecastCardsContainer = document.getElementById('forecast-cards-container');
const errorMessageElement = document.getElementById('error-message');

// New DOM Elements
const loadingIndicator = document.getElementById('loading-indicator');
const unitToggleBtn = document.getElementById('unit-toggle-btn');


// Recent Cities Storage 
const MAX_RECENT_CITIES = 5;
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

function saveRecentCities() {
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
}

function addRecentCity(city) {
    const formattedCity = city.split(' ')
                               .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                               .join(' ');
    recentCities = recentCities.filter(c => c.toLowerCase() !== formattedCity.toLowerCase());
    recentCities.unshift(formattedCity);
    if (recentCities.length > MAX_RECENT_CITIES) {
        recentCities = recentCities.slice(0, MAX_RECENT_CITIES);
    }
    saveRecentCities();
    updateRecentCitiesDropdown();
}

function updateRecentCitiesDropdown() {
    recentCitiesDropdown.innerHTML = '<option value="">Recent Cities</option>';
    if (recentCities.length > 0) {
        recentCitiesDropdown.classList.remove('hidden');
        recentCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            recentCitiesDropdown.appendChild(option);
        });
    } else {
        recentCitiesDropdown.classList.add('hidden');
    }
}


// Helper Functions
function formatDateTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
}

function formatForecastDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleString('en-US', options);
}

// Display Functions 
function displayCurrentWeather(data) {
    if (!data) {
        currentWeatherSection.classList.add('hidden');
        return;
    }
    currentWeatherSection.classList.remove('hidden');
    errorMessageElement.classList.add('hidden');

    locationName.textContent = `${data.name}, ${data.sys.country}`;
    dateTime.textContent = formatDateTime(data.dt, data.timezone);
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description;

    const tempUnit = UNITS === 'metric' ? '°C' : '°F';
    temperature.textContent = `${Math.round(data.main.temp)}${tempUnit}`;
    condition.textContent = data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);
    humidity.querySelector('span').textContent = `${data.main.humidity}%`;

    const windUnit = UNITS === 'metric' ? 'km/h' : 'mph';
    const windSpeedVal = UNITS === 'metric' ? (data.wind.speed * 3.6).toFixed(1) : data.wind.speed.toFixed(1);
    windSpeed.querySelector('span').textContent = `${windSpeedVal} ${windUnit}`;
}

function displayForecastCards(forecastData) {
    if (!forecastData || forecastData.length === 0) {
        extendedForecastSection.classList.add('hidden');
        return;
    }

    extendedForecastSection.classList.remove('hidden');
    forecastCardsContainer.innerHTML = '';

    const distinctForecasts = [];
    const seenDates = new Set();

    for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dateString = date.toISOString().split('T')[0];

        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        if (!seenDates.has(dateString) && date.getHours() >= 10 && date.getHours() <= 15) {
            if (dateString !== todayString || (distinctForecasts.length === 0 && dateString === todayString)) {
                 distinctForecasts.push(item);
                 seenDates.add(dateString);
            }
        }
        if (distinctForecasts.length >= 5) {
            break;
        }
    }

    distinctForecasts.sort((a, b) => a.dt - b.dt);

    distinctForecasts.forEach(dayData => {
        const card = document.createElement('div');
        card.classList.add(
            'forecast-card',
            'bg-white',
            'bg-opacity-20',
            'rounded-lg',
            'p-4',
            'text-center',
            'flex',
            'flex-col',
            'items-center',
            'justify-center'
        );

        const dateText = formatForecastDate(dayData.dt);
        const iconSrc = `http://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`;
        const tempUnit = UNITS === 'metric' ? '°C' : '°F';
        const temp = Math.round(dayData.main.temp);
        const windUnit = UNITS === 'metric' ? 'km/h' : 'mph';
        const wind = UNITS === 'metric' ? (dayData.wind.speed * 3.6).toFixed(1) : dayData.wind.speed.toFixed(1);
        const humidityVal = dayData.main.humidity;
        const description = dayData.weather[0].description.charAt(0).toUpperCase() + dayData.weather[0].description.slice(1);

        card.innerHTML = `
            <p class="font-semibold text-lg mb-1">${dateText}</p>
            <img src="${iconSrc}" alt="${description}" class="w-16 h-16 mx-auto mb-2 drop-shadow-md">
            <p class="text-2xl font-bold mb-1">${temp}${tempUnit}</p>
            <p class="text-sm opacity-80">Wind: <span class="font-medium">${wind} ${windUnit}</span></p>
            <p class="text-sm opacity-80">Humidity: <span class="font-medium">${humidityVal}%</span></p>
            <p class="text-sm opacity-80 mt-1">${description}</p>
        `;
        forecastCardsContainer.appendChild(card);
    });
}


// Data Fetching Functions

// Helper to show/hide loading indicator
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    currentWeatherSection.classList.add('hidden');
    extendedForecastSection.classList.add('hidden');
    errorMessageElement.classList.add('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
}


// Base fetch function for current weather by city name
async function fetchCurrentWeatherByCity(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${UNITS}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Current Weather Data by City:', data);
        displayCurrentWeather(data);
        return data;
    } catch (error) {
        console.error('Error fetching current weather data by city:', error);
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = `Could not fetch weather for "${city}". Please try again or check the city name. (${error.message})`;
        return null;
    }
}

// Base fetch function for 5-day forecast by city name
async function fetchForecastDataByCity(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${UNITS}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('5-Day Forecast Data by City:', data);
        displayForecastCards(data);
        return data;
    } catch (error) {
        console.error('Error fetching 5-day forecast data by city:', error);
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = `Could not fetch forecast for "${city}". Please try again. (${error.message})`;
        return null;
    }
}

// New: Fetch current weather by coordinates
async function fetchCurrentWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${UNITS}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('Current Weather Data by Coords:', data);
        displayCurrentWeather(data);
        return data;
    } catch (error) {
        console.error('Error fetching current weather data by coordinates:', error);
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = `Could not fetch weather for your location. Please try again. (${error.message})`;
        return null;
    }
}

// New: Fetch 5-day forecast by coordinates
async function fetchForecastDataByCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${UNITS}`
        );
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        console.log('5-Day Forecast Data by Coords:', data);
        displayForecastCards(data);
        return data;
    } catch (error) {
        console.error('Error fetching 5-day forecast data by coordinates:', error);
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = `Could not fetch forecast for your location. Please try again. (${error.message})`;
        return null;
    }
}


// Main Weather Fetcher
let currentCityOrCoords = null; // Store the last successfully fetched city/coords

async function fetchWeather(query) {
    showLoading(); // Show loading indicator
    currentCityOrCoords = query; // Update current query for units toggle
    // introducing an artificial delay for testing loading visibility
    //await new Promise(resolve=> setTimeout(resolve, 500)); // 0.5sec delay
    let currentWeatherResult = null;
    let forecastResult = null;

    try {
        if (typeof query === 'string') { // It's a city name
            currentWeatherResult = await fetchCurrentWeatherByCity(query);
            if (currentWeatherResult) {
                forecastResult = await fetchForecastDataByCity(query);
            }
        } else if (typeof query === 'object' && query.lat && query.lon) { // It's coordinates
            currentWeatherResult = await fetchCurrentWeatherByCoords(query.lat, query.lon);
            if (currentWeatherResult) {
                forecastResult = await fetchForecastDataByCoords(query.lat, query.lon);
            }
        } else {
            errorMessageElement.classList.remove('hidden');
            errorMessageElement.textContent = "Invalid query provided for weather fetch.";
            console.error("Invalid query:", query);
            return;
        }

        if (currentWeatherResult && forecastResult) {
            // Only add to recent cities if both fetches were successful
            if (typeof query === 'string') {
                addRecentCity(query);
            } else if (currentWeatherResult.name) { // For coords, use the city name from API response
                addRecentCity(currentWeatherResult.name);
            }
        } else {
            // If any part of the fetch failed, the error message will be shown by individual fetch functions
            // and the main sections will remain hidden.
        }
    } finally {
        hideLoading(); // Always hide loading indicator when done or on error
    }
}


// Event Handlers 

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        cityInput.value = '';
    } else {
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = "Please enter a city name.";
    }
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

currentLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading(); // Show loading when requesting location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log("Current location:", { lat, lon });
                fetchWeather({ lat, lon });
            },
            (error) => {
                hideLoading(); // Hide loading on geolocation error
                errorMessageElement.classList.remove('hidden');
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessageElement.textContent = "Location access denied. Please allow location access in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessageElement.textContent = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessageElement.textContent = "The request to get user location timed out.";
                        break;
                    default:
                        errorMessageElement.textContent = "An unknown error occurred while getting your location.";
                        break;
                }
                console.error('Geolocation Error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        errorMessageElement.classList.remove('hidden');
        errorMessageElement.textContent = "Geolocation is not supported by your browser.";
    }
});

recentCitiesDropdown.addEventListener('change', (event) => {
    const selectedCity = event.target.value;
    if (selectedCity) {
        fetchWeather(selectedCity);
        event.target.value = '';
    }
});

// New: Units Toggle Button Event Listener
unitToggleBtn.addEventListener('click', () => {
    if (UNITS === 'metric') {
        UNITS = 'imperial';
        unitToggleBtn.textContent = 'Switch to °C';
    } else {
        UNITS = 'metric';
        unitToggleBtn.textContent = 'Switch to °F';
    }

    // Re-fetch weather for the current city/coords with the new unit
    if (currentCityOrCoords) {
        fetchWeather(currentCityOrCoords);
    } else {
        fetchWeather(CITY_NAME);
    }
});


// --- Initial Setup and Call on Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    updateRecentCitiesDropdown();
    // Decide default unit based on user preference or initial setting
    // For now, it will always start in Metric (Celsius)
    unitToggleBtn.textContent = UNITS === 'metric' ? 'Switch to °F' : 'Switch to °C';
    fetchWeather('bhiwandi');
});