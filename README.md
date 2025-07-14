# Weather Forecast App

A simple web application to display current weather and a 5-day forecast for any city, built with HTML, Tailwind CSS, and JavaScript.

## Features

* Search weather by city name.
* Get weather for your current location.
* Toggle between Celsius (°C) and Fahrenheit (°F).
* Stores recently searched cities.
* Responsive design.

## Setup & Run

1.  **Clone the repository** or download the files.
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Get an OpenWeatherMap API Key:**
    * Sign up at [OpenWeatherMap](https://openweathermap.org/).
    * Copy your API key from your profile.
4.  **Update `script.js`:**
    * Open `script.js` and replace `'YOUR_OPENWEATHERMAP_API_KEY'` with your actual key.
5.  **Start Tailwind CSS:**
    ```bash
    npm run dev
    ```
    (Keep this terminal window open.)
6.  **Open `index.html`** in your web browser.

## Usage

* Type a city name in the search bar and press Enter or click "Search".
* Click "Use Current Location" for your local weather.
* Use the "Switch to °F" / "°C" button to change units.
* Select from the "Recent Cities" dropdown.
