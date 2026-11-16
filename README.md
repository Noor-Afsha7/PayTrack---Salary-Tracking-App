# PayTrack – Employee Payroll Management System

PayTrack is a full-stack Employee Payroll Management System designed to simplify employee management, salary calculations and payroll processing.

## Features

- **Dashboard:** Overview of employees and payroll statistics.
- **Employee Management:** Add, view, update and delete employee records.
- **Payroll Processing:** Generate monthly payroll records.
- **Salary Calculations:** Calculate gross salary, deductions and net salary.
- **Payslip Generation:** View and print individual employee payslips.
- **Authentication:** Secure login using JWT authentication.

## Tech Stack

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Maven

**Database**
- H2 Database

## Project Structure

```text
PayTrack/
├── Backend/
│   ├── src/
│   └── pom.xml
│
└── Frontend/
    ├── index.html
    ├── login.html
    ├── style.css
    ├── app.js
    └── vercel.json
```

## Getting Started

### Prerequisites
- Java 17 or later
- Maven
- Visual Studio Code
- Live Server extension

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/PayTrack-Employee-Payroll-System.git
```

### 2. Start the backend

```bash
cd PayTrack-Employee-Payroll-System/Backend
mvn spring-boot:run
```

Backend runs at:

`http://localhost:8080`

### 3. Start the frontend

Open the `Frontend` folder in VS Code.

Right-click `login.html` and select **Open with Live Server**.

### 4. Login

Use the locally configured administrator credentials.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | User authentication |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/employees` | List employees |
| POST | `/api/employees` | Add employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/payroll` | View payroll records |
| POST | `/api/payroll/generate` | Generate payroll |
| GET | `/api/payroll/{id}` | View payslip data |

## Deployment

- Frontend: Vercel
- Backend: Java-compatible hosting platform
- Database: Persistent database configuration required for production

## Disclaimer

PayTrack is an educational and portfolio project. Payroll calculations are intended for demonstration purposes and are not a substitute for statutory payroll processing.

## Author

Developed as a Java Full-Stack Internship Project.
