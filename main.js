

async function getCoordinates(city) {

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);

const data = await response.json();

//Validation

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
    }
    const place = data.results[0];

    return {
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.name,
        country: place.country

    }
}



async function getWeather(latitude, longitude) {
    
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,weather_code,is_day`)

    const data = await response.json();

    console.log(data);

    return {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day
    }

}

function getWeatherStatus(isDay, weatherCode, temperature) {

    const time = isDay === 1 ? "day" : "night";

    let condition;

    // rain <= 51|| hot =  || normal = 

    if (weatherCode >= 51) {
        condition = "rain";
    } else if (temperature >= 30 && temperature <= 50) {
        condition = "hot";
    } else {
        condition = "normal";
    }
    return `${time}-${condition}`;
}

// async function test() {
    // const data = await getCoordinates(
    //     'cairo'
    // );
    // const weather = await getWeather(
    //     data.latitude,
    //     data.longitude
    // );
    // const status = getWeatherStatus(
    //     weather.isDay,
    //     weather.weatherCode,
    //     weather.temperature
    // );
    // console.log(status);
    // console.log(data);
    // console.log(weather);

// }

// test();

const bgLayer = document.querySelector("#bgLayer");
const search = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const resultCard = document.querySelector("#resultCard");
const city = document.querySelector("#resultCity");
const temperature = document.querySelector("#resultTemp");
const condition = document.querySelector("#resultCondition");
const statusText = document.querySelector("#statusText");
const spinner = document.querySelector("#spinner");

// Render

function render(state, place, weather) {
    bgLayer.className = "bg-layer " + state;
    city.textContent = `${place.name}, ${place.country}`;
    temperature.textContent = `${Math.round(weather.temperature)}°C`;
    condition.textContent = state.replace("-", " ");
    resultCard.hidden = false;
}

// Events

search.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value;
    resultCard.hidden = true;
    spinner.hidden = false;
    statusText.innerHTML = `Loading weather for <b>${city}</b> ...`;

    try {
    const place = await getCoordinates(
        city
    );

    const weather = await getWeather(
        place.latitude,
        place.longitude
    );

    const state = getWeatherStatus(
        weather.isDay,
        weather.weatherCode,
        weather.temperature
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    render(state, place, weather);

    statusText.innerHTML = "";
} catch (error) {
    statusText.innerHTML = `Error: ${error.message}`;
} finally {
        spinner.hidden = true;
    }

});
