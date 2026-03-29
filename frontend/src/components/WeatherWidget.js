import React, { useState, useEffect, useRef } from "react";
import { Cloud, MapPin, Loader2, Thermometer } from "lucide-react";
import axios from "axios";

export default function WeatherWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Your Location");
  
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchWeather = async () => {
    if (weather) return; // already fetched
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Get weather
          const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          setWeather(res.data.current_weather);
          
          // Try to get city name (optional)
          try {
            const geocode = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (geocode.data.address) {
              setLocationName(geocode.data.address.city || geocode.data.address.town || geocode.data.address.state || "Your Location");
            }
          } catch(e) { /* ignore geocode error */ }
          
        } catch (err) {
          setError("Failed to fetch weather.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Location permission denied.");
        setLoading(false);
      }
    );
  };

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !weather && !loading) {
      fetchWeather();
    }
  };

  return (
    <div style={{ position: "relative" }} ref={popoverRef}>
      <button 
        onClick={handleToggle}
        className="btn btn-outline btn-sm"
      >
        <Cloud size={16} color="var(--accent-cyan)" /> Weather
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          marginTop: 8,
          width: 240,
          background: "rgba(13,21,38,0.98)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: 18,
          boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
          zIndex: 200,
          animation: "fadeInUp 0.2s ease-out forwards"
        }}>
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", color: "var(--text-muted)" }}>
              <Loader2 size={24} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 13 }}>Detecting location...</div>
            </div>
          )}
          {error && !loading && (
            <div style={{ color: "var(--accent-amber)", fontSize: 13, textAlign: "center", padding: "10px 0" }}>
              {error}
            </div>
          )}
          {weather && !loading && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <MapPin size={14} color="var(--accent-cyan)" />
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{locationName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Thermometer size={32} color="var(--accent-amber)" />
                <div>
                  <div style={{ fontSize: 30, fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1 }}>
                    {weather.temperature}°C
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                    Wind: {weather.windspeed} km/h
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
