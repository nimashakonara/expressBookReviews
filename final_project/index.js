const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if token exists in session
    if (req.session && req.session.accessToken) {
        // Verify the token
        jwt.verify(req.session.accessToken, "fingerprint_customer", (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid token. Access denied." });
            }
            req.user = decoded; // You can store user info for later use
            next();              // Token is valid, proceed to route handler
        });
    } else {
        return res.status(401).json({ message: "Unauthorized. No token provided." });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
