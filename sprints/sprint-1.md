# Sprint 1 Restrospective

## User Stories
- Created [**2 epics**](https://github.com/users/ns-krishnakodali/projects/4/views/1?filterQuery=label%3A%22sprint-1%22+label%3Aepic) and [**9 user stories**](https://github.com/users/ns-krishnakodali/projects/4/views/1?filterQuery=label%3A%22sprint-1%22+label%3Astory) during this sprint.
- The inclusion of user stories depends on the project scope.

## Sprint Planning
- Sprint 1 [Board](https://github.com/users/ns-krishnakodali/projects/4)
- Conducted sprint planning and distributed tasks among participants.
- This sprint focuses on configuring dependencies and completing user authentication development.
- Each task is prefixed with **FE** (Frontend), **BE** (Backend), or **App** (Application).
  - **FE**: Frontend
  - **BE**: Backend
  - **App**: Application
- Tasks are labeled as:
  - **Enhancement**: Significant application development
  - **Configuration**: Related to configuration changes only
- All **PRs** (Pull Requests) are linked to tasks upon moving to the **In Review** phase.
- Workflow stages for tasks:
  1. **Todo**
  2. **In Progress**
  3. **In Review**
  4. **Done**

## Development

### FE (Frontend)
- Initiated **Angular** and configured the required application for **Gator Marketplace**.
- Developed and integrated shared UI components across the frontend application.
- Configured **linting**, **prettify**, and **MaterialUI** in the Angular application.
- Set up routing for the application.
- Developed **Login** and **Signup** pages, including styling by creating the necessary modules.

### BE (Backend)
- Initialized the **Gin framework** and integrated **GORM** for PostgreSQL database connectivity.
- Created a **Docker Compose file** for PostgreSQL setup.
- Configured **JWT** (JSON Web Tokens) and necessary middleware for token generation and validation.
- Developed **Login API** to validate user credentials (email and password) and return a **Bearer token** for valid credentials.
- Developed **Signup API** to handle user registration (username, email, password), check if the user exists, and add the user to the database if not already present.

### App (Application)
- Set up workflows for validating commit message formats and configured branch protection rules on GitHub.
- Created basic **user interface designs** for UI reference.
- Wrote a **Wiki** on the branching strategy to be followed for the project.

## Completed Stories
- All user stories for this sprint have been completed; there are no pending tasks.
- For the upcoming sprint, focus will be on completing additional **UI pages**.

## Testing
- Tested **Login** and **Signup** APIs using **Postman**, verifying database entries.
- Verified basic **CRUD** operations on the database.
