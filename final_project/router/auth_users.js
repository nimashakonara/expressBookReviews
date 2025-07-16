const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
      // Filter the users array for any user with the same username
      let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });
  
      req.session.authorization = {
        accessToken,
        username
      };
  
      return res.status(200).json({ message: "Login successful!", token: accessToken });
    } else {
      return res.status(401).json({ message: "Invalid login credentials." });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.session?.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "Unauthorized. Please log in." });
    }
  
    if (!reviewText) {
      return res.status(400).json({ message: "Review text is required in the query." });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    // Initialize reviews if missing
    if (!book.reviews) {
      book.reviews = {};
    }
  
    // Save or update review
    book.reviews[username] = reviewText;
  
    return res.status(200).json({
      message: "Review submitted successfully.",
      reviews: book.reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
