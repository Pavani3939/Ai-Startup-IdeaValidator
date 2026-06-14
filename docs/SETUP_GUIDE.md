# Setup Guide

Follow these steps to run the AI Startup Idea Validator locally.

## Prerequisites
1. Java 17+ installed.
2. Maven installed.
3. MySQL 8 installed and running.
4. Google Gemini API Key. (Get one from Google AI Studio).

## 1. Database Setup
1. Log into your MySQL server.
2. Run the SQL script located at `database/schema.sql` to create the database and tables.
3. Update `backend/src/main/resources/application.yml` with your MySQL username and password.

## 2. Environment Variables
You need to set your Gemini API key. You can either set it as a system environment variable or replace the placeholder in `application.yml`.

Windows:
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
```
Mac/Linux:
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

## 3. Running the Backend
1. Open a terminal in the `backend` folder.
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

## 4. Running the Frontend
The frontend uses plain HTML, CSS, and JS. You can serve it using a live server extension in VS Code or any simple HTTP server.
Alternatively, simply open `frontend/index.html` in your web browser (Note: CORS has been configured to allow `file://` execution as well, though using a local server like `Live Server` is recommended).
