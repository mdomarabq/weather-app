/* ==========================================================================
   1. DOM ELEMENTS
   ========================================================================== */
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const errorMessage = document.getElementById("errorMessage");
const loadingIndicator = document.getElementById("loadingIndicator");
const weatherCard = document.getElementById("weatherCard");
const cityName = document.getElementById("cityName");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const unitToggle = document.getElementById("unitToggle");
const locateButton = document.getElementById("locateButton");

const API_key = "7c911b98e7ef4e08a08205012262109";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

let currentUnit = "C";
let currentWeatherData;

/* ==========================================================================
   2. CANVAS ANIMATION ENGINE (RAIN, SUN, CLOUDS, SNOW, NIGHT STARS & MOON)
   ========================================================================== */
const canvas = document.getElementById("weatherCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let weatherType = "clear";
let isNightMode = false;
let animationFrameId;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function initWeatherEffect(type, isNight = false) {
    weatherType = type;
    isNightMode = isNight;
    particles = [];
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (isNight) {
        // Night Mode: Generate Stars
        for (let i = 0; i < 90; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.7),
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random(),
                speed: Math.random() * 0.02 + 0.005
            });
        }
    } else {
        const particleCount = type === "rain" ? 200 : type === "snow" ? 100 : type === "clouds" ? 8 : 0;

        for (let i = 0; i < particleCount; i++) {
            if (type === "rain") {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    length: Math.random() * 20 + 10,
                    speed: Math.random() * 10 + 15
                });
            } else if (type === "snow") {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 3 + 1,
                    speedY: Math.random() * 2 + 1,
                    speedX: Math.random() * 1 - 0.5
                });
            } else if (type === "clouds") {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * (canvas.height * 0.4),
                    radius: Math.random() * 60 + 40,
                    speed: Math.random() * 0.4 + 0.1
                });
            }
        }
    }
    animateWeather();
}

function animateWeather() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isNightMode) {
        // Draw Moon
        const moonX = canvas.width - 150;
        const moonY = 130;

        // Moon Glow
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 70);
        moonGlow.addColorStop(0, "rgba(255, 255, 230, 0.9)");
        moonGlow.addColorStop(0.5, "rgba(255, 255, 230, 0.2)");
        moonGlow.addColorStop(1, "rgba(255, 255, 230, 0)");

        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
        ctx.fill();

        // Crescent Moon Base
        ctx.fillStyle = "#fffdf0";
        ctx.beginPath();
        ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
        ctx.fill();

        // Cutout for Crescent
        ctx.fillStyle = "#020111"; 
        ctx.beginPath();
        ctx.arc(moonX + 10, moonY - 5, 24, 0, Math.PI * 2);
        ctx.fill();

        // Twinkling Stars
        ctx.fillStyle = "#ffffff";
        particles.forEach(p => {
            p.alpha += p.speed;
            if (p.alpha > 1 || p.alpha < 0) p.speed = -p.speed;

            ctx.globalAlpha = Math.abs(p.alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

    } else if (weatherType === "rain") {
        ctx.strokeStyle = "rgba(174, 194, 224, 0.6)";
        ctx.lineWidth = 1.5;
        particles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x, p.y + p.length);
            ctx.stroke();
            p.y += p.speed;
            if (p.y > canvas.height) p.y = -p.length;
        });
    } else if (weatherType === "snow") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y > canvas.height) p.y = -5;
        });
    } else if (weatherType === "clouds") {
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.arc(p.x + 40, p.y - 10, p.radius * 0.8, 0, Math.PI * 2);
            ctx.arc(p.x - 40, p.y - 10, p.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.speed;
            if (p.x - p.radius > canvas.width) p.x = -p.radius * 2;
        });
    } else if (weatherType === "clear") {
        // Sun Pulse
        const time = Date.now() * 0.001;
        const sunRadius = 80 + Math.sin(time) * 5;
        const gradient = ctx.createRadialGradient(canvas.width - 150, 150, 10, canvas.width - 150, 150, sunRadius * 2);
        gradient.addColorStop(0, "rgba(255, 223, 0, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 183, 0, 0.3)");
        gradient.addColorStop(1, "rgba(255, 183, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width - 150, 150, sunRadius * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    animationFrameId = requestAnimationFrame(animateWeather);
}

function updateVisualTheme(conditionText, isDay) {
    const text = conditionText.toLowerCase();
    document.body.className = "";

    // NIGHT TIME LOGIC (is_day === 0)
    if (isDay === 0) {
        if (text.includes("rain") || text.includes("drizzle")) {
            document.body.classList.add("weather-night-rain");
            initWeatherEffect("rain", false);
        } else {
            document.body.classList.add("weather-night");
            initWeatherEffect("clear", true); // Trigger Night Mode Canvas
        }
        return;
    }

    // DAY TIME LOGIC
    if (text.includes("rain") || text.includes("drizzle") || text.includes("shower")) {
        document.body.classList.add("weather-rain");
        initWeatherEffect("rain", false);
    } else if (text.includes("snow") || text.includes("ice") || text.includes("blizzard")) {
        document.body.classList.add("weather-snow");
        initWeatherEffect("snow", false);
    } else if (text.includes("cloud") || text.includes("overcast") || text.includes("mist")) {
        document.body.classList.add("weather-clouds");
        initWeatherEffect("clouds", false);
    } else {
        document.body.classList.add("weather-clear");
        initWeatherEffect("clear", false);
    }
}

/* ==========================================================================
   3. API & APP LOGIC
   ========================================================================== */
async function fetchWeather(city) {
    loadingIndicator.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";

    try {
        const url = `${BASE_URL}?key=${API_key}&q=${encodeURIComponent(city)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found please try again.");

        const data = await response.json();
        currentWeatherData = data;

        renderWeather(data);
        saveData(data);

    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.classList.remove("hidden");
    } finally {
        loadingIndicator.classList.add("hidden");
    }
}

function renderWeather(data) {
    cityName.textContent = `${data.location.name}, ${data.location.country}`;
    weatherDescription.textContent = data.current.condition.text;
    weatherIcon.src = `https:${data.current.condition.icon}`;
    weatherIcon.alt = data.current.condition.text;
    temperature.textContent = currentUnit === "C" ? `${Math.round(data.current.temp_c)}°C` : `${Math.round(data.current.temp_f)}°F`;
    feelsLike.textContent = currentUnit === "C" ? `${Math.round(data.current.feelslike_c)}°C` : `${Math.round(data.current.feelslike_f)}°F`;
    humidity.textContent = `${data.current.humidity}%`;
    windSpeed.textContent = `${Math.round(data.current.wind_kph)} km/h`;

    weatherCard.classList.remove("hidden");
    loadingIndicator.classList.add("hidden");

    // Pass condition text AND is_day (0 or 1)
    updateVisualTheme(data.current.condition.text, data.current.is_day);
}

function saveData(data) { localStorage.setItem("weatherCity", JSON.stringify(data)); }
function loadData() {
    const savedData = localStorage.getItem("weatherCity");
    return savedData ? JSON.parse(savedData) : null;
}

/* ==========================================================================
   4. EVENT LISTENERS & INITIALIZATION
   ========================================================================== */
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) fetchWeather(query);
});

unitToggle.addEventListener("click", function () {
    currentUnit = currentUnit === "C" ? "F" : "C";
    unitToggle.textContent = currentUnit === "C" ? "Switch to °F" : "Switch to °C";
    if (currentWeatherData) renderWeather(currentWeatherData);
});

locateButton.addEventListener("click", function () {
    errorMessage.classList.add("hidden");
    errorMessage.textContent = "";

    if (!navigator.geolocation) {
        errorMessage.textContent = "Your browser does not support Geo-location";
        errorMessage.classList.remove("hidden");
        return;
    }

    loadingIndicator.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        (err) => {
            loadingIndicator.classList.add("hidden");
            errorMessage.textContent = "Location permission denied or unavailable";
            errorMessage.classList.remove("hidden");
        }
    );
});

// Auto-load or default init
const savedData = loadData();
if (savedData) {
    renderWeather(savedData);
    fetchWeather(savedData.location.name);
} else {
    initWeatherEffect("clear", false);
}