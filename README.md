# SIH Health Ease

Health Ease is a refined frontend prototype for a connected healthcare experience.

## Project Status

This project is currently half/semi completed.

The project now includes:

- Role-based signup and login (patient and hospital)
- Session guard for protected pages
- Dashboard with connected usage summaries
- Personal profile management
- Patient history tracking
- Hospital finder
- Ambulance booking workflow
- Basic health chatbot
- Health tips and user query tracking

## Current Tech

- HTML5
- CSS3
- Vanilla JavaScript
- LocalStorage for simulated authentication and data persistence

## Note About Authentication

Authentication in this version is frontend-only and uses localStorage.
It is suitable for demo/prototype use only.
For production, move auth, data validation, and storage to a backend API and database.

## Project Structure

- index.html: Redirects to login page
- login2.html: Login interface
- signup.html: Registration interface
- fumod.html: Dashboard
- personalmod.html: Personal details module
- patienthistmod.html: Patient history module
- hospital.html: Hospital finder module
- ambulancebooking.html: Ambulance request module
- chatbot.html: Health chatbot module
- healthtips.html: Health tips and query module
- styles.css: Shared design system
- app.js: Shared application logic (auth + storage + module scripts)

## Demo Data Behavior

Each registered user has isolated local records:

- Profile: he_profile_<username>
- History: he_history_<username>
- Ambulance requests: he_ambulance_<username>
- Queries: he_queries_<username>
- Chat messages: he_chat_<username>

Users list and active session:

- Users: he_users
- Session: he_session

## How To Run Locally

### Option 1: Python static server

1. Open terminal in project folder.
2. Run:

   python -m http.server 8080

3. Open browser:

   http://localhost:8080/

### Option 2: VS Code Live Server

1. Open folder in VS Code.
2. Start Live Server on index.html.

## Suggested Next Backend Phase

- Replace localStorage auth with secure JWT-based backend auth
- Add password hashing and user verification
- Persist records in PostgreSQL or MongoDB
- Add doctor interface with queue management
- Integrate maps and emergency geolocation APIs
- Integrate real chatbot backend endpoint

## Disclaimer

This prototype provides informational workflows only and is not a medical diagnosis system.
For emergencies, contact local emergency services immediately.
