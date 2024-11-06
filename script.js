document.getElementById('get-weather').addEventListener('click', function() {
    const city = document.getElementById('city').value;
    const unit = document.getElementById('unit').value;
    if (city) {
        getWeather(city, unit);
    } else {
        alert('Please enter a city name.');
    }
});

async function getWeather(city, unit) {
    const apiKey = '34ef53bb0acca24847f8505e9ee1df4b';
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${unit}`);
        
        if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('City not found');
        
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData, unit);
        displayForecast(forecastData, unit);
    } catch (error) {
        alert(error.message);
    }
}

function displayWeather(data, unit) {
    const weatherDetails = document.getElementById('weather-details');
    const tempUnit = unit === 'metric' ? '°C' : '°F';
    const timezoneOffset = data.timezone;

    const cityLocalTime = new Date((data.dt + timezoneOffset) * 1000).toLocaleTimeString('en-US', { timeZone: 'UTC' });

    const sunriseTime = new Date((data.sys.sunrise + timezoneOffset) * 1000).toLocaleTimeString('en-US', { timeZone: 'UTC' });
    const sunsetTime = new Date((data.sys.sunset + timezoneOffset) * 1000).toLocaleTimeString('en-US', { timeZone: 'UTC' });

    const now = new Date((data.dt + timezoneOffset) * 1000);
    const sunrise = new Date((data.sys.sunrise + timezoneOffset) * 1000);
    const sunset = new Date((data.sys.sunset + timezoneOffset) * 1000);

    let relevantTime;
    if (now < sunrise || now > sunset) {
        relevantTime = sunriseTime;
    } else if (now >= sunrise && now <= sunset) {
        relevantTime = sunsetTime;
    }

    const weatherIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const weatherCondition = data.weather[0].main.toLowerCase();

    document.body.style.backgroundImage = getBackgroundImage(weatherCondition);

    weatherDetails.innerHTML = `
        <h2>${data.name}</h2>
        <img src="${weatherIcon}" alt="${data.weather[0].description}" class="weather-icon">
        <div class="weather-detail"><span>Temperature:</span> <span>${data.main.temp} ${tempUnit}</span></div>
        <div class="weather-detail"><span>Weather:</span> <span>${data.weather[0].description}</span></div>
        <div class="weather-detail"><span>Humidity:</span> <span>${data.main.humidity} %</span></div>
        <div class="weather-detail"><span>Wind Speed:</span> <span>${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</span></div>
        <div class="weather-detail"><span>Local Time:</span> <span>${cityLocalTime}</span></div>
        <div class="weather-detail"><span>Relevant Time:</span> <span>${relevantTime}</span></div>
    `;
}

function getBackgroundImage(condition) {
    switch (condition) {
        case 'clear':
            return "url('https://example.com/sunny.jpg')";
        case 'clouds':
            return "url('https://example.com/cloudy.jpg')";
        case 'rain':
            return "url('https://example.com/rainy.jpg')";
        case 'snow':
            return "url('https://example.com/snowy.jpg')";
        default:
            return "url('https://example.com/default.jpg')";
    }
}

function displayForecast(data, unit) {
    const forecastDetails = document.getElementById('forecast-details');
    const tempUnit = unit === 'metric' ? '°C' : '°F';

    const dailyForecasts = data.list.reduce((acc, curr) => {
        const date = new Date(curr.dt * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (!acc[date]) {
            acc[date] = { temps: [], icon: curr.weather[0].icon };
        }
        acc[date].temps.push(curr.main.temp);
        return acc;
    }, {});

    let forecastHTML = '<h2>3-Day Forecast</h2>';
    Object.keys(dailyForecasts).slice(0, 3).forEach(date => {
        const temps = dailyForecasts[date].temps;
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);
        const weatherIcon = `http://openweathermap.org/img/wn/${dailyForecasts[date].icon}@2x.png`;

        forecastHTML += `
            <div class="forecast-detail">
                <span>${date}</span>
                <img src="${weatherIcon}" alt="weather icon" class="forecast-icon">
                <span>Min: ${minTemp} ${tempUnit}</span>
                <span>Max: ${maxTemp} ${tempUnit}</span>
            </div>
        `;
    });

    forecastDetails.innerHTML = forecastHTML;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const unit = document.getElementById('unit').value;
            getWeatherByCoords(lat, lon, unit);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

async function getWeatherByCoords(lat, lon, unit) {
    const apiKey = '34ef53bb0acca24847f8505e9ee1df4b';
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        
        if (!weatherResponse.ok || !forecastResponse.ok) throw new Error('Location not found');
        
        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();

        displayWeather(weatherData, unit);
        displayForecast(forecastData, unit);
    } catch (error) {
        alert(error.message);
    }
}
