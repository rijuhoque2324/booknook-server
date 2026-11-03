# BookNook — Backend API

A RESTful backend API for **BookNook**, a community-driven online library management platform. It allows users to explore books, contribute books to the library, borrow available books, and manage their borrowing activities securely.

## 🚀 Features

- **Book Management:** Create, read, update, and delete books.
- **Authentication & Authorization:** Secure API access using Better Auth JWT verification.
- **Ownership Protection:** Only authenticated book owners can update or delete their own books.
- **Borrowing System:** Borrow available books and manage borrowing records.
- **Copy Availability:** Automatically updates available copies when books are borrowed or returned.
- **Duplicate Borrow Prevention:** Prevents users from borrowing the same book multiple times while an active borrow exists.
- **Input Validation:** Validates incoming requests using Zod.
- **Error Handling:** Provides structured API error responses.
- **MongoDB Integration:** Stores books and borrowing records in MongoDB.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| TypeScript | Type safety |
| MongoDB | Database |
| Zod | Request validation |
| Better Auth | Authentication |
| JOSE | JWT verification |

## 📁 Project Structure

booknook-server/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   └── server.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json



## 🔗 API Endpoints

Base URL:

```text
http://localhost:5000
```

### Books API

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| GET | `/books` | Get all books | No |
| GET | `/books/:id` | Get a single book | No |
| POST | `/books` | Add a new book | Yes |
| PATCH | `/books/:id` | Update a book | Yes |
| DELETE | `/books/:id` | Delete a book | Yes |

### Borrow API

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/borrows` | Borrow a book | Yes |
| GET | `/borrows` | Get the logged-in user's borrowing records | Yes |
| DELETE | `/borrows/:id` | Return a borrowed book | Yes |

## 🔐 Authentication

Protected endpoints require a valid JWT access token.

Include the token in the request header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

The backend verifies JWT signatures and claims using the Better Auth JWKS endpoint.

Unauthorized or invalid requests are rejected.

## 📚 Book Data Structure

A book contains the following information:

```json
{
  "title": "The Alchemist",
  "author": "Paulo Coelho",
  "category": "Fiction",
  "description": "A journey of self-discovery.",
  "image": "https://example.com/book.jpg",
  "totalCopies": 5,
  "availableCopies": 5,
  "ownerName": "Library Member",
  "ownerEmail": "member@example.com"
}
```

## 📖 Borrowing Rules

- Only authenticated users can borrow books.
- A book must have at least one available copy.
- A user cannot have duplicate active borrow records for the same book.
- Available copies decrease when a book is borrowed.
- Available copies increase when a book is returned.
- Users can return only their own active borrowing records.

## 🌐 Deployment

The backend is designed to be deployed on **Render**.

1. Push the backend repository to GitHub.
2. Create a new Web Service on Render.
3. Connect the GitHub repository.
4. Configure the build and start commands from `package.json`.
5. Add all required production environment variables.
6. Connect your MongoDB Atlas database.
7. Deploy the service.

Update the frontend API URL and JWT configuration to use the deployed production URLs.

## 🔒 Security

- JWT-based authentication.
- Protected API routes.
- Owner-based authorization.
- Zod request validation.
- Environment-based configuration.
- Server-side business rule enforcement.

## 👨‍💻 Project

**BookNook — Online Library Management System**

Backend developed as part of the Programming Hero Assignment.

