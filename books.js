const EMPTY_STAR = '☆';
const FULL_STAR = '★';

document.addEventListener("DOMContentLoaded", () => {
    const bookList = document.getElementById("bookList")
    const searchBar = document.getElementById("searchBar")
    const readingList = document.getElementById("readingList")
    const bookDetails = document.getElementById("bookDetails")
    const backButton = document.getElementById("backButton")
    const addToReadingListBtn = document.getElementById("addToReadingList")

let myReadingList = [] // Array to store books in reading list
let currentBook = null // Store the current book being viewed

// Fetch data from db.json
fetch('/db.json')
.then(response => response.json())
.then(data => {
    const books = data.books
    populateBookList(books)
 
// Search functionality
searchBar.addEventListener("input", () => {
    const searchTerm = searchBar.value.toLowerCase();
    if (searchTerm === "") {
        populateBookList(books)// Show all books if search bar is empty
        } else {
            const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm))
            if (filteredBooks.length > 0) { // Check if any books matched the search term.
                populateBookList(filteredBooks)
                } else {
                    showError("No books/authors found matching your search.");
                }
        }
});

 // Function to show error message
 function showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.classList.add("error-message")
    errorDiv.textContent = message
    bookList.innerHTML = ""; // Clear existing book list
    bookList.appendChild(errorDiv) // Display error message
}

// Function to populate book list
function populateBookList(displayBooks) {
    bookList.innerHTML = "";
    displayBooks.forEach(book => {
        const li = document.createElement("li")
            li.classList.add("book-item")
            li.innerHTML = `
            <h3>${book.title}</h3>
            <img src="${book.image}" alt="${book.title}" class="bookImage">
            <p>Author: ${book.author}</p>
            <div class="rating">${generateStars(book.rate)}</div>
            <button data-book-id="${book.id}">Add to Reading List</button>`;
            li.addEventListener("click", () => showBookDetails(book)) // Adding a click event listener to show book details
            li.querySelector('button').addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent the click from propagating to the li element
                const bookId = event.target.getAttribute("data-book-id")
                const selectedBook = books.find(book => book.id == bookId)
                addToReadingList(selectedBook)
            });
        bookList.appendChild(li)

        const starContainer = li.querySelector('.rating')
        attachStarEvents(starContainer, book)
    });
}

// Function to show book details
function showBookDetails(book) {
    currentBook = book; // Store the current book being viewed
    document.getElementById("bookTitle").textContent = book.title
    document.getElementById("bookAuthor").textContent = book.author
    document.getElementById("bookImage").src = book.image
    document.getElementById("bookRate").innerHTML = generateStars(book.rate)
    document.getElementById("bookDescription").textContent = book.description
            
    const starContainer = document.getElementById("bookRate")
    getStarEvent(starContainer, book)
                
    bookDetails.style.display = "block"
}

// Function to add book to reading list
function addToReadingList(book) {
    if (!myReadingList.some(item => item.id === book.id)) {
        myReadingList.push(book)
        updateReadingList()
    }
}

// Function to update reading list
function updateReadingList() {
    readingList.innerHTML = "";
    myReadingList.forEach(book => {
        const li = document.createElement("li")
        li.textContent = book.title
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'x';
        deleteButton.addEventListener('click', handleDelete)
        li.appendChild(deleteButton)
        readingList.appendChild(li)
    })
}

function handleDelete(e) {
    const bookTitle = e.target.parentNode.firstChild.textContent // Get only the book title
    myReadingList = myReadingList.filter(book => book.title !== bookTitle)
    e.target.parentNode.remove();
}

            
// Function to generate star icons based on rating
function generateStars(rate) {
    const fullStars = FULL_STAR.repeat(rate)
    const emptyStars = EMPTY_STAR.repeat(5 - rate)
    return `${fullStars}${emptyStars}`;
}

function generateStars(rate) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        const star = i <= rate ? FULL_STAR : EMPTY_STAR;
        stars += `<span class="star" data-rate="${i}">${star}</span>`
    }
    return stars
}
function getStarEvent(starContainer, book) {
    const stars = starContainer.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const newRate = parseInt(star.getAttribute('data-rate'))
            if (newRate === book.rate) {// ths will determine new rating based on the clicked star
                book.rate = newRate - 1// this will decrease rating by 1 if clicking on the same star
                } else {
                    book.rate = newRate // Set rating to the clicked star's value
                }
                starContainer.innerHTML = generateStars(book.rate) // Update star display and reattach events
                getStarEvent(starContainer, book) // Reattach events to updated stars
        });
    });
}
            
            
            
// Event listener for the "Back" button
backButton.addEventListener("click", () => {
    bookDetails.style.display = "none"
    bookList.style.display = "block"
});

// Event listener for the "Add to Reading List" button when i click the book
addToReadingListBtn.addEventListener("click", () => {
    if (currentBook) {
        addToReadingList(currentBook)
    }
});

})
    .catch(error => console.error('Error fetching books data:', error));
});
