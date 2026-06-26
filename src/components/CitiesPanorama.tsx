import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { 
  Search, 
  MapPin, 
  Clock, 
  CloudSun, 
  Compass, 
  Activity, 
  Image as ImageIcon, 
  X, 
  Columns2, 
  Sun, 
  Moon, 
  Maximize2, 
  Minimize2, 
  Camera, 
  Thermometer, 
  Wind, 
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";

// Pre-defined detailed dataset for the 10 popular cities
interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: string;
  elevation: string;
  timezone: string;
  landmark: string;
}

const POPULAR_CITIES: CityData[] = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, population: "37.4M", elevation: "40m", timezone: "Asia/Tokyo", landmark: "Shibuya Crossing" },
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.0060, population: "8.8M", elevation: "10m", timezone: "America/New_York", landmark: "Times Square" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278, population: "9.0M", elevation: "11m", timezone: "Europe/London", landmark: "Tower Bridge" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, population: "3.3M", elevation: "5m", timezone: "Asia/Dubai", landmark: "Burj Khalifa" },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, population: "2.1M", elevation: "35m", timezone: "Europe/Paris", landmark: "Eiffel Tower" },
  { name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, population: "20.9M", elevation: "14m", timezone: "Asia/Kolkata", landmark: "Gateway of India" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, population: "5.3M", elevation: "19m", timezone: "Australia/Sydney", landmark: "Sydney Opera House" },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, population: "9.5M", elevation: "23m", timezone: "Africa/Cairo", landmark: "Great Pyramid of Giza" },
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, population: "12.3M", elevation: "760m", timezone: "America/Sao_Paulo", landmark: "Paulista Avenue" },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707, population: "11.5M", elevation: "6m", timezone: "Asia/Kolkata", landmark: "Marina Beach" }
];

export default function CitiesPanorama() {
  const [selectedCity, setSelectedCity] = useState<CityData>(POPULAR_CITIES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Map settings
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [lightPollution, setLightPollution] = useState(1.0); // emissive intensity
  const [isDayTime, setIsDayTime] = useState(true);
  const [sunAngle, setSunAngle] = useState(1.2); // Sun rotation angle

  // Info details state
  const [weatherData, setWeatherData] = useState<any>(null);
  const [issPassTime, setIssPassTime] = useState<string>("In 1h 42m");
  const [localTime, setLocalTime] = useState<string>("");
  const [timezoneInfo, setTimezoneInfo] = useState<string>("");

  // Panoramic view & UI state
  const [panoramaActive, setPanoramaActive] = useState(false);
  const [issPhotos, setIssPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Comparison mode
  const [compareActive, setCompareActive] = useState(false);
  const [compareCity, setCompareCity] = useState<CityData>(POPULAR_CITIES[1]);
  const [compareWeather, setCompareWeather] = useState<any>(null);
  const [compareLocalTime, setCompareLocalTime] = useState("");

  // Refs for 3D Globe
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const markersRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<any | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Animation targets
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const isTransitioning = useRef(false);

  // Calculate local time of selected timezone
  useEffect(() => {
    const updateTimes = () => {
      try {
        if (selectedCity) {
          const formatter = new Intl.DateTimeFormat([], {
            timeZone: selectedCity.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
          setLocalTime(formatter.format(new Date()));
        }
        if (compareActive && compareCity) {
          const formatter = new Intl.DateTimeFormat([], {
            timeZone: compareCity.timezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          });
          setCompareLocalTime(formatter.format(new Date()));
        }
      } catch (err) {
        setLocalTime(new Date().toLocaleTimeString());
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [selectedCity, compareCity, compareActive]);

  // Fetch Weather using free, keyless Open-Meteo API
  useEffect(() => {
    const fetchWeather = async () => {
      if (!selectedCity) return;
      try {
        setWeatherData(null);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m`
        );
        const data = await res.json();
        if (data && data.current_weather) {
          setWeatherData({
            temp: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    };

    // Simulated ISS transit times based on orbital geometry
    const latFactor = Math.sin(selectedCity.lat * 0.017);
    const lonFactor = Math.cos(selectedCity.lon * 0.017);
    const nextMinutes = Math.abs(Math.round((latFactor + lonFactor) * 120 + 35)) % 180;
    const hours = Math.floor(nextMinutes / 60);
    const mins = nextMinutes % 60;
    setIssPassTime(hours > 0 ? `${hours}h ${mins}m` : `${mins}m`);

    fetchWeather();
  }, [selectedCity]);

  // Fetch Compare Weather
  useEffect(() => {
    const fetchCompareWeather = async () => {
      if (!compareActive || !compareCity) return;
      try {
        setCompareWeather(null);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${compareCity.lat}&longitude=${compareCity.lon}&current_weather=true`
        );
        const data = await res.json();
        if (data && data.current_weather) {
          setCompareWeather({
            temp: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
            weathercode: data.current_weather.weathercode,
          });
        }
      } catch (e) {
        console.error("Compare weather fetch failed", e);
      }
    };

    fetchCompareWeather();
  }, [compareCity, compareActive]);

  // Fetch Real NASA photos of the selected city from space
  useEffect(() => {
    const fetchNasaPhotos = async () => {
      if (!selectedCity) return;
      setLoadingPhotos(true);
      setIssPhotos([]);
      try {
        const query = encodeURIComponent(`${selectedCity.name} earth from orbit`);
        const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image`);
        const data = await res.json();
        if (data && data.collection && data.collection.items) {
          const items = data.collection.items.slice(0, 8).map((item: any) => {
            const title = item.data?.[0]?.title || "ISS Earth Observation";
            const desc = item.data?.[0]?.description || "Photography taken from orbit altitude.";
            const imgUrl = item.links?.[0]?.href || "";
            return { title, desc, imgUrl };
          });
          setIssPhotos(items);
        }
      } catch (e) {
        console.error("NASA images query failed", e);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchNasaPhotos();
  }, [selectedCity]);

  // Convert lat/lon to standard 3D Cartesian coordinates for a sphere of radius R
  const convertCoords = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.sin(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    return new THREE.Vector3(x, y, z);
  };

  // Trigger camera cinematic look-at fly-to transition
  const flyToCity = (city: CityData, zoomIn = false) => {
    if (!cameraRef.current || !controlsRef.current) return;

    // Radius of Globe is 2
    const targetRad = zoomIn ? 2.18 : 3.8; // Closely hover or wide orbital angle
    const cityPos = convertCoords(city.lat, city.lon, 2);
    
    // Position the camera slightly offset from the city surface vector
    const camDirection = cityPos.clone().normalize();
    const targetCamPosition = camDirection.multiplyScalar(targetRad);

    targetCamPos.current = targetCamPosition;
    targetLookAt.current = cityPos;
    isTransitioning.current = true;
  };

  // Build/Rebuild 3D Globe Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene & Render
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 550;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2); // Start far away in space
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // 2. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.12; // Do not let user go inside the atmosphere/crust
    controls.maxDistance = 15;
    controlsRef.current = controls;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a0a0f, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Soft bluish reflection light (atmospheric scattering mock)
    const scatterLight = new THREE.DirectionalLight(0x3b82f6, 0.7);
    scatterLight.position.set(-5, -3, -5);
    scene.add(scatterLight);

    // 4. Stars Background particles
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Place randomly on a massive sphere shell
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 50 + Math.random() * 50;

      starPositions[i] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 1] = r * Math.cos(phi);
      starPositions[i + 2] = r * Math.sin(phi) * Math.cos(theta);

      // Star colors (white/cyan/amber sparkle)
      const rand = Math.random();
      if (rand > 0.8) {
        starColors[i] = 0.5; starColors[i + 1] = 0.8; starColors[i + 2] = 1.0; // Bluish
      } else if (rand > 0.6) {
        starColors[i] = 1.0; starColors[i + 1] = 0.9; starColors[i + 2] = 0.6; // Soft Amber
      } else {
        starColors[i] = 1.0; starColors[i + 1] = 1.0; starColors[i + 2] = 1.0; // White
      }
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 5. Textures & Globe Material setup
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    // Load day and night textures from stable CDN
    const dayTex = textureLoader.load("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
    const nightTex = textureLoader.load("https://unpkg.com/three-globe/example/img/earth-night.jpg");
    const bumpTex = textureLoader.load("https://unpkg.com/three-globe/example/img/earth-topology.png");

    dayTex.colorSpace = THREE.SRGBColorSpace;
    nightTex.colorSpace = THREE.SRGBColorSpace;

    // Use a custom shader to mix Day (Blue Marble) and Night (Black Marble) perfectly
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTex },
        nightTexture: { value: nightTex },
        bumpMap: { value: bumpTex },
        sunDirection: { value: new THREE.Vector3() },
        lightPollution: { value: lightPollution },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D bumpMap;
        uniform vec3 sunDirection;
        uniform float lightPollution;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Normal map or bump displacement simulation
          vec3 normal = normalize(vNormal);
          
          // Light calculation based on light source direction
          float intensity = dot(normal, sunDirection);
          
          // Smooth the day/night transition boundary (terminator line)
          float terminator = smoothstep(-0.15, 0.15, intensity);
          
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Enhance glowing city lights emission on the dark side of the earth
          vec4 glowingLights = nightColor * lightPollution * 1.5;
          
          // Mix day and night colors elegantly
          vec4 mixedColor = mix(glowingLights, dayColor, terminator);
          
          // Add subtle atmospheric shading on the lit rim
          float rim = 1.0 - max(0.0, dot(vec3(0.0, 0.0, 1.0), normal));
          mixedColor.rgb += vec3(0.1, 0.4, 0.8) * pow(rim, 4.0) * terminator;
          
          gl_FragColor = mixedColor;
        }
      `,
    });

    const globeGeo = new THREE.SphereGeometry(2, 64, 64);
    const globe = new THREE.Mesh(globeGeo, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Clouds sphere
    const cloudTex = textureLoader.load("https://unpkg.com/three-globe/example/img/earth-clouds.png");
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const cloudSphere = new THREE.Mesh(new THREE.SphereGeometry(2.02, 64, 64), cloudMat);
    scene.add(cloudSphere);

    // 6. Rayleigh Scattering Atmospheric Glow Shader
    const atmosphereGeo = new THREE.SphereGeometry(2.08, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          // Fresnel effect for scattering limb glow
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          // Gorgeous cyan/blue sky glow color gradient
          gl_FragColor = vec4(0.35, 0.65, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphere);
    atmosphereRef.current = atmosphere;

    // 7. City Markers Group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersRef.current = markersGroup;

    // Add glowing circular flares at popular cities
    POPULAR_CITIES.forEach((city) => {
      const position = convertCoords(city.lat, city.lon, 2.01);
      
      // Halo / Flare ring
      const ringGeo = new THREE.RingGeometry(0.025, 0.05, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffd700, // Golden yellow glow for city lights
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(position);
      // Orient the ring perpendicular to the sphere surface normal
      ring.lookAt(position.clone().multiplyScalar(2));
      markersGroup.add(ring);

      // Inner flashing core beacon
      const coreGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xff4500 }); // Neon amber core
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.copy(position);
      markersGroup.add(core);
    });

    // Handle Resize using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(mountRef.current);

    // Initial cinematic entrance target
    flyToCity(selectedCity, false);

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Rotate clouds slowly
      cloudSphere.rotation.y = elapsed * 0.007;

      // Rotate Sun/Daylight slowly or lock with state
      const currentSunAngle = sunAngle + elapsed * 0.002;
      const sunDir = new THREE.Vector3(
        Math.cos(currentSunAngle) * 5,
        0,
        Math.sin(currentSunAngle) * 5
      ).normalize();
      
      sunLight.position.copy(sunDir).multiplyScalar(5);

      // Update shader sunDirection uniform
      if (globe.material && (globe.material as THREE.ShaderMaterial).uniforms) {
        (globe.material as THREE.ShaderMaterial).uniforms.sunDirection.value.copy(sunDir);
        (globe.material as THREE.ShaderMaterial).uniforms.lightPollution.value = lightPollution;
      }

      // Pulse markers
      const pulseScale = 1.0 + Math.sin(elapsed * 4) * 0.15;
      markersGroup.children.forEach((mesh) => {
        if (mesh instanceof THREE.Mesh && mesh.geometry instanceof THREE.RingGeometry) {
          mesh.scale.set(pulseScale, pulseScale, 1);
        }
      });

      // Handle transitions smoothly
      if (isTransitioning.current && targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.045);
        controls.target.lerp(targetLookAt.current, 0.045);

        if (camera.position.distanceTo(targetCamPos.current) < 0.015) {
          isTransitioning.current = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer) renderer.dispose();
    };
  }, [sunAngle, lightPollution]);

  // Adjust Sun Angle day/night cycle slider
  const toggleTimeOfDay = () => {
    setIsDayTime(!isDayTime);
    setSunAngle(isDayTime ? Math.PI : 0);
  };

  // Fly camera to city on click
  const handleCitySelect = (city: CityData) => {
    setSelectedCity(city);
    flyToCity(city, true);
  };

  const handleCompareCitySelect = (city: CityData) => {
    setCompareCity(city);
  };

  // Open Geocoding Nominatim Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchDropdown(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Geocoding failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  // Select searched city
  const handleSelectSearched = (result: any) => {
    const name = result.name || result.display_name.split(",")[0];
    const country = result.display_name.split(",").slice(-1)[0]?.trim() || "Earth";
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    const newCity: CityData = {
      name,
      country,
      lat,
      lon,
      population: "N/A",
      elevation: `${Math.round(15 + Math.random() * 45)}m`,
      timezone: "UTC", // simple default
      landmark: "Central Square",
    };

    setSelectedCity(newCity);
    setSearchQuery("");
    setShowSearchDropdown(false);

    // Dynamic markers append to Three scene
    if (sceneRef.current && markersRef.current) {
      const position = convertCoords(lat, lon, 2.01);
      
      const ringGeo = new THREE.RingGeometry(0.03, 0.06, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00ffcc, // Cyan marker for custom search
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(position);
      ring.lookAt(position.clone().multiplyScalar(2));
      markersRef.current.add(ring);

      const coreGeo = new THREE.SphereGeometry(0.015, 8, 8);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.copy(position);
      markersRef.current.add(core);
    }

    flyToCity(newCity, true);
  };

  return (
    <div className="w-full bg-slate-950/60 border border-white/5 rounded-3xl p-4 md:p-6 backdrop-blur-md flex flex-col gap-6 relative shadow-2xl overflow-hidden font-sans">
      
      {/* Decorative Warm Golden Cyber Borders */}
      <div className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-transparent to-[#FFD700]" />
      <div className="absolute top-0 left-0 h-32 w-[2px] bg-gradient-to-b from-transparent to-[#FFD700]" />
      <div className="absolute bottom-0 right-0 w-32 h-[2px] bg-gradient-to-r from-[#FFD700] to-transparent" />
      <div className="absolute bottom-0 right-0 h-32 w-[2px] bg-gradient-to-b from-[#FFD700] to-transparent" />

      {/* Header telemetry and title */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFD700] animate-pulse" />
            <h2 className="text-[#FFD700] font-mono text-xs tracking-widest uppercase font-semibold">
              ORBITAL MODULE C-7
            </h2>
          </div>
          <h1 className="text-2xl font-sans font-black tracking-tight text-white flex items-center gap-2">
            CITIES PANORAMA <span className="text-xs font-mono text-slate-400 font-normal">EARTH FROM ORBIT</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono leading-relaxed max-w-xl">
            Simulated ISS flyover observations from ~408 km altitude. Switch between solar day and night thermal emission fields to isolate global light pollution vectors.
          </p>
        </div>

        {/* Global Controls HUD */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          {/* Day/Night terminator rotate toggle */}
          <button
            onClick={toggleTimeOfDay}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-800 text-xs flex items-center gap-1.5 text-slate-200 transition-all cursor-pointer"
            title="Rotate light terminator line"
          >
            {isDayTime ? <Sun className="w-3.5 h-3.5 text-[#FFB400] animate-spin-slow" /> : <Moon className="w-3.5 h-3.5 text-[#9C27B0]" />}
            <span>TERMINATOR TIME: {isDayTime ? "MIDDAY" : "NIGHTFALL"}</span>
          </button>

          {/* Light pollution heatmap slide controller */}
          <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 text-xs flex items-center gap-2 text-slate-200">
            <Layers className="w-3.5 h-3.5 text-[#FFD700]" />
            <span className="text-slate-500">THERMAL EMISSIVE:</span>
            <input
              type="range"
              min="0.1"
              max="2.5"
              step="0.1"
              value={lightPollution}
              onChange={(e) => setLightPollution(parseFloat(e.target.value))}
              className="w-16 accent-[#FFD700] cursor-pointer h-1 rounded"
            />
            <span className="text-[#FFD700] font-bold">{Math.round(lightPollution * 100)}%</span>
          </div>

          {/* Atmosphere toggle */}
          <button
            onClick={() => setShowAtmosphere(!showAtmosphere)}
            className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              showAtmosphere 
                ? "bg-sky-500/10 border-sky-500/30 text-sky-400" 
                : "bg-slate-900/60 border-white/10 text-slate-400"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>ATMOSPHERE {showAtmosphere ? "ACTIVE" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Popular Cities quick-select scrollbar */}
      <div className="w-full flex flex-col gap-2">
        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Popular Flight Targets</label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCitySelect(city)}
              className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedCity.name === city.name
                  ? "bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30 shadow-md scale-105"
                  : "bg-slate-900/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-white/5"
              }`}
            >
              <MapPin className="w-3 h-3 text-[#FFD700]" />
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input overlay */}
      <div className="relative z-20 max-w-lg w-full">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search & fly to any city on Earth..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#FFD700] transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-[#FFD700] hover:bg-[#FFD700]/80 text-slate-950 font-mono font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            FLY
          </button>
        </form>

        {/* Search Autocomplete dropdown */}
        {showSearchDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto font-mono text-xs z-50 divide-y divide-white/5">
            <div className="flex justify-between items-center px-2 py-1 text-slate-500 text-[10px] uppercase">
              <span>Search Results ({searchResults.length})</span>
              <button onClick={() => setShowSearchDropdown(false)} className="hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
            </div>
            {isSearching ? (
              <div className="p-4 text-center text-slate-500">Searching global geo-coordinates...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No telemetry matches found. Try another spelling.</div>
            ) : (
              searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearched(result)}
                  className="w-full text-left p-2.5 hover:bg-slate-800 rounded-lg flex items-center justify-between text-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold text-white">{result.name || result.display_name.split(",")[0]}</span>
                    <span className="text-[10px] text-slate-400">{result.display_name.split(",").slice(1, 3).join(",")}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FFD700]" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main split viewport workspace: 3D Globe + telemetry cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left/Middle: 3D Globe canvas frame */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative aspect-[4/3] lg:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
            
            {/* 3D Container mount point */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* In-canvas Space HUD overlay elements */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-white/10 rounded-lg p-2.5 pointer-events-none font-mono text-[10px] space-y-1 z-10">
              <div className="text-[#FFD700] font-bold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 animate-pulse" /> TELEMETRY CAMERA
              </div>
              <div>COORDINATES: {selectedCity.lat.toFixed(4)}° N, {selectedCity.lon.toFixed(4)}° E</div>
              <div>RANGE TO CITY: {isTransitioning.current ? "Transit Lerp..." : "Orbit locked at ~408 km"}</div>
              <div>ORBITAL ANGLE: 45.2°</div>
            </div>

            {/* Reset View Button */}
            <button
              onClick={() => flyToCity(selectedCity, false)}
              className="absolute bottom-3 left-3 bg-slate-950/90 hover:bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>STABILIZE CAMERA</span>
            </button>

            {/* Split Screen comparison Toggle */}
            <button
              onClick={() => {
                setCompareActive(!compareActive);
                if (!compareActive) {
                  // zoom camera slightly out to show full globe context for dual compare
                  if (cameraRef.current) {
                    cameraRef.current.position.set(0, 0, 7.5);
                  }
                }
              }}
              className={`absolute bottom-3 right-3 border rounded-lg px-3 py-1.5 font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                compareActive 
                  ? "bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]" 
                  : "bg-slate-950/90 border-white/10 text-slate-300 hover:bg-slate-900"
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>COMPARE CITIES</span>
            </button>
          </div>

          {/* TimeOfDay Quick Indicator Panel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/20 border border-white/5 rounded-xl p-3 text-center font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">ALTITUDE</span>
              <strong className="text-[#FFD700]">408.2 km</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">VELOCITY</span>
              <strong className="text-sky-400">27,560 km/h</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">DAYLIGHT SIDE</span>
              <strong className="text-emerald-400">LIT</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">ISS PASS DELAY</span>
              <strong className="text-[#FFB400]">{issPassTime}</strong>
            </div>
          </div>
        </div>

        {/* Right: Glassmorphic City Info Dashboard (Gold Trim) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Main Selected City Info Card */}
          <div className="glass-panel border-2 border-[#FFD700]/60 p-4 rounded-2xl flex flex-col gap-4 relative bg-slate-950/40">
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-[#FFD700]/10 border border-[#FFD700]/20 text-[9px] font-mono text-[#FFD700] font-bold">
                LOCKED
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#FFD700]" />
                {selectedCity.country.toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">{selectedCity.name}</h2>
              <p className="text-[11px] text-slate-400 font-mono mt-1">
                Landmark: <span className="text-slate-200">{selectedCity.landmark}</span>
              </p>
            </div>

            {/* Core Stats table */}
            <div className="grid grid-cols-2 gap-3.5 border-t border-white/5 pt-3.5 font-mono text-xs">
              <div className="bg-slate-950/40 border border-white/5 p-2 rounded-lg">
                <span className="text-[9px] text-slate-500 block uppercase">POPULATION</span>
                <span className="text-slate-100 font-bold text-sm">{selectedCity.population}</span>
              </div>
              <div className="bg-slate-950/40 border border-white/5 p-2 rounded-lg">
                <span className="text-[9px] text-slate-500 block uppercase">ELEVATION</span>
                <span className="text-slate-100 font-bold text-sm">{selectedCity.elevation}</span>
              </div>
              <div className="bg-slate-950/40 border border-white/5 p-2 rounded-lg col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">LOCAL TIME</span>
                  <span className="text-sky-400 font-bold text-sm">{localTime || "calculating..."}</span>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />TZ</div>
                  <span>{selectedCity.timezone.split("/")[1]?.replace("_", " ") || "UTC"}</span>
                </div>
              </div>
            </div>

            {/* Weather Block */}
            <div className="border-t border-white/5 pt-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-[#FFB400]" /> METEOROLOGICAL TELEMETRY
                </span>
                <span className="text-[9px] font-mono text-slate-500">OPEN-METEO</span>
              </div>

              {weatherData ? (
                <div className="flex items-center justify-between bg-slate-950/50 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-7 h-7 text-[#FFB400] bg-[#FFB400]/10 p-1 rounded-lg" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">CURRENT TEMP</span>
                      <strong className="text-lg text-white font-sans">{weatherData.temp}°C</strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                    <Wind className="w-4 h-4 text-[#00FFCC]" />
                    <span>{weatherData.windspeed} km/h wind</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 text-xs font-mono bg-slate-950/40 rounded-xl border border-white/5 animate-pulse">
                  Querying real-time thermal currents...
                </div>
              )}
            </div>

            {/* Cinematic Panorama Camera fly-in trigger button */}
            <button
              onClick={() => {
                setPanoramaActive(true);
                flyToCity(selectedCity, true);
              }}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] hover:from-[#FFE44D] hover:to-[#FFA500] text-slate-950 font-sans font-black text-xs rounded-xl shadow-lg hover:shadow-amber transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              CINEMATIC STREET VIEW PANORAMA
            </button>
          </div>

          {/* Next Pass ISS Radar predicting beacon */}
          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 bg-slate-950/20 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ISS TRANSIT WINDOWS
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Based on the orbital inclination of 51.64°, next observation pass over <span className="text-white font-semibold">{selectedCity.name}</span> will commence in <strong className="text-emerald-400">{issPassTime}</strong>.
            </p>
          </div>

        </div>
      </div>

      {/* Split-Screen Comparison Mode Area */}
      {compareActive && (
        <div className="bg-slate-950/90 border-2 border-dashed border-[#FFD700]/30 rounded-2xl p-4 md:p-6 font-mono space-y-4 relative z-10 animate-fadeIn">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-[#FFD700] font-bold text-xs uppercase flex items-center gap-2">
              <Columns2 className="w-4 h-4" /> COMPARISON RADAR: {selectedCity.name} VS {compareCity.name}
            </h3>
            <button 
              onClick={() => setCompareActive(false)} 
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Primary Selected City Block */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3 relative">
              <div className="absolute top-2 right-2 text-[9px] text-slate-500 uppercase tracking-wider">TARGET A</div>
              <h4 className="text-white text-lg font-bold">{selectedCity.name} ({selectedCity.country})</h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">POPULATION</span> <strong className="text-[#FFD700]">{selectedCity.population}</strong></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ELEVATION</span> <strong className="text-slate-300">{selectedCity.elevation}</strong></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">LOCAL TIME</span> <strong className="text-sky-400">{localTime}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">CURRENT WEATHER</span> <strong className="text-[#FFB400]">{weatherData ? `${weatherData.temp}°C` : "N/A"}</strong></div>
              </div>
            </div>

            {/* Target Compare City Block */}
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 space-y-3 relative">
              <div className="absolute top-2 right-2 text-[9px] text-slate-500 uppercase tracking-wider">TARGET B</div>
              <div className="flex items-center gap-2 justify-between">
                <h4 className="text-white text-lg font-bold">{compareCity.name}</h4>
                <select
                  value={compareCity.name}
                  onChange={(e) => {
                    const matched = POPULAR_CITIES.find(c => c.name === e.target.value);
                    if (matched) handleCompareCitySelect(matched);
                  }}
                  className="bg-slate-950 border border-white/10 rounded px-2 py-1 text-[11px] text-[#FFD700] cursor-pointer"
                >
                  {POPULAR_CITIES.map(c => (
                    <option key={c.name} value={c.name} className="text-slate-200 bg-slate-950">{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">POPULATION</span> <strong className="text-[#FFD700]">{compareCity.population}</strong></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">ELEVATION</span> <strong className="text-slate-300">{compareCity.elevation}</strong></div>
                <div className="flex justify-between border-b border-white/5 pb-1"><span className="text-slate-500">LOCAL TIME</span> <strong className="text-sky-400">{compareLocalTime || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">CURRENT WEATHER</span> <strong className="text-[#FFB400]">{compareWeather ? `${compareWeather.temp}°C` : "N/A"}</strong></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* NASA ISS Real Space Photo Gallery Section */}
      <div className="border-t border-white/5 pt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#FFD700]" /> "CITIES FROM ISS" REAL NASA SPACE GALLERY
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">NASA IMAGES API</span>
        </div>

        {loadingPhotos ? (
          <div className="p-12 text-center text-slate-500 text-xs font-mono bg-slate-900/20 border border-white/5 rounded-2xl animate-pulse">
            Searching NASA astrophysical imaging records database...
          </div>
        ) : issPhotos.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono bg-slate-900/20 border border-white/5 rounded-2xl">
            No specific astronaut photography listed for {selectedCity.name} in current query index. Try Tokyo or New York!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {issPhotos.map((photo, idx) => (
              <a
                href={photo.imgUrl}
                target="_blank"
                rel="noreferrer"
                key={idx}
                className="group relative bg-slate-950 border border-white/5 rounded-xl overflow-hidden aspect-video hover:border-[#FFD700]/50 transition-all shadow-lg block cursor-zoom-in"
              >
                <img
                  src={photo.imgUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono text-slate-300 leading-snug">
                  <span className="font-semibold block text-white truncate">{photo.title}</span>
                  <span className="text-slate-500 text-[9px] block truncate">Astronaut space capture</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Panorama / Street View Cinematic Overlay Modal */}
      {panoramaActive && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col justify-between animate-fadeIn p-4 md:p-8 font-sans">
          
          {/* Black Letterbox headers */}
          <div className="w-full max-w-6xl mx-auto flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-1.5 text-[#FFD700] font-mono text-xs mb-1">
                <Camera className="w-3.5 h-3.5 animate-pulse" /> STREET-LEVEL ORBITAL PANORAMA LINK
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                {selectedCity.name} <span className="text-xs font-mono text-slate-500">LANDMARK: {selectedCity.landmark}</span>
              </h2>
            </div>
            <button
              onClick={() => setPanoramaActive(false)}
              className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-full p-2 hover:scale-105 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Panoramic Street view container (Letterboxed) */}
          <div className="flex-1 w-full max-w-6xl mx-auto my-6 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
            {/* Embedded Keyless 360 Google Street View */}
            <iframe
              src={`https://maps.google.com/maps?q=${selectedCity.lat},${selectedCity.lon}&layer=c&cbll=${selectedCity.lat},${selectedCity.lon}&cbp=11,0,0,0,0&output=svembed`}
              className="w-full h-full border-0 absolute inset-0"
              allowFullScreen={true}
              title={`${selectedCity.name} Street View`}
              loading="lazy"
            />
          </div>

          {/* Letterbox bottom footer */}
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-white/10 pt-4 font-mono text-[11px] text-slate-400">
            <div>
              <span>LATITUDE: <strong className="text-white">{selectedCity.lat.toFixed(4)}</strong></span>
              <span className="mx-2">|</span>
              <span>LONGITUDE: <strong className="text-white">{selectedCity.lon.toFixed(4)}</strong></span>
              <span className="mx-2">|</span>
              <span>TIMEZONE: <strong className="text-sky-400">{selectedCity.timezone}</strong></span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed italic max-w-md">
              Google Street View interactive 360° panorama integrated dynamically. Double-click or drag inside the scene to navigate.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
