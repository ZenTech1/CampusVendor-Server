# campusVendor-Server
The vision of CampusVendor is to become the go-to digital marketplace for campus life, starting with the University of Ghana, Legon, and expanding to other campuses nationwide.


# server documentation
# Create a .env file in the root directory with:
JWT_secret="secret key"
EMAIL="Zentech2099@gmail.com"
PASSWORD="yrbl gpzh rqeb remh"
DATABASE_URL="postgresql://campus_vendor_db_user:vyeo6COekjRDzpBlOzE1pnUPj0Fe6umZ@dpg-d3r3mtumcj7s73bk4og0-a.oregon-postgres.render.com/campus_vendor_db"

# run the server with:
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# API  
Find all API details at :

# email services

File: emailService.js
Handles sending OTP emails using Nodemailer with a Gmail SMTP configuration.

Automatically sends a custom HTML email containing the OTP code.

## FIND ALL OTHER TESTS IN THE TEST.REST FILE



