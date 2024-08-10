import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const api = "https://api.openweathermap.org/data/2.5/weather?appid=24997bddb85e93f97e207177d3adf7f3&units=metric";

// Map OpenWeather icon codes to Weather Icons classes
function mapIconToWeatherIcon(iconCode) {
  const iconMap = {
    '01d': 'wi-day-sunny',
    '01n': 'wi-night-clear',
    '02d': 'wi-day-cloudy',
    '02n': 'wi-night-alt-cloudy',
    '03d': 'wi-cloud',
    '03n': 'wi-cloud',
    '04d': 'wi-cloudy',
    '04n': 'wi-cloudy',
    '09d': 'wi-showers',
    '09n': 'wi-showers',
    '10d': 'wi-day-rain',
    '10n': 'wi-night-alt-rain',
    '11d': 'wi-thunderstorm',
    '11n': 'wi-thunderstorm',
    '13d': 'wi-snow',
    '13n': 'wi-snow',
    '50d': 'wi-fog',
    '50n': 'wi-fog'
  };
  return iconMap[iconCode] || 'wi-na'; // Return 'wi-na' if iconCode is not found
}

// Function to generate date information
function getDateInfo() {
  const now = new Date();
  const optionsDate = { day: 'numeric', month: 'long', year: 'numeric' };
  const optionsTime = { weekday: 'long', hour: 'numeric', minute: '2-digit' };
  
  const date = now.toLocaleDateString('en-US', optionsDate);
  const time = now.toLocaleTimeString('en-US', optionsTime);
  const dayStatus = now.getHours() >= 6 && now.getHours() < 18 ? 'Day' : 'Night';

  return { date, time, dayStatus };
}

// Display the loading screen when the root path is accessed.
app.get('/', (req, res) => {
  res.render('loadingScreen.ejs');
});

// Handle the form submission and make a request to the weather API.
app.post('/', async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    const response = await axios.get(`${api}&lat=${latitude}&lon=${longitude}`);
    const result = response.data;

    // Map OpenWeather icon code to Weather Icons class
    result.weatherIconClass = mapIconToWeatherIcon(result.weather[0].icon);

    // Convert visibility to KM
    result.visibility = result.visibility / 1000;

    // Adjust data for aesthetic purposes
    result.main.temp = result.main.temp.toFixed(1);
    result.main.temp_max = result.main.temp_max.toFixed(1);
    result.main.temp_min = result.main.temp_min.toFixed(1);
    result.main.feels_like = result.main.feels_like.toFixed(1);

    // Convert sunrise and sunset to human-readable format
    const convertTimestampToTime = (timestamp) => {
      const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); // Return time in H:MM format
    };

    result.sunrise = convertTimestampToTime(result.sys.sunrise);
    result.sunset = convertTimestampToTime(result.sys.sunset);

      // Add date and time info to result
      const dateInfo = getDateInfo();
      result.dateInfo = dateInfo;

    // Render the index.ejs with the weather data
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: "Failed to get weather data",
    });
  }
});

// Handle form submission for searching by city name.
app.post('/search', async (req, res) => {
  const city = req.body.searchQueryInput;
  try {
    const response = await axios.get(`${api}&q=${city}`);
    const result = response.data;

    // Map OpenWeather icon code to Weather Icons class
    result.weatherIconClass = mapIconToWeatherIcon(result.weather[0].icon);

    result.visibility = result.visibility / 1000;

    result.main.temp = result.main.temp.toFixed(1);
    result.main.temp_max = result.main.temp_max.toFixed(1);
    result.main.temp_min = result.main.temp_min.toFixed(1);
    result.main.feels_like = result.main.feels_like.toFixed(1);

    const convertTimestampToTime = (timestamp) => {
      const date = new Date(timestamp * 1000);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    result.sunrise = convertTimestampToTime(result.sys.sunrise);
    result.sunset = convertTimestampToTime(result.sys.sunset);
    
    // Add date and time info to result
    const dateInfo = getDateInfo();
    result.dateInfo = dateInfo;
    res.render("index.ejs", { data: result });
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("index.ejs", {
      error: "something went wrong, check for spelling mistakes and try again",
    });
  }
});

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
