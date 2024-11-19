import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Grp204WeatherApp() {
  const [isDayMode, setIsDayMode] = useState(true); // État pour le mode matin/nuit
  const [input, setInput] = useState('');
  const [weather, setWeather] = useState({
    loading: false,
    current: null,
    forecast: [],
    error: false,
  });
  const [favorites, setFavorites] = useState([]);

  // Charger les villes favorites depuis le localStorage au montage du composant
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const toDateFunction = (date) => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const WeekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const d = new Date(date);
    const formattedDate = `${WeekDays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
    return formattedDate;
  };

  const search = async (cityName) => {
    setWeather({ ...weather, loading: true });
    const api_key = 'f00c38e0279b7bc85480c3fe775d518c';

    try {
      const currentWeatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: cityName,
          units: 'metric',
          appid: api_key,
        },
      });

      const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: cityName,
          units: 'metric',
          appid: api_key,
        },
      });

      const forecastData = forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

      setWeather({
        current: currentWeatherResponse.data,
        forecast: forecastData,
        loading: false,
        error: false,
      });
    } catch (error) {
      setWeather({ current: null, forecast: [], loading: false, error: true });
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      search(input);
      setInput('');
    }
  };

  const addFavorite = () => {
    if (input && !favorites.includes(input)) {
      const updatedFavorites = [...favorites, input];
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setInput('');
    } else if (favorites.includes(input)) {
      alert(`${input} est déjà dans les favoris.`);
    }
  };

  const removeFavorite = (cityName) => {
    const updatedFavorites = favorites.filter((city) => city !== cityName);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const loadFavorite = (cityName) => {
    search(cityName);
  };

  return (
    <div
      className="App"
      style={{
        background: isDayMode ? '#ffffff' : '#2c2c2c',
        color: isDayMode ? '#000' : '#fff',
      }}
    >
      <header>
        <h1 className="app-name">Application Météo grp204</h1>
        {/* Toggle Switch */}
        <div className="toggle-container">
          <input
            type="checkbox"
            id="theme-toggle"
            className="toggle-checkbox"
            checked={!isDayMode}
            onChange={() => setIsDayMode(!isDayMode)}
          />
          <label htmlFor="theme-toggle" className="toggle-label">
            <span className="toggle-circle"></span>
          </label>
          <span className="theme-text">{isDayMode ? 'Mode Matin' : 'Mode Nuit'}</span>
        </div>
      </header>

      <div className="favorites">
        <h2>Villes favorites</h2>
        {favorites.map((city, index) => (
          <div key={index} className="favorite-item">
            <button className="favorite-city" onClick={() => loadFavorite(city)}>
              {city}
            </button>
            <button className="remove-btn" onClick={() => removeFavorite(city)}>
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="city-search"
          placeholder="Entrez le nom de la ville..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="favorite-btn" onClick={addFavorite}>
          Ajouter aux favoris
        </button>
      </div>

      {weather.loading && <div className="loader">Chargement...</div>}

      {weather.error && <span className="error-message">Ville introuvable</span>}

      {weather.current && (
        <div>
          <h2>{weather.current.name}, {weather.current.sys.country}</h2>
          <span>{toDateFunction(new Date())}</span>
          <img
            src={`https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`}
            alt={weather.current.weather[0].description}
          />
          <p>{Math.round(weather.current.main.temp)}°C</p>
          <p>Vitesse du vent : {weather.current.wind.speed} m/s</p>
        </div>
      )}

      {weather.forecast.length > 0 && (
        <div className="forecast">
          <h2>Prévisions pour les 5 prochains jours</h2>
          <div className="forecast-cards">
            {weather.forecast.map((day, index) => (
              <div key={index} className="forecast-item">
                <p>{toDateFunction(day.dt_txt)}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>{Math.round(day.main.temp)}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grp204WeatherApp;
