
<p align="center">
  <img src="./turisticke/public/gif.gif" alt="Tourist Attractions Logo" width="260" />
</p>

<h1 align="center">Tourist Attractions</h1>

<p align="center">
  A full-stack web application for exploring, managing, and interacting with tourist attractions.
</p>

<br>

<p align="center">
  Armin Lišić · Ivan Gržetić
</p>

---

## Overview

Tourist Attractions is a full-stack web application designed to provide users with a centralized platform for discovering and managing tourist locations.

The application allows users to browse attractions, add their own entries, leave comments, rate content, and interact with the system based on their role. The system follows a clean separation between frontend and backend layers and uses JWT-based authentication.

An additional feature of the project is a locally running AI chatbot powered by Ollama, which uses database context and provides real-time streaming responses.

---

## Tech Stack

### Frontend

- Vue 3
- Quasar Framework
- Vue Router
- Axios
- Leaflet
- MarkdownIt

### Backend

- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcryptjs

### AI

- Ollama (local LLM)
- Streaming responses via SSE

---

## Architecture

The application follows a standard full-stack architecture:

- The frontend communicates with the backend via REST API calls
- The backend handles business logic and database operations
- MySQL is used for persistent data storage
- JWT is used for authentication and authorization
- The chatbot communicates through the backend, which acts as a proxy to the local Ollama API

---

## Features

- User registration and login
- JWT-based authentication and role handling
- Viewing all tourist attractions
- Viewing user-specific attractions
- Creating and deleting attractions
- Commenting system
- Rating system
- Map-based location selection using Leaflet
- Image upload stored as base64
- AI chatbot with real-time streaming responses
- Persistent chatbot history using localStorage

---

## Project Structure

```text
backend/        # Express server and API logic
turisticke/     # Quasar frontend application
````

---

## Running the Project

### Backend

```bash
cd backend
node index.js
```

### Frontend

```bash
cd turisticke
npx quasar dev
```

---

## Requirements

* Node.js installed
* MySQL database configured
* Quasar CLI (optional but recommended)
* Ollama installed and running locally

---

## Configuration Notes

* Backend runs on [http://localhost:4200](http://localhost:4200)
* Ollama runs on [http://localhost:11434](http://localhost:11434)
* JWT token is stored in localStorage
* Images are handled as base64 strings

Make sure both the backend and Ollama services are running before using the chatbot functionality.

---

## Notes

* The project uses a modular structure with clearly separated concerns
* Authentication is handled on both frontend and backend levels
* Some endpoints require JWT tokens while others are public
* The chatbot relies on database data to provide contextual answers

---

## Authors

Armin Lišić
Ivan Gržetić

```