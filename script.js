/* ==========================================================================
   1. DOM ELEMENTS
   ========================================================================== */

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    const errorMessage = document.getElementById("errorMessage");
    const loadingIndicator =document.getElementById("loadingIndicator");

    const weatherCard = document.getElementById("weatherCard");
    const cityName = document.getElementById("cityName");
    const weatherDescription = document.getElementById("weatherDescription");

    const weatherIcon = document.getElementById("weatherIcon");
    const temperature = document.getElementById("temperature");
    const feelsLike = document.getElementById("feelsLike");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("windSpeed");

    const unitToggle = document.getElementById("unitToggle");

    const API_key = "7c911b98e7ef4e08a08205012262109";
    const BASE_URL = "http://api.weatherapi.com/v1/current.json";

    let currentUnit = "C";
    let currentWeatherData;



   /* ==========================================================================
   FUNCTIONS
   ========================================================================== */
    async function fetchWeather(city){
        loadingIndicator.classList.remove("hidden")
        weatherCard.classList.add("hidden")
        errorMessage.classList.add("hidden")
        try {
            
            const url = `${BASE_URL}?key=${API_key}&q=${encodeURIComponent(city)}`;
            const response = await fetch(url);
            if(!response.ok){
                throw new Error("City not found please try again.")
            }
            console.log(response);

            const data = await response.json();
            currentWeatherData = data;

            console.log(data);

            renderWeather(data);
            saveData(data);







        } catch (error) {
            errorMessage.textContent = error
            errorMessage.classList.remove("hidden")
            loadingIndicator.classList.add("hidden")


        }finally{
            loadingIndicator.classList.add("hidden")


        }
    }
    function renderWeather(data){

        cityName.textContent = `${data.location.name}, ${data.location.country}`
        weatherDescription.textContent = data.current.condition.text
        weatherIcon.src = `https:${data.current.condition.icon}`
        weatherIcon.alt = data.current.condition.text
        temperature.textContent = currentUnit === "C"? `${Math.round(data.current.temp_c)}°C` : `${Math.round(data.current.temp_f)}°F`;
         
        feelsLike.textContent = currentUnit ==="C"? `${Math.round (data.current.feelslike_c)}°C` : `${Math.round (data.current.feelslike_f)}°F`;
        humidity.textContent = `${data.current.humidity}%` 
        windSpeed.textContent = `${Math.round (data.current.wind_kph)} kmh`

        weatherCard.classList.remove("hidden");
        loadingIndicator.classList.add("hidden");

        

            
    
    }

    function saveData(data){
        localStorage.setItem("weatherCity", JSON.stringify(data))
    }

    function loadData(){
       const savedData = localStorage.getItem("weatherCity");
       if(savedData){
        return JSON.parse(savedData);
       }
       return null;
    }


/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

 searchForm.addEventListener("submit", function(e){
    e.preventDefault();
    const query = searchInput.value.trim();

    fetchWeather(query);
    

    
 })

 unitToggle.addEventListener("click", function(){
   
    if(currentUnit === "C"){
        unitToggle.textContent = "Switch to °C"
        currentUnit = "F";

    }

    else{
        unitToggle.textContent = "Switch to °F"
        currentUnit = "C";

    }

    if(currentWeatherData){
    renderWeather(currentWeatherData)
    }
 })


 const savedData = loadData()
 if(savedData){
     renderWeather(savedData)

     fetchWeather(savedData.location.name)

 }
