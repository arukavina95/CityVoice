# CityVoice: Empowering Citizens Through Local Issue Reporting

## Project Overview

**CityVoice** is a modern, full-stack web application designed to foster stronger community engagement and streamline communication between citizens and local government. It provides an intuitive platform for residents to easily report and track municipal issues, ranging from damaged infrastructure and public lighting faults to illegal waste disposal and other common urban problems. By centralizing issue reporting and management, CityVoice aims to enhance transparency, improve response times, and ultimately contribute to a more efficient and responsive local administration.

The application implements a robust role-based access control system, ensuring that different user types (Citizens, Officials, Administrators) have appropriate permissions for interacting with and managing reported issues.

---

## Key Features

### Citizen-Facing Functionality:
* **Intuitive Issue Reporting:** Citizens can submit new issues with a clear title, a detailed description, precise geographical coordinates (latitude and longitude), and an optional photographic attachment to provide visual context.
* **Real-time Status Tracking:** Each reported issue is assigned a status (e.g., "New," "In Progress," "Resolved," "Rejected") which is dynamically updated by authorized personnel, allowing citizens to monitor progress transparently.
* **Comprehensive Issue Feed:** A searchable and filterable list displays all publicly available reported problems, enabling citizens to see what issues have been reported in their area or across the city.
* **Filtering and Search:** Advanced filtering options allow users to narrow down issues by status, type of problem, and potentially location (e.g., proximity or specific areas).

### Administrative & Official Functionality:
* **Issue Management Dashboard:** Officials and Administrators have dedicated views to efficiently manage incoming reports.
* **Status Updates & Notes:** Authorized users can update the status of an issue and add internal notes for better communication and record-keeping.
* **Role-Based Access Control (RBAC):**
    * **Citizen:** Can report new issues and view the status and details of all public issues.
    * **Official:** Can view all issues, update their status, and add internal notes.
    * **Administrator:** Possesses full control over all aspects of the application, including issue management, user management, and system configurations.

### Core System Features:
* **Secure Authentication & Authorization:** Implemented using JWT (JSON Web Tokens) for secure user login and API access, ensuring that only authenticated and authorized users can perform specific actions.
* **Geospatial Data Handling:** Utilizes spatial data types to accurately store and display problem locations.
* **Cross-Origin Resource Sharing (CORS):** Properly configured to enable secure communication between the separate frontend and backend applications.

---

## Technical Stack

### Backend (API)
The backend is a robust and scalable RESTful API built on the .NET platform, designed to serve data to the frontend application and handle all business logic.

* **Framework:** ASP.NET Core (.NET 8) - A high-performance, cross-platform framework for building modern, cloud-enabled, internet-connected applications.
* **Object-Relational Mapper (ORM):** Entity Framework Core - Facilitates seamless interaction with the PostgreSQL database.
* **Database:** PostgreSQL - A powerful, open-source object-relational database system known for its reliability, feature robustness, and performance.
* **Geospatial Capabilities:** NetTopologySuite - An API for working with geospatial data, enabling the storage and manipulation of latitude and longitude coordinates for issue locations.
* **Authentication:** JWT (JSON Web Token) Bearer Authentication - For secure, stateless user authentication.
* **Dependency Injection:** Built-in ASP.NET Core DI container for managing service dependencies and promoting modularity.
* **API Documentation:** Swagger/OpenAPI - Provides interactive API documentation for easy testing and understanding of endpoints.

### Frontend (Web Application)
The frontend delivers a responsive and user-friendly experience, built with modern JavaScript technologies.

* **Library:** React - A declarative, component-based JavaScript library for building dynamic user interfaces.
* **Build Tool:** Vite - A fast and opinionated build tool that significantly improves the development experience for modern web projects.
* **Language:** TypeScript - A strongly typed superset of JavaScript that enhances code quality, maintainability, and developer productivity.
* **Styling:** Tailwind CSS - A utility-first CSS framework that allows for rapid UI development and highly customizable designs directly within the HTML.
* **HTTP Client:** Axios - A promise-based HTTP client for making API requests from the browser.
* **Routing:** React Router DOM - For declarative routing within the single-page application.

---

## Getting Started Locally

To run CityVoice on your local machine for development or testing, follow these steps:

### Prerequisites

Ensure you have the following installed on your system:
* [.NET SDK 8.0](https://dotnet.microsoft.com/download/dotnet/8.0) or newer
* [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
* [npm](https://www.npmjs.com/get-npm) or [Yarn](https://yarnpkg.com/)
* [PostgreSQL](https://www.postgresql.org/download/) database server
* An IDE like Visual Studio (for backend) or VS Code (for both)
* Git

### Installation Steps

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/arukavina95/CityVoice-App.git](https://github.com/arukavina95/CityVoice-App.git) # 
    cd CityVoice-App
    ```

2.  **Backend (API) Setup:**
    * Navigate to the API project directory:
        ```bash
        cd backend/CityVoice.Api
        ```
    * **Database Configuration:**
        * Create a new PostgreSQL database (e.g., `cityvoice_db`).
        * Update the `ConnectionStrings:DefaultConnection` in `appsettings.Development.json` (or `appsettings.json`) with your PostgreSQL connection string. Example:
            ```json
            "ConnectionStrings": {
              "DefaultConnection": "Host=localhost;Port=5432;Database=cityvoice_db;Username=postgres;Password=your_password"
            }
            ```
        * Apply Entity Framework Core migrations to create the database schema:
            ```bash
            dotnet ef database update
            ```
            *(If `dotnet ef` command is not found, install the EF Core CLI tools: `dotnet tool install --global dotnet dotnet-ef`)*
    * **JWT Settings:**
        * In `appsettings.Development.json`, add an `AppSettings` section for JWT token configuration:
            ```json
            "AppSettings": {
              "Token": "YOUR_VERY_SECRET_AND_LONG_JWT_KEY_HERE_MIN_16_OR_32_BYTES", 
              "Issuer": "CityVoiceAPI",
              "Audience": "CityVoiceFrontend"
            }
            ```
    * **Run the Backend:**
        ```bash
        dotnet run
        ```
        The API will typically run on `http://localhost:5088` (or `https://localhost:7279`). The Swagger UI will be accessible at `/swagger`.

3.  **Frontend (React) Setup:**
    * Navigate back to the `frontend/` directory:
        ```bash
        cd ../../frontend
        ```
    * **Install Dependencies:**
        ```bash
        npm install  # or yarn install
        ```
    * **Configure API URL:**
        * Create a `.env.development` file in the root of the `frontend/` folder.
        * Add the line pointing to your local backend API:
            ```
            VITE_API_BASE_URL=http://localhost:5088/api
            ```
    * **Run the Frontend:**
        ```bash
        npm run dev  # or yarn dev
        ```
        The application will typically run on `http://localhost:5173`.

You should now have the entire CityVoice application running locally!

---

## Deployment

CityVoice is structured for straightforward deployment:
* **Frontend (React):** Can be easily deployed to static site hosting services like [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/) after running `npm run build`.
* **Backend (ASP.NET Core API):** Suitable for deployment on Platform as a Service (PaaS) providers that support .NET Core applications, such as [Render.com](https://render.com/) or [Microsoft Azure App Service](https://azure.microsoft.com/en-us/products/app-service/).

Refer to the documentation of your chosen hosting providers for detailed instructions on connecting your GitHub repositories and configuring production environment variables (e.g., database connection strings, JWT secrets, and CORS policies).

---

## Contributing

We welcome contributions to the CityVoice project! If you have ideas for new features, improvements, or bug fixes, please open an issue first to discuss your proposed changes before submitting a pull request.

---

## License

This project is licensed under the **[YOUR_CHOSEN_LICENSE_NAME]** License.

*(Example: MIT License. You should add a `LICENSE` file in the root of this repository containing the full text of your chosen license.)*

---