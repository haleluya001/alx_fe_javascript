/***********************
 * INITIAL DATA & SETUP
 ***********************/

// Load quotes from localStorage or defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Programming" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

/***********************
 * STORAGE HELPERS
 ***********************/

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/***********************
 * QUOTE DISPLAY LOGIC
 ***********************/

// REQUIRED FUNCTION
function displayRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>Category: ${quote.category}</small>
  `;

  // sessionStorage usage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// REQUIRED FUNCTION
function showRandomQuote() {
  displayRandomQuote();
}

/***********************
 * ADD QUOTE FORM
 ***********************/

// REQUIRED FUNCTION
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// REQUIRED LOGIC: array + DOM update using appendChild
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  quotes.push({ text, category });
  saveQuotes();

  const quoteElement = document.createElement("p");
  quoteElement.textContent = `"${text}" (${category})`;
  quoteDisplay.appendChild(quoteElement);

  populateCategories();
  filterQuotes();
}

/***********************
 * CATEGORY FILTERING
 ***********************/

// REQUIRED FUNCTION
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) {
    categoryFilter.value = savedCategory;
  }
}

// REQUIRED FUNCTION
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  quoteDisplay.innerHTML = "";

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" (${q.category})`;
    quoteDisplay.appendChild(p);
  });
}

/***********************
 * SERVER SYNC & CONFLICTS
 ***********************/

// REQUIRED FUNCTION NAME
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  // Simulated server quotes
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

function hasConflict(serverQuotes) {
  return JSON.stringify(serverQuotes) !== JSON.stringify(quotes);
}

async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    if (hasConflict(serverQuotes)) {
      quotes = serverQuotes; // server wins
      saveQuotes();
      notifyUser("⚠️ Conflict detected. Server data applied.");
      filterQuotes();
    } else {
      notifyUser("✅ Data already in sync.");
    }
  } catch (error) {
    notifyUser("❌ Failed to sync with server.");
  }
}

function notifyUser(message) {
  syncStatus.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = message;
  syncStatus.appendChild(p);
}

// Periodic sync
setInterval(syncWithServer, 30000);

/***********************
 * EVENT LISTENERS
 ***********************/

newQuoteBtn.addEventListener("click", showRandomQuote);

/***********************
 * INITIAL LOAD
 ***********************/

createAddQuoteForm();
populateCategories();
filterQuotes();
syncWithServer();
