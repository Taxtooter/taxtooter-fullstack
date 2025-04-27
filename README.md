# Taxtooter Fullstack

A full-stack MERN (MongoDB, Express, React/Next.js, Node.js) application for managing tax queries with role-based access (Admin, Consultant, Customer).

## Features
- User authentication and role management (Admin, Consultant, Customer)
- Query creation, assignment, and resolution
- Consultant and admin responses
- File upload support (coming soon)
- Dockerized setup for easy deployment

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **Authentication:** JWT
- **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/)

### Local Development

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Taxtooter/taxtooter-fullstack.git
   cd taxtooter-fullstack
   ```
2. **Copy and configure environment variables:**
   - Create `.env` files in both `backend/` and `frontend/` as needed (see sample `.env.example` if provided).
3. **Install dependencies:**
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. **Run with Docker Compose:**
   ```sh
   docker-compose up --build
   ```
5. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

## Usage
- Register as a customer, consultant, or admin
- Create and manage queries
- Assign queries (admin)
- Respond to queries (consultant, admin)
- Mark queries as resolved

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE) 