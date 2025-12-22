# Registration Functionality - Sequence Diagram Description

## Actor:
**Customer**: The user who initiates the registration process to create a new account on the Book Store platform.

## Objects:
- **Client**: The front-end application that displays the registration form and sends user data to the backend.
- **Controller**: The backend component responsible for validating input data, handling business logic, and coordinating with the database.
- **Database**: Stores user information such as email, username, encrypted password, role, and account status.

## Control Flow:

1. The customer opens the registration page from the client application.

2. The customer submits the registration form, including name, email, password, and an optional username.

3. The client sends a POST /api/auth/register request to the controller with the submitted data.

4. The controller validates the input fields, including required fields, email format, and password rules.

5. If the input validation fails, the process stops and a validation error response is returned to the client.

6. If the input is valid, the controller checks the database to determine whether the email already exists.

7. If the email is already registered, the system returns a conflict error indicating that the email is in use.

8. If the email is not found, the controller checks whether the provided username already exists.

9. If the username is already taken, the system generates a unique username variant and verifies its availability.

10. Once a unique username is confirmed, the controller encrypts the user's password using a secure hashing algorithm.

11. A new user record is inserted into the database with the encrypted password and default user role.

12. After successful insertion, the controller generates a JSON Web Token (JWT) for the new user.

13. The system returns a successful registration response along with the authentication token.

14. The client stores the token securely and redirects the user to the authenticated area of the application.

---

**Related File**: `02_Registration_Functionality_Tien.mmd`

