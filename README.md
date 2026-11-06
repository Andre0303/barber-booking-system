# Elite Cuts – Barber Booking System

A work-in-progress barber shop booking and management application. The goal is to give customers a simple way to request appointments and give shop staff a place to manage bookings, barbers, and opening hours.

> **Project status: In development / incomplete.**
>
> This is a learning and portfolio project. Some features are implemented, but the application has not been fully tested, hardened, or prepared for production use. Features listed under “Planned features” are ideas for future development, not features that are already available.

## Current technology

- **Frontend:** React 19, Vite, JavaScript, HTML and CSS
- **Backend:** Node.js and Express
- **Database:** MySQL, accessed with `mysql2`
- **API communication:** HTTP/JSON using `fetch`

## Current functionality

The current codebase includes:

- Customer-facing service selection and booking form.
- Booking submission to the Express API.
- Booking reference/confirmation display.
- Booking status display.
- Admin login screen and admin dashboard UI.
- Admin booking list and booking status updates.
- Barber management, including availability status and deletion checks.
- Shop working-hours display and editing.
- Backend validation for required booking details, barber availability, shop opening hours, 30-minute booking slots, and duplicate bookings.
- MySQL connection and API test endpoint.

The exact behaviour may change as development continues. The application has not yet been independently security-audited or fully tested.

## Repository structure

```text
barber-booking-system/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── public/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── BarberManagement.jsx
│   │   ├── BookingForm.jsx
│   │   ├── BookingStatus.jsx
│   │   ├── Services.jsx
│   │   └── WorkingHours.jsx
│   ├── App.jsx
│   ├── App.css
│   └── index.css
├── index.html
├── package.json
├── .gitignore
└── README.md
```

## Requirements

Install these before running the project:

- [Node.js](https://nodejs.org/) (LTS recommended; npm is included)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/) or another compatible MySQL server
- A code editor such as [Visual Studio Code](https://code.visualstudio.com/)

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/barber-booking-system.git
cd barber-booking-system
```

Replace `YOUR-USERNAME` with your GitHub username.

### 2. Install frontend dependencies

Run this from the project root (the folder containing the main `package.json`):

```bash
npm install
```

### 3. Install backend dependencies

Open a second terminal, remain in the project root, and run:

```bash
cd backend
npm install
```

### 4. Configure the database connection

Inside `backend`, make a copy of `.env.example` and name the copy `.env`.

Set the values to match your local MySQL setup:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=elite_cuts
PORT=5000
```

Do not commit your `.env` file. It contains local credentials and is excluded by `.gitignore`.

### 5. Create and prepare the MySQL database

Create a database named `elite_cuts` in MySQL:

```sql
CREATE DATABASE elite_cuts;
```

**Important:** This repository currently does not include a complete SQL schema or seed script. The backend expects tables/columns for `users`, `barbers`, `working_hours`, and `bookings`. You must create and populate those tables using the structure expected by the queries in `backend/server.js` before all features can work. Adding versioned schema and seed scripts is a planned improvement.

### 6. Start the backend

In the backend terminal:

```bash
npm start
```

The API is configured to run on:

```text
http://localhost:5000
```

You can visit `http://localhost:5000/` to check that the Express server responds. The database test endpoint is `http://localhost:5000/api/test-db`.

### 7. Start the frontend

In the first terminal, return to the project root if necessary, then run:

```bash
npm run dev
```

Vite normally serves the frontend at:

```text
http://localhost:5173
```

Keep both terminals running while using the application.

## API routes currently present

The Express server currently defines routes including:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend health/message response |
| GET | `/api/test-db` | Tests the MySQL connection |
| GET | `/api/test-user` | Development user lookup endpoint |
| POST | `/api/login` | Checks admin login details |
| GET | `/api/barbers` | Retrieves barbers |
| PATCH | `/api/barbers/:id/status` | Changes a barber's availability |
| DELETE | `/api/barbers/:id` | Deletes a barber when booking constraints allow |
| GET | `/api/working-hours` | Retrieves shop working hours |
| PATCH | `/api/working-hours/:id` | Updates a day's working hours |
| POST | `/api/bookings` | Creates a booking |
| GET | `/api/bookings` | Retrieves bookings |
| PATCH | `/api/bookings/:id/status` | Updates a booking status |

This list documents the current development API and is not a guarantee that every route is production-ready.

## Planned features / roadmap

The following are possible next steps. They have **not all been implemented**:

- [ ] Add a complete MySQL schema and sample/seed data.
- [ ] Replace plain-text password comparison with securely hashed passwords (for example, bcrypt).
- [ ] Add proper authentication sessions or signed tokens and role-based authorization to protect admin API routes.
- [ ] Remove or restrict development-only test endpoints and avoid returning password fields from any API.
- [ ] Add server-side input validation and stronger error handling.
- [ ] Add automated backend and frontend tests.
- [ ] Improve mobile responsiveness and accessibility.
- [ ] Add customer booking lookup using a booking reference and suitable verification.
- [ ] Add booking cancellation and rescheduling rules.
- [ ] Add notifications (email or SMS) for booking requests and status changes.
- [ ] Add calendar views and improved booking filters/search.
- [ ] Add reports and business analytics.
- [ ] Add deployment configuration and production environment documentation.

## Security and production warning

**Do not use this project with real customer data or expose it publicly as-is.** The current implementation is a work in progress. In particular, authentication and authorization need further work before deployment. Admin-facing API routes must be protected on the server, not only hidden behind a frontend login screen.

Use environment variables for database credentials. Never upload `.env`, passwords, API keys, customer information, or database exports to GitHub. If a real database password was ever committed or shared, change/rotate it.

## Development workflow and commits

Use small commits that describe one logical change. Example commit messages:

```text
chore: add project documentation
chore: configure environment variables for database
feat: add customer booking form
feat: add booking confirmation reference
feat: add admin booking management
feat: add barber availability management
feat: add editable shop working hours
fix: prevent duplicate barber time slots
docs: update setup instructions and roadmap
```

Only use a commit message when that change is actually included in the commit. Do not create commits that claim features you have not implemented.

## Contributing

This is currently a personal learning project. Suggestions, bug reports, and constructive feedback are welcome. If you fork the repository, create a feature branch and submit a pull request with a clear description of your changes.

## License

No license has been selected yet. Unless a license is added, normal copyright rules apply and others do not automatically have permission to reuse, modify, or distribute this project.
