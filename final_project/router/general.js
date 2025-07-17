const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

async function getBooks() {
  try {
    const response = await axios.get('http://localhost:5000/books');
    console.log("Books from shop (async):", response.data);
  } catch (error) {
    console.error("Error fetching books:", error.message);
  }
}

getBooks();

function getBookByISBN(isbn) {
    axios.get(`http://localhost:5000/books/${isbn}`)
      .then(response => {
        console.log(`Details for book ${isbn}:`, response.data);
      })
      .catch(error => {
        console.error("Error fetching book details:", error.message);
      });
  }
  
  getBookByISBN(3);   

// Async function to get books by author

function getBooksByAuthor(authorName) {
    axios.get('http://localhost:5000/books')
      .then(response => {
        const books = response.data;
        const filtered = Object.values(books).filter(book =>
          book.author.toLowerCase() === authorName.toLowerCase()
        );
        console.log(`Books by ${authorName}:`, filtered);
      })
      .catch(error => {
        console.error("Error fetching books:", error.message);
      });
  }
  
  getBooksByAuthor("Jane Austen");
  
  // Async function to get book by title
  function getBooksByTitle(title) {
    axios.get('http://localhost:5000/books')
      .then(response => {
        const books = response.data;
        const matchingBooks = Object.values(books).filter(book =>
          book.title.toLowerCase() === title.toLowerCase()
        );
        console.log(`Details for book titled "${title}":`, matchingBooks);
      })
      .catch(error => {
        console.error("Error fetching book details:", error.message);
      });
  }
  
  getBooksByTitle("Pride and Prejudice");
  
// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const titles = Object.values(books).map(book => book.title);
  return res.status(200).json({ titles });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {							
  const isbn = req.params.isbn;							
							
  const book = books[isbn];							
  if (book) {							
    const { author, title } = book;							
    return res.status(200).json({ isbn, title, author });							
  } else {							
    return res.status(404).json({ message: "Book not found for the given ISBN." });							
  }							
});							


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const requestedAuthor = req.params.author.toLowerCase();

  // Create an array of matched books
  const matchedBooks = Object.entries(books)
    .filter(([isbn, book]) => book.author.toLowerCase() === requestedAuthor)
    .map(([isbn, book]) => ({
      isbn,
      title: book.title,
      author: book.author
    }));

  if (matchedBooks.length > 0) {
    return res.status(200).json({ books: matchedBooks });
  } else {
    return res.status(404).json({ message: "No books found for the given author." });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const requestedTitle = req.params.title.toLowerCase();

  const matchedBooks = Object.entries(books)
    .filter(([isbn, book]) => book.title.toLowerCase() === requestedTitle)
    .map(([isbn, book]) => ({
      isbn,
      title: book.title,
      author: book.author
    }));

  if (matchedBooks.length > 0) {
    return res.status(200).json({ books: matchedBooks });
  } else {
    return res.status(404).json({ message: "No books found with the given title." });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
