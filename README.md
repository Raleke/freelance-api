
# Freelance API

## Project Description
Freelance API is a backend service designed to support a freelance platform. It provides a comprehensive RESTful API for managing users, jobs, proposals, contracts, invoices, payments, notifications, chats, reviews, disputes, organizations, availability, and more. The API supports authentication with Passport.js, including OAuth with GitHub and Google, and uses MongoDB as its database.

## Features
- User authentication and authorization with session management
- OAuth login via GitHub and Google
- Job posting and management
- Proposal submission and contract handling
- Invoice generation and payment processing with Stripe
- Real-time chat and notifications using Socket.io
- Review and dispute management
- Organization and availability management
- Webhook support for external integrations
- Admin and debug routes for management and troubleshooting
- File uploads and message attachments support
- Comprehensive error handling middleware

## Technologies Used
- Node.js with Express.js
- MongoDB with Mongoose
- Passport.js for authentication
- OAuth with GitHub and Google
- Stripe for payment processing
- Socket.io for real-time communication
- Docker and Docker Compose for containerization
- Jest and Supertest for testing
- Various utility libraries (bcrypt, nodemailer, pdfkit, ical-generator, etc.)

## Prerequisites
- Node.js (v18 recommended)
- npm
- Docker and Docker Compose (optional, for containerized deployment)
- MongoDB (if not using Docker)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd freelance-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the necessary environment variables. Example variables include:
   ```
   PORT=4000
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   CLIENT_URL=http://localhost:4000
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   GITHUB_CLIENT_ID=<your-github-client-id>
   GITHUB_CLIENT_SECRET=<your-github-client-secret>
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   ```

## Running the Application

### Locally
Start the server with:
```bash
node server.js
```
The server will run on the port specified in `.env` (default 4000).

### Using Docker
Build and run the Docker container:
```bash
docker build -t freelance-api .
docker run -p 4000:4000 --env-file .env freelance-api
```

### Using Docker Compose
Start the app and MongoDB with Docker Compose:
```bash
docker-compose up
```
This will start the API server on port 4000 and a MongoDB instance on port 27018.

## Testing
Run tests using Jest:
```bash
npm test
```

## API Routes Overview
- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/jobs` - Job postings
- `/api/proposals` - Proposals management
- `/api/contracts` - Contracts handling
- `/api/invoices` - Invoice generation
- `/api/payments` - Payment processing
- `/api/notifications` - Notifications
- `/api/chats` - Real-time chat
- `/api/reviews` - Reviews management
- `/api/disputes` - Dispute resolution
- `/api/orgs` - Organization management
- `/api/availability` - Availability scheduling
- `/api/admin` - Admin operations
- `/api/debug` - Debugging endpoints
- `/api/webhooks` - Webhook endpoints

## Folder Structure
- `app.js` - Express app setup
- `server.js` - Server startup and database connection
- `config/` - Configuration files (database, passport, stripe)
- `controllers/` - Route handlers
- `routes/` - API route definitions
- `models/` - Mongoose models
- `middlewares/` - Express middlewares
- `services/` - Business logic and external service integrations
- `utils/` - Utility functions
- `tests/` - Test suites
- `uploads/` - Uploaded files storage
- `messages/` - Message attachments storage
- `Dockerfile` - Docker image build instructions
- `docker-compose.yml` - Docker Compose configuration

## License
This project is licensed under the MIT License.
