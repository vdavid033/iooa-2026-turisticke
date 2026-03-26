
<p align="center">
  <img src="./turisticke/public/gif.gif" alt="Turisticke atrakcije Logo" width="260" />
</p>

<h1 align="center">Turisticke atrakcije</h1>

<p align="center">
  A full-stack web application for exploring and managing tourist attractions.
</p>

<br>

<p align="center">
  Armin Lišić &nbsp;&nbsp;·&nbsp;&nbsp; Ivan Gržetić
</p>

---

## Overview

Turisticke atrakcije is a full-stack application designed for managing and exploring tourist destinations.

The system combines a modern frontend built with Quasar and Vue, and a backend powered by Node.js, Express, and MySQL.  
Users can browse attractions, view detailed information, leave comments, rate content, and interact with the platform based on their roles.

---

## Stack

<table align="center">
  <tr>
    <td valign="top" width="50%">

<strong>Frontend</strong>

- Quasar Framework  
- Vue.js  
- Axios  
- CSS  

    </td>
    <td valign="top" width="50%">

<strong>Backend</strong>

- Node.js  
- Express.js  
- MySQL  
- JWT authentication  
- bcryptjs  

    </td>
  </tr>
</table>

---

## Architecture

<table align="center">
  <tr>
    <td><strong>Type</strong></td>
    <td>Full-stack web application</td>
  </tr>
  <tr>
    <td><strong>Client</strong></td>
    <td>Quasar / Vue</td>
  </tr>
  <tr>
    <td><strong>Server</strong></td>
    <td>Node.js / Express</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>MySQL</td>
  </tr>
  <tr>
    <td><strong>Auth</strong></td>
    <td>JWT</td>
  </tr>
</table>

---

## Project Structure

```text
Turisticke_atrakcije-main/
├── backend/        # API and server logic
├── public/         # Static assets
├── src/            # Frontend source (Quasar / Vue)
├── package.json    # Frontend dependencies
└── README.md
````

---

## Run

### Backend

```bash
cd backend
node index.js
```

### Frontend

```bash
npx quasar dev
```