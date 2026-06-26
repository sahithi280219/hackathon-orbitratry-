Orbitary

*Orbitary* is an interactive 3D orbital monitoring HUD — a sci-fi-styled command console for exploring a simulated cosmic environment. Built with Three.js for real-time 3D rendering and Google's Gemini API for dynamic, AI-generated object lore, it blends a heads-up-display aesthetic with generative storytelling.

> 🔗 *Live demo:* [orbitra-384109452792.asia-southeast1.run.app](https://orbitra-384109452792.asia-southeast1.run.app/)

---

## Overview

Orbitary renders a simulated orbital scene — satellites, celestial bodies, or space objects — inside an interactive 3D viewport designed to look and feel like a monitoring system HUD. Users can freely navigate the scene (rotate, zoom, pan) and click on individual objects to trigger an AI-generated description or backstory for that object, powered by Gemini.

This is a simulated environment built for visual and interactive exploration — it does not pull live satellite or astronomical data.

## Features

- *Interactive 3D orbital scene* — Rotate, zoom, and pan through a simulated space environment in real time, powered by Three.js.
- *Clickable objects* — Select any object in the scene to focus on it.
- *AI-generated lore* — Clicking an object sends a request to the Gemini API, which generates a unique description/backstory for that object on the fly.
- *HUD-style interface* — A heads-up-display aesthetic (overlays, panels, sci-fi UI elements) built with React, Tailwind CSS, and Framer Motion for smooth animated transitions.
- *Full-stack architecture* — An Express backend handles Gemini API requests server-side, keeping the API key off the client.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| 3D Rendering | Three.js |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express, tsx |
| AI | Google Gemini API (@google/genai) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

1. *Clone the repository*
   bash
   git clone https://github.com/sahithi280219/orbitary.git
   cd orbitary
   

2. *Install dependencies*
   bash
   npm install
   

3. *Configure environment variables*

   Copy the example env file and add your Gemini API key:
   bash
   cp .env.example .env.local
   
   Then open .env.local and set:
   
   GEMINI_API_KEY=your_api_key_here
   

4. *Run the development server*
   bash
   npm run dev
   

   The app will be available at http://localhost:5173 (or whichever port Vite assigns).

### Build for Production

bash
npm run build
npm run start


- npm run build compiles the frontend (Vite) and bundles the backend server with esbuild.
- npm run start runs the production server from dist/server.cjs.

### Other Scripts

| Command | Description |
|---|---|
| npm run lint | Type-checks the project with tsc --noEmit |
| npm run clean | Removes build artifacts (dist/, server.js) |

## Project Structure


orbitary/
├── index.html          # App entry point
├── server.ts           # Express server (handles Gemini API requests)
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json
├── .env.example         # Template for required environment variables
└── ...                  # React components, 3D scene logic, HUD UI


## How It Works

1. The frontend renders a 3D orbital scene using Three.js, wrapped in a React + Tailwind HUD interface.
2. When a user clicks an object in the scene, the frontend sends a request to the Express backend.
3. The backend calls the Gemini API with a prompt describing the selected object and returns the generated lore/description.
4. The HUD displays the AI-generated text in an overlay panel, styled to match the monitoring-system theme.

This separation keeps the Gemini API key secure on the server side rather than exposing it in client-side code.
