# Shohroh Public Transport Application

This project is a web application for displaying public transport routes and stations. It includes an admin interface for managing this data.

## Project Structure

The project is divided into two main parts:

-   `shohroh-frontend/`: A React application created with Create React App. This is the user interface that people see in their browser. It displays the map, stations, and routes.
-   `shohroh-backend/`: A Node.js and Express server. This is the backend API that provides data to the frontend. It manages the database files (`stations.json`, `routes.json`, `admins.json`).

This separation is a standard and professional way to build web applications.

## How to Run the Application

To run the application, you need to start both the frontend and the backend servers simultaneously. You will need **two separate terminals** for this.

### Terminal 1: Start the Backend Server

1.  Open a new terminal.
2.  Navigate to the backend directory:
    ```bash
    cd shohroh-backend
    ```
3.  Install the dependencies (you only need to do this once):
    ```bash
    npm install
    ```
4.  Start the server:
    ```bash
    node index.js
    ```
    You should see a message: `Backend server is running on http://localhost:4000`. Leave this terminal running.

### Terminal 2: Start the Frontend Application

1.  Open a **second, new** terminal.
2.  Navigate to the frontend directory:
    ```bash
    cd shohroh-frontend
    ```
3.  Install the dependencies (you only need to do this once):
    ```bash
    npm install
    ```
4.  Start the frontend application:
    ```bash
    npm start
    ```
    This will automatically open the application in your web browser at `http://localhost:3000`.

## Admin Access

-   **Username:** `saycoko`
-   **Password:** `R6r25ey38t_` 