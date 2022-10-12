'use strict'

var gTimeInterval

var gIsCardsView = false

function onInit() {
  //show the date and time, and start an interval to update every 1 minute
  document.querySelector('.header-time').innerText = new Date()
    .toString()
    .slice(4, 21)
  gTimeInterval = setInterval(renderTime, 60000)

  //render filters if anything was used before (allows us to send URL and present the filtered results...)
  renderFilterByQueryStringParams()
  //render modal if it was opened before
  renderModalByQueryStringParams()

  renderBooks()
}

function renderBooks() {
  var books = getBooks()
  if (gIsCardsView) {
    //hiding the table view
    document.querySelector('.books-table-content').innerHTML = ''
    //rendering cards view
    var strHTMLs = books.map(
      (book) =>
        `
        <article class="book-preview">
        <button class="btn-remove" onclick="onRemoveBook(${book.id})" title="delete book from inventory">X</button>
        <h5>${book.name}</h5>
        <h6>Price: $<span>${book.price}</span></h6>
        <button class="card-button" onclick="onReadBook(${book.id})" title="read book info">Details</button>
        <button class="card-button" onclick="onUpdateBook(${book.id})" title="update book price">Update Price</button>
        <img onerror="this.src='images/harry-potter-1.jpg'" src="${book.img}">
        </article>
        `
    )
  } else {
    //hiding cards view
    document.querySelector('.books-cards-content').innerHTML = ''
    //rendering table view
    var strHTMLs = ` <thead>
<tr>
    <th class="th-id">ID</th>
    <th class="th-title">TITLE</th>
    <th class="th-price">PRICE</th>
    <th class="th-rating">RATING</th>
    <th class="th-actions">ACTIONS</th>
</tr>
</thead> <tbody class="books-table-content">`

    strHTMLs += books.map(
      (book) =>
        `<tr>
          <td>${book.id}</td>
          <td class="book-name">${book.name}</td>
          <td>$${book.price}</td>
          <td>${book.rating}</td>
          <td><table class="book-actions"><tr>
          <td><div class="book-action book-read" onclick="onReadBook(${book.id})" title="read book info">Read</div></td>
          <td><div class="book-action book-update" onclick="onUpdateBook(${book.id})" title="update book price">Update</div></td>
          <td><div class="book-action book-delete" onclick="onRemoveBook(${book.id})" title="delete book from inventory">Delete</div></td>
          </tr></table></td></tr>
          `
    )
    strHTMLs += `</tbody>
    </table>`
    document.querySelector('.books-table-content').innerHTML =
      strHTMLs.replaceAll(',', '')
  }
}

function onNextPage() {
  var pageIdx = getPageIdx()
  var pageSize = getPageSize()
  var booksLength = getBooksLength()

  if (pageIdx * pageSize >= booksLength - pageSize) {
    return
  } else {
    nextPage()
    enablePrev()
    renderBooks()
    if ((pageIdx + 1) * pageSize >= booksLength - pageSize) {
      disableNext()
    }
  }
}

function onPrevPage() {
  var pageIdx = getPageIdx()

  if (pageIdx === 0) {
    return
  } else {
    prevPage()
    enableNext()
    renderBooks()
    if (pageIdx === 1) {
      disablePrev()
    }
  }
}

function renderFilterByQueryStringParams() {
  const queryStringParams = new URLSearchParams(window.location.search)
  const filterBy = {
    maxPrice: queryStringParams.get('maxPrice') || '',
    minRating: queryStringParams.get('minRating') || '',
    txt: queryStringParams.get('text') || '',
  }
  if (!filterBy.maxPrice && !filterBy.minRating && !filterBy.txt) return

  //update filters in DOM
  document.querySelector('.price-filter-range').value = filterBy.maxPrice
  document.querySelector('.rating-filter-range').value = filterBy.minRating
  document.querySelector('.text-filter-input').value = filterBy.txt

  setBooksFilter(filterBy)
}

function onSetFilterBy(filterBy) {
  filterBy = setBooksFilter(filterBy)
  renderBooks()

  //update query string params
  updateQueryStringParamsByFilter(filterBy)
}

function updateQueryStringParamsByFilter(filterBy) {
  const queryStringParams = `?maxPrice=${filterBy.maxPrice}&minRating=${filterBy.minRating}&text=${filterBy.txt}`
  const newUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    queryStringParams
  window.history.pushState({ path: newUrl }, '', newUrl)
}

function renderModalByQueryStringParams() {
  const queryStringParams = new URLSearchParams(window.location.search)
  const bookId = +queryStringParams.get('bookId') || ''

  if (!bookId) return

  //update modal in DOM
  var book = getBookById(bookId)
  renderModal(book)
}

function onAddBook() {
  var bookName = prompt('please insert book name')
  var bookPrice = +prompt('please insert book price')
  if (!bookName || !bookPrice) return
  addBook(bookName, bookPrice)
  renderBooks()
}

function onRemoveBook(bookId) {
  RemoveBook(bookId)
  renderBooks()
}

function onUpdateBook(bookId) {
  var book = gBooks.find((book) => book.id === bookId)
  var newPrice = +prompt(`insert a new price for "${book.name}"`)
  updateBook(bookId, newPrice)
  renderBooks()
}

function onReadBook(bookId) {
  var book = getBookById(bookId)
  renderModal(book)
}

function renderModal(book) {
  document.querySelector('.modal-book-name').innerText = book.name
  document.querySelector('.modal-price').innerText = book.price
  document.querySelector(
    '.modal-rating'
  ).innerHTML = `<div class='rating-value'>
      <button class='rating-button rating-minus' onclick="onChangeRating(${book.id},this.innerText)">-</button>${book.rating}
      <button class='rating-button rating-plus' onclick="onChangeRating(${book.id},this.innerText)">+</button>
    </div>`
  document.querySelector('.modal-desc').innerText = makeLorem()
  document.querySelector('.book-modal').classList.add('open')

  //update query string params with the book's details used to open the modal
  updateQueryStringParamsByModal(book.id)
}

function updateQueryStringParamsByModal(bookId) {
  updateQueryStringParamsByFilter(gFilterBy)
  const queryStringParams = window.location.search
    ? window.location.search + `&bookId=${bookId}`
    : `?bookId=${bookId}`
  const newUrl =
    window.location.protocol +
    '//' +
    window.location.host +
    window.location.pathname +
    queryStringParams
  window.history.pushState({ path: newUrl }, '', newUrl)
}

function onChangeRating(bookId, ratingChangeSign) {
  var book = getBookById(bookId)
  //rating can't be negative
  if (book.rating === 0 && ratingChangeSign === '-') return
  //rating can't be more than 10
  if (book.rating === 10 && ratingChangeSign === '+') return

  changeBookRating(bookId, ratingChangeSign)
  renderModal(book)
}

function onCloseModal() {
  document.querySelector('.book-modal').classList.remove('open')
  updateQueryStringParamsByFilter(gFilterBy)
  renderBooks()
}

function disableNext() {
  document.querySelector('.next').disabled = true
}

function enableNext() {
  document.querySelector('.next').disabled = false
}

function disablePrev() {
  document.querySelector('.prev').disabled = true
}

function enablePrev() {
  document.querySelector('.prev').disabled = false
}

function onChangeView() {
  gIsCardsView = !gIsCardsView // this should not happen here. Move to books service and only call from here.
  renderBooks()
}

function renderTime() {
  var time = new Date().toString().slice(4, 21)
  document.querySelector('.header-time').innerText = time
}
