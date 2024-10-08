"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudIcon, MapPinIcon, ThermometerIcon, SunIcon, UmbrellaIcon, MoonIcon } from "lucide-react";

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  unit: string;
}

export default function WeatherWidget() {
  const [location, setLocation] = useState<string>("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(false);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation === "") {
      setError("Please enter a valid location.");
      setWeather(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${trimmedLocation}`
      );
      if (!response.ok) {
        throw new Error("City not found");
      }
      const data = await response.json();
      const weatherData: WeatherData = {
        temperature: data.current.temp_c,
        description: data.current.condition.text,
        location: data.location.name,
        unit: "C",
      };
      setWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("City not found. Please try again.");
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  function getTemperatureMessage(temperature: number, unit: string): string {
    if (unit === "C") {
      if (temperature < 0) return `It's freezing at ${temperature}°C! Stay indoors if possible.`;
      if (temperature < 10) return `Quite cold at ${temperature}°C. Dress warmly with layers.`;
      if (temperature < 20) return `A cool ${temperature}°C. A light jacket should be enough.`;
      if (temperature < 30) return `It's ${temperature}°C, pleasantly warm. Perfect for outdoor activities!`;
      return `It's extremely hot at ${temperature}°C! Avoid strenuous outdoor activities.`;
    }
    return `${temperature}°${unit}`;
  }

  function getWeatherMessage(description: string): string {
    switch (description.toLowerCase()) {
      case "sunny": return "Sunny and bright. Wear sunglasses and sunscreen!";
      case "rain": return "Rainy day. Don't forget your umbrella and a waterproof jacket.";
      default: return description;
    }
  }

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const bgClass = isDarkTheme ? "bg-gray-800 text-white" : "bg-white text-gray-800";

  const getAnimation = (description: string) => {
    switch (description.toLowerCase()) {
      case "sunny":
        return <SunIcon className="sun-animation w-12 h-12 text-yellow-400" />;
      case "rain":
        return <UmbrellaIcon className="rain-animation w-12 h-12 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-center items-center h-screen ${bgClass} transition-colors duration-500`}>
      <Button
        onClick={toggleTheme}
        className="absolute top-4 right-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-700"
      >
        {isDarkTheme ? "Light Mode" : "Dark Mode"} <MoonIcon className="ml-2" />
      </Button>

      <Card className={`w-full max-w-md mx-auto text-center rounded-lg shadow-lg p-6 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-500`}>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold mb-2">Enhanced Weather Widget</CardTitle>
          <CardDescription>Get current weather details and tips for your location.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter a city name"
              value={location}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
            <Button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </form>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {weather && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <ThermometerIcon className="w-8 h-8" />
                <div>{getTemperatureMessage(weather.temperature, weather.unit)}</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CloudIcon className="w-8 h-8" />
                <div>{getWeatherMessage(weather.description)}</div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPinIcon className="w-8 h-8" />
                <div>{weather.location}</div>
              </div>
              <div className="flex justify-center">{getAnimation(weather.description)}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
