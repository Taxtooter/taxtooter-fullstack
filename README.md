# Taxtooter Fullstack

A full-stack MERN (MongoDB, Express, React/Next.js, Node.js) application for managing tax queries with role-based access (Admin, Consultant, Customer).

---

## 🤝 Collaboration

Want to contribute? See the [Contributing](#contributing) section below for how to get started!

---

## Features
- User authentication and role management (Admin, Consultant, Customer)
- Query creation, assignment, and resolution
- Consultant and admin responses
- File upload support (attach files to responses)
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

We welcome contributions from everyone! To get started:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```sh
   git clone https://github.com/YOUR_USERNAME/taxtooter-fullstack.git
   cd taxtooter-fullstack
   ```
3. **Create a new branch** for your feature or fix:
   ```sh
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** (see code style notes below).
5. **Commit and push** your branch:
   ```sh
   git add .
   git commit -m "Describe your change"
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** from your branch to the `main` branch of this repo.
7. **Describe your changes** clearly in the PR and reference any related issues.
8. **Participate in code review** and address any feedback.

### Code Style & Guidelines
- Use Prettier/ESLint for formatting (if configured).
- Keep code modular and well-commented.
- Use descriptive commit messages.
- Discuss large changes in [Issues](https://github.com/Taxtooter/taxtooter-fullstack/issues) before starting.

### Need Help?
- Open an issue for questions, bugs, or feature requests.

## License
[MIT](LICENSE) 