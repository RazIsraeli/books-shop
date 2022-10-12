'use strict'

function loadBooksFromStorage(key) {
  var val = localStorage.getItem(key)
  return JSON.parse(val)
}

function loadIdFromStorage(key) {
  var val = localStorage.getItem(key)
  return JSON.parse(val)
}

function saveBooksToStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

function saveBookIdToStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}
