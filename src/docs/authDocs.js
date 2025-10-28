/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: API endpoints for user, vendor, OTP, and 2FA authentication
 */

/**
 * @swagger
 * /api/auth/signUp/student:
 *   post:
 *     summary: Register a new student and send OTP
 *     description: Creates a temporary user record, sends OTP to email, and returns a token used for OTP verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword123
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
 *     summary: Verify student signup OTP
 *     description: Verifies the OTP sent to email and creates the student account in the database.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - token
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               token:
 *                 type: string
 *                 description: Token received from the signup endpoint
 *     responses:
 *       201:
 *         description: Student signup complete
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Verification error
 */

/**
 * @swagger
 * /api/auth/signUp/vendor:
 *   post:
 *     summary: Register a new vendor and send OTP
 *     description: Creates a temporary vendor record, sends OTP to email, and returns a token used for OTP verification.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - entName
 *               - phone
 *               - location
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Vendor
 *               email:
 *                 type: string
 *                 example: vendor@example.com
 *               password:
 *                 type: string
 *                 example: securevendorpass
 *               entName:
 *                 type: string
 *                 example: Jane’s Bakery
 *               phone:
 *                 type: string
 *                 example: "+233241234567"
 *               location:
 *                 type: string
 *                 example: Accra, Ghana
 *               description:
 *                 type: string
 *                 example: We sell the best pastries on campus.
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
 *     summary: Verify vendor signup OTP
 *     description: Verifies the OTP sent to vendor email and creates the vendor account.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - token
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "654321"
 *               token:
 *                 type: string
 *                 description: Token received from the signup endpoint
 *     responses:
 *       201:
 *         description: Vendor signup complete
 *       400:
 *         description: Invalid OTP
 *       500:
 *         description: Verification error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login for both students and vendors
 *     description: Authenticates user/vendor and returns a JWT token. If 2FA is enabled, sends OTP and returns temporary token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword123
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
 *     description: Verifies OTP and issues final JWT token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - token
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
 *       500:
 *         description: Verification error
 */

/**
 * @swagger
 * /api/auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA for user or vendor
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
 *     summary: Disable 2FA for user or vendor
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
 *     summary: Resend OTP to email
 *     description: Sends a new OTP to an existing user or vendor.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
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
 *     summary: Reset account password
 *     description: Resets the password for a user or vendor account.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               newPassword:
 *                 type: string
 *                 example: newsecurepassword123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       404:
 *         description: Account not found
 *       500:
 *         description: Error resetting password
 */
