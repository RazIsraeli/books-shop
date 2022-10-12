'use strict'

const STORAGE_KEY = 'booksDB'
const STORAGE_BOOK_ID = 'gId'
const PAGE_SIZE = 10
const gBooksNames = [
  'Harry Potter 1',
  'Harry Potter 2',
  'Harry Potter 3',
  'Harry Potter 4',
  'Harry Potter 5',
  'Harry Potter 6',
  'Harry Potter 7',
  'The Lord of the Rings 1',
  'The Lord of the Rings 2',
  'The Lord of the Rings 3',
  '50 Shades of Grey',
  'Teenage Ninja Turtles',
  'James Bond: 007',
  'Atomic Habbits',
  'How to Make Money in Stocks',
  'Think and Grow Rich',
  'The Lean Startup',
  'The Lean Product Playbook',
  'Hooked',
  'The Mask: Unmasked',
  'Random Book Name',
  'How to Become a Happy Developer',
  'Recurssion - Summary',
]

var gId
var gPageIdx = 0
var gBooks
var gSortBy = ''
var gFilterBy = { minRating: 0, maxPrice: 999, txt: '' }

_createBooks()

function setBooksFilter(filterBy = {}) {
  if (filterBy.maxPrice !== undefined) gFilterBy.maxPrice = filterBy.maxPrice
  if (filterBy.minRating !== undefined) gFilterBy.minRating = filterBy.minRating
  if (filterBy.txt !== undefined) gFilterBy.txt = filterBy.txt
  return gFilterBy
}

function getBooks() {
  // Filtering:
  var books = gBooks.filter(
    (book) =>
      book.name.toLowerCase().includes(gFilterBy.txt.toLowerCase()) &&
      book.price <= gFilterBy.maxPrice &&
      book.rating >= gFilterBy.minRating
  )

  //paging
  enableNext()
  const startIdx = gPageIdx * PAGE_SIZE
  books = books.slice(startIdx, startIdx + PAGE_SIZE)

  return books
}

function nextPage() {
  gPageIdx++
}

function prevPage() {
  if (gPageIdx === 0) {
    return
  }
  gPageIdx--
}

function addBook(bookName, bookPrice) {
  var book = {
    id: getId(),
    name: bookName,
    price: +bookPrice.toFixed(2),
    rating: 0,
  }
  gBooks.unshift(book)
  //Saving all books in storage
  _saveBookIdToStorage()

  //updating gId in storage
  _saveBooksToStorage()
}

function RemoveBook(bookId) {
  var book = gBooks.find((book) => book.id === bookId)
  var bookIdx = gBooks.findIndex((book) => book.id === bookId)
  gBooks.splice(bookIdx, 1)
  console.log('removed the book: ', book.name)
}

function updateBook(bookId, price) {
  if (!price) return
  var book = gBooks.find((book) => book.id === bookId)
  book.price = price
  _saveBooksToStorage()
  console.log(`updated the price for the book "${book.name}" to ${book.price}`)
}

function changeBookRating(bookId, ratingChangeSign) {
  var book = getBookById(bookId)

  switch (ratingChangeSign) {
    case '+':
      book.rating++
      break
    case '-':
      book.rating--
      break

    default:
      break
  }

  _saveBooksToStorage()
}

function getBookById(bookId) {
  return gBooks.find((book) => book.id === bookId)
}

function getMaxPrice(books) {
  var max = -Infinity
  books.forEach((book) => {
    max = book.price > max ? book.price : max
  })
  return max
}

function _createBooks() {
  var books = loadBooksFromStorage(STORAGE_KEY)
  gId = getId()

  if (!books || !books.length) {
    gId = 1001
    books = []
    for (let i = 0; i < 23; i++) {
      var name = gBooksNames[getRandomIntInclusive(0, gBooksNames.length - 1)]
      var name = gBooksNames.splice(
        getRandomIntInclusive(0, gBooksNames.length - 1),
        1
      )[0]
      name = name ? name : `book-${gId}`
      books.push(_createBook(name))
    }
    books.reverse()
  }
  gBooks = books
  _saveBookIdToStorage()
  _saveBooksToStorage()
}

function getId() {
  var id = loadIdFromStorage(STORAGE_BOOK_ID)
  gId++
  _saveBookIdToStorage()
  return id
}

function getPageIdx() {
  return gPageIdx
}
function getPageSize() {
  return PAGE_SIZE
}
function getBooksLength() {
  return gBooks.length
}

function _createBook(name) {
  return {
    id: gId++,
    name,
    price: getRandomIntInclusive(35, 150),
    rating: 0,
    img: `images/${name.replaceAll(' ', '-').toLowerCase()}.jpg`,
  }
}

function _saveBooksToStorage() {
  saveBooksToStorage(STORAGE_KEY, gBooks)
}

function _saveBookIdToStorage() {
  saveBookIdToStorage(STORAGE_BOOK_ID, gId)
}
