User & Post Management API (JSON-based)
Project Description

A RESTful API built with Node.js, Express, and MySQL for managing users and posts. This API allows full CRUD operations on users and posts, supporting JSON-based requests and responses. It includes modern server-side practices such as input validation middleware, centralized error handling, resource existence checks, and REST-compliant status codes, making it maintainable, scalable, and consistent for client applications.


Features


Users

GET /api/users – Retrieve all users

GET /api/users/:id – Retrieve a specific user by ID

POST /api/users – Create a new user (automatic ID assignment)

PUT /api/users/:id – Fully update an existing user

PATCH /api/users/:id – Partially update user fields

DELETE /api/users/:id – Delete a user

Each user has the following fields:
id, name, age, occupation, username.


Posts

GET /api/posts – Retrieve all posts

GET /api/posts/:id – Retrieve a specific post by ID

POST /api/posts – Create a new post

PUT /api/posts/:id – Fully update an existing post

PATCH /api/posts/:id – Partially update post fields

DELETE /api/posts/:id – Delete a post

Each post has the following fields:
id, title, content, authorId (foreign key referencing users.id).

Technical Highlights

Node.js + Express: Fast, minimal, and structured server-side framework.

MySQL + Sequelize ORM: Simplified database integration and query handling.

Validation Middleware: Ensures required fields, correct IDs, and input formats before processing.

Global Error Handler: Centralized error management returning consistent JSON responses with proper HTTP status codes (400, 404, 500, etc.).

REST-compliant Design: Uses proper HTTP methods and status codes for all CRUD operations.

JSON-based API: All responses and requests are in JSON for seamless frontend integration.

Scalable Folder Structure: Organized controllers, routes, services, models, and helpers for maintainability.

Cross-table Relations: Posts reference users via authorId, supporting relational integrity.