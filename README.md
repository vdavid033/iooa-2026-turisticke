<p align="center">
  <img src="./turisticke/public/gif.gif" width="260" alt="Tourist Attractions"/>
</p>

<h1 align="center">Tourist Attractions</h1>

<p align="center">
Full-stack web application for discovering, managing and interacting with tourist attractions, with AI chatbot integration.
</p>

<p align="center">
Armin Lišić · Ivan Gržetić
</p>

---

## Overview

Tourist Attractions is a full-stack application built with a separated frontend and backend architecture.

It provides:

- user authentication
- tourist attraction management
- comments and ratings
- image uploads
- map-based interaction
- AI chatbot powered by Ollama

The system combines Vue + Quasar on the frontend with Node.js, Express and MySQL on the backend.

---

## Technology Stack

| Frontend | Backend | AI / Development |
|:--------:|:-------:|:----------------:|
| Vue 3 | Node.js | Ollama |
| Quasar | Express | SSE Streaming |
| Vue Router | MySQL | Nodemon |
| Axios | JWT | ESLint |
| Leaflet | bcryptjs | Prettier |
| Markdown-it | Multer | Vite |
| Image Compression | CORS | Git |

---

## Features

- User registration and login
- Role-based authorization
- Add tourist attractions
- Delete attractions
- View personal attractions
- Comments
- Ratings
- Map location selection
- Image uploads
- Markdown support
- AI chatbot
- Streaming responses

---

## Project Structure

```text
iooa-2026-turisticke-team_nexora/

├── backend/
│   ├── index.js
│   └── package.json

└── turisticke/
    ├── src/
    ├── public/
    └── package.json
```

---

# Requirements

Install:

- Node.js 18+
- npm
- MySQL Server
- Quasar CLI
- Ollama (optional for chatbot)

Check versions:

```bash
node -v
npm -v
mysql --version
quasar -v
```

---

# Installation

Clone repository:

```bash
git clone <repository-url>
cd iooa-2026-turisticke-team_nexora
```

Install backend packages:

```bash
cd backend
npm install
```

Install frontend packages:

```bash
cd ../turisticke
npm install
```

Install Quasar CLI globally:

```bash
npm install -g @quasar/cli
```

---

## Install Ollama (Optional for AI Chatbot)

Download and install Ollama from the official website:

https://ollama.com/download

Verify installation:

```bash
ollama --version
```

Pull a model (example):

```bash
ollama pull llama3
```

Note:

The chatbot feature requires both:
- Ollama installed and running
- a downloaded model (for example llama3)

---

---

# Database

Create MySQL database:

```sql
CREATE DATABASE turisticke;
```

Configure connection inside backend.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=turisticke
```

---

# Running the Project

## Start backend

```bash
cd backend
node index.js
```

---

## Start frontend

```bash
cd turisticke
npx quasar dev
```

---

## Start Ollama (optional)

```bash
ollama serve
```

Pull model if needed:

```bash
ollama pull llama3
```

---

# Start Order

Recommended order:

1. MySQL
2. Ollama
3. Backend
4. Frontend

---

# Main Dependencies

## Backend

```bash
express
mysql
jsonwebtoken
bcryptjs
multer
cors
axios
body-parser
```

## Frontend

```bash
vue
quasar
vue-router
axios
leaflet
markdown-it
browser-image-compression
```

---

# Troubleshooting

## Missing modules

```bash
npm install
```

---

## Quasar not recognized

```bash
npm install -g @quasar/cli
```

---

## MySQL connection error

Check:

- DB credentials
- database exists
- MySQL service running

---

## Chatbot not responding

Check:

```bash
ollama serve
```

---

# Useful Commands

List installed dependencies:

```bash
npm list --depth=0
```

Check Quasar info:

```bash
quasar info
```

Lint frontend:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

---

# Authors

**Armin Lišić**  
**Ivan Gržetić**