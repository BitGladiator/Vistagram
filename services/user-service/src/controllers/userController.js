const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../config/database");

// Register new user
const register = async (req, res, next) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Validation
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Username, email, password, and full name are required",
        },
      });
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Username must be between 3 and 30 characters",
        },
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Password must be at least 8 characters long",
        },
      });
    }
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email format",
        },
      });
    }
    // Hash password
    const password_hash = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS)
    );

    // Insert user
    const result = await query(
      `INSERT INTO users (username, email, password_hash, full_name) 
       VALUES ($1, $2, $3, $4) 
       RETURNING user_id, username, email, full_name, created_at`,
      [username.toLowerCase(), email.toLowerCase(), password_hash, full_name]
    );

    const user = result.rows[0];

    // Create user settings
    await query(`INSERT INTO user_settings (user_id) VALUES ($1)`, [
      user.user_id,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      status: "success",
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
        },
        token: token,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Username and password are required",
        },
      });
    }

    // Get user by username or email
    const result = await query(
      `SELECT user_id, username, email, password_hash, full_name, is_active 
       FROM users 
       WHERE username = $1 OR email = $1`,
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password",
        },
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        error: {
          code: "ACCOUNT_DISABLED",
          message: "Account has been disabled",
        },
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid username or password",
        },
      });
    }

    // Update last login
    await query(`UPDATE users SET last_login_at = NOW() WHERE user_id = $1`, [
      user.user_id,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
        },
        token: token,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const result = await query(
      `SELECT user_id, username, email, full_name, bio, profile_picture_url, 
              is_verified, is_private, follower_count, following_count, post_count, created_at
       FROM users 
       WHERE user_id = $1 AND is_active = true`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user: result.rows[0],
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
