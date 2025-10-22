# campusVendor-Server
The vision of CampusVendor is to become the go-to digital marketplace for campus life, starting with the University of Ghana, Legon, and expanding to other campuses nationwide.


###server documentation####
**Create a .env file in the root directory with:
JWT_secret="secret key"
EMAIL="Zentech2099@gmail.com"
PASSWORD="yrbl gpzh rqeb remh"
DATABASE_URL="postgresql://campus_vendor_db_user:vyeo6COekjRDzpBlOzE1pnUPj0Fe6umZ@dpg-d3r3mtumcj7s73bk4og0-a.oregon-postgres.render.com/campus_vendor_db"

** RUN THE SERVER WITH:
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

*** API DOCUMENTATION ***
POST /api/auth/signUp/student

Registers a new student and sends an OTP to verify their email.

Request Body:

{
  "name": "John Doe",
  "email": "john@student.edu",
  "password": "12345678"
}


Response:

{
  "message": "OTP sent to email. Verify to complete signup.",
  "token": "<temporary_signup_jwt>"
}

2️⃣ POST /api/auth/verify-otp

Verifies the OTP sent to the user’s email and completes registration.

Request Body:

{
  "otp": "123456",
  "token": "<temporary_signup_jwt>"
}


Response:

{
  "message": "Signup complete",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@student.edu"
  }
}

3️⃣ POST /api/auth/login

Authenticates a user and returns a JWT token.
If 2FA is enabled, sends a new OTP and returns a temporary login token.

Request Body:

{
  "email": "john@student.edu",
  "password": "12345678"
}


Response (if 2FA disabled):

{
  "message": "Login successful",
  "token": "<auth_jwt>",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@student.edu"
  }
}


Response (if 2FA enabled):

{
  "message": "2FA OTP sent. Verify to complete login.",
  "token": "<temporary_login_jwt>"
}

4️⃣ POST /api/auth/verify-2fa

Verifies OTP for 2FA login and issues a full access token.

Request Body:

{
  "otp": "654321",
  "token": "<temporary_login_jwt>"
}


Response:

{
  "message": "2FA login successful",
  "token": "<auth_jwt>",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@student.edu"
  }
}

5️⃣ POST /api/auth/2fa/enable

Toggles Two-Factor Authentication (2FA) ON.

Headers:

Authorization: Bearer <auth_jwt>


Response:

{
  "message": "2FA has been enabled.",
  "status": true
}

6️⃣ POST /api/auth/2fa/disable

Disables Two-Factor Authentication.

Headers:

Authorization: Bearer <auth_jwt>


Response:

{
  "message": "2FA has been disabled.",
  "status": false
}

🧩 Authentication Middleware


💌 Email Service

File: emailService.js
Handles sending OTP emails using Nodemailer with a Gmail SMTP configuration.

Automatically sends a custom HTML email containing the OTP code.

FIND ALL OTHER TESTS IN THE TEST.REST FILE



