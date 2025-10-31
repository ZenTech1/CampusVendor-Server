/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Endpoints for user and vendor registration, OTP, login, 2FA, and password management
 */

/**
 * @swagger
 * /api/auth/signUp/student:
 *   post:
 *     summary: Student registration and OTP
 *     description: Registers a student by email, then sends OTP for verification. Returns a JWT token for verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "mysecurepassword123"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/verify-otp/student:
 *   post:
 *     summary: Verify student OTP
 *     description: Verifies the OTP sent to the student's email and creates the account in the DB.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, token]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               token:
 *                 type: string
 *                 description: Token received from signUp endpoint
 *     responses:
 *       201:
 *         description: Student signup complete
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Error verifying OTP
 */

/**
 * @swagger
 * /api/auth/signUp/vendor:
 *   post:
 *     summary: Vendor registration and OTP
 *     description: Registers a vendor by email, sends OTP for verification, returns JWT token for verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, entName, phone, location, description]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Vendor"
 *               email:
 *                 type: string
 *                 example: "vendor@example.com"
 *               password:
 *                 type: string
 *                 example: "securevendorpass"
 *               entName:
 *                 type: string
 *                 example: "Jane’s Bakery"
 *               phone:
 *                 type: string
 *                 example: "+233241234567"
 *               location:
 *                 type: string
 *                 example: "Accra, Ghana"
 *               description:
 *                 type: string
 *                 example: "We sell the best pastries on campus."
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Vendor already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/verify-otp/vendor:
 *   post:
 *     summary: Verify vendor OTP
 *     description: Verifies the OTP sent to vendor's email, creates vendor account in the DB.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, token]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "654321"
 *               token:
 *                 type: string
 *                 description: Token received from signUp endpoint
 *     responses:
 *       201:
 *         description: Vendor signup complete
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Error verifying OTP
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login (students and vendors)
 *     description: Authenticates student/vendor with email and password, returns JWT token. If 2FA required, triggers OTP and returns temp token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 example: "mysecurepassword123"
 *     responses:
 *       200:
 *         description: Login successful or 2FA OTP sent
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: Account not found
 *       500:
 *         description: Login error
 */

/**
 * @swagger
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Verify 2FA OTP for login
 *     description: Verifies the login OTP for 2FA and issues the final JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp, token]
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "789456"
 *               token:
 *                 type: string
 *                 description: Temporary token received from login
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: Account not found
 *       500:
 *         description: Verification error
 */

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA for user/vendor
 *     description: Requires JWT authentication. Enables 2FA for the logged-in account.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to enable 2FA
 */

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     summary: Disable 2FA for user/vendor
 *     description: Requires JWT authentication. Disables 2FA for the logged-in account.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to disable 2FA
 */

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user or vendor
 *     description: Sends a new OTP to email of student or vendor.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       404:
 *         description: Account not found
 *       500:
 *         description: Error resending OTP
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password for user or vendor
 *     description: Resets password for student or vendor account via email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               newPassword:
 *                 type: string
 *                 example: "newsecurepassword123"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       404:
 *         description: Account not found
 *       500:
 *         description: Error resetting password
 */
