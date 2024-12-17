export function renderListWithTemplate(templateFn, parentElement, list, position = "afterbegin", clear = false) {
  const htmlStrings = list.map(templateFn);
  // if clear is true we need to clear out the contents of the parent.
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.insertAdjacentHTML("afterbegin", template);
  if (callback) {
    callback(data);
  }
}

export function formatExpiration(event) {
  let input = event.target.value;
  input = input.replace(/\D/g, "");
  
  if (input.length > 2) {
    input = input.slice(0, 2) + '/' + input.slice(2);
  }

  event.target.value = input;
}

async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

export async function loadHeaderFooter() {
  const headerTemplate = await loadTemplate("../partials/header.html");
  const headerElement = document.querySelector("#main-header");
  const footerTemplate = await loadTemplate("../partials/footer.html");
  const footerElement = document.querySelector("#main-footer");

  await renderWithTemplate(headerTemplate, headerElement);
  await renderWithTemplate(footerTemplate, footerElement);
}

// retrieve data from localstorage
export default function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// TODO: footer and header
// if is authenticated show logout button
// if not show login and register buttons


export async function getRandomQuote() {
  try {
    const response = await fetch('/public/json/quotes.json');
    const quotes = await response.json();
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return null;
  }
}
