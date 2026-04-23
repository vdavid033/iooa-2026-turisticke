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

Tourist Attractions is a full-stack application built with separated frontend and backend architecture.

<p align="center">
User Authentication • Attractions Management • MySQL Database • Interactive Maps • AI Chatbot
</p>

---

## Technology Stack

| Frontend | Backend | AI / Development |
|:--------:|:-------:|:----------------:|
| Vue 3 | Node.js | Ollama |
| Quasar Framework | Express | SSE Streaming |
| Vue Router | MySQL | Nodemon |
| Axios | JWT Authentication | ESLint |
| Leaflet | bcryptjs | Prettier |
| Markdown-it | Multer | Vite |
| Image Compression | CORS | Git |

---

## Features

| Authentication | Attractions | AI / Interaction |
|:--------------:|:-----------:|:----------------:|
| User Login | Add Attractions | AI Chatbot |
| Registration | Delete Attractions | Streaming Responses |
| JWT Access | User Attractions | Markdown Support |
| Role Authorization | Comments | Map Integration |
| Session Tokens | Ratings | Image Upload |

---

## Project Structure

| Folder | Purpose |
|:------:|:--------|
| backend | Express API and database logic |
| turisticke | Vue + Quasar frontend |
| src | Application source |
| public | Static assets |

---

## Requirements

| Software | Required | Version |
|:--------:|:--------:|:-------:|
| Node.js | Yes | 18+ |
| npm | Yes | Latest |
| MySQL | Yes | Stable |
| Quasar CLI | Yes | Latest |
| Ollama | For chatbot | Latest |

Check versions:

```bash
node -v
npm -v
mysql --version
quasar -v
ollama --version
```

---

<details>
<summary><b>Installation Instructions</b></summary>

## Clone Repository

```bash
git clone <repository-url>
cd iooa-2026-turisticke-team_nexora
```

## Install Backend Dependencies

```bash
cd backend
npm install
```

## Install Frontend Dependencies

```bash
cd ../turisticke
npm install
```

## Install Quasar CLI

```bash
npm install -g @quasar/cli
```

## Install Ollama

Download and install:

https://ollama.com/download

Verify:

```bash
ollama --version
```

Pull model:

```bash
ollama pull llama3
```

Note:

The chatbot feature requires:

- Ollama installed
- Ollama running
- Downloaded model

</details>

---

<details>
<summary><b>Database Setup</b></summary>

Create database:

```sql
CREATE DATABASE turisticke;
```

Example connection:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=turisticke
```

Adjust according to your local setup.

</details>

---

## Running the Project

### Backend

```bash
cd backend
node index.js
```

---

### Frontend

```bash
cd turisticke
npx quasar dev
```

---

### Start Ollama (Optional)

```bash
ollama serve
```

If model is missing:

```bash
ollama pull llama3
```

---

## Start Order

| Step | Service | Command |
|:---:|:--------|:--------|
| 1 | MySQL | Start MySQL Server |
| 2 | Ollama | ollama serve |
| 3 | Backend | node index.js |
| 4 | Frontend | npx quasar dev |

---

## Main Dependencies

| Backend | Frontend |
|:-------:|:--------:|
| express | vue |
| mysql | quasar |
| jsonwebtoken | vue-router |
| bcryptjs | axios |
| multer | leaflet |
| cors | markdown-it |
| body-parser | browser-image-compression |

---

<details>
<summary><b>Troubleshooting</b></summary>

### Missing modules

```bash
npm install
```

---

### Quasar not recognized

```bash
npm install -g @quasar/cli
```

---

### MySQL connection problems

Check:

- Database credentials
- Database exists
- MySQL service is running

---

### Chatbot not responding

Check:

```bash
ollama serve
```

Verify model exists:

```bash
ollama list
```

</details>

---

<details>
<summary><b>Useful Commands</b></summary>

| Purpose | Command |
|:--------|:--------|
| Install packages | npm install |
| List dependencies | npm list --depth=0 |
| Run frontend | npx quasar dev |
| Run backend | node index.js |
| Run Ollama | ollama serve |
| Lint code | npm run lint |
| Format code | npm run format |
| Quasar info | quasar info |

</details>

---

## Authors

<p align="center">
<strong>Armin Lišić</strong><br>
Ivan Gržetić
</p>