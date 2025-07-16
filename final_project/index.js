const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticatedUser, isValid, users } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const PORT = 5000;

app.use(express.json()); // Body parser first
app.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// JWT Authentication Middleware (for protected customer routes)
app.use("/customer/auth/*", (req, res, next) => {
  const token = req.session?.authorization?.accessToken;

  if (token) {
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user; // Attach verified user to request
        next();
      } else {
        return res.status(403).json({ message: "Invalid token. User not authenticated." });
      }
    });
  } else {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }
});


// Login Endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "Login successful!", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
});


// Register Endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully. You can now log in." });
});


// Route Mounting
app.use("/customer", customer_routes); // Registered user routes
app.use("/", genl_routes);            // Public user routes

// Start Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));