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

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API

/***********************
 * STORAGE HELPERS
 ***********************/
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

/***********************
 * QUOTE DISPLAY LOGIC
 ***********************/
function displayRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>${quote.category}</small>
  `;

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function showRandomQuote() {
  displayRandomQuote();
}

/***********************
 * ADD QUOTE FORM
 ***********************/
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

/***********************
 * CATEGORY FILTERING
 ***********************/
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
  if (savedCategory) categoryFilter.value = savedCategory;
}

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
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    const data = await response.json();
    console.log("Server response:", data);
    notifyUser("✅ Quote sent to server successfully.");
  } catch (error) {
    notifyUser("❌ Failed to post quote to server.");
  }
}

// REQUIRED FUNCTION NAME
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();

    if (JSON.stringify(serverQuotes) !== JSON.stringify(quotes)) {
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

function manualSync() {
  syncQuotes();
}

function notifyUser(message) {
  syncStatus.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = message;
  syncStatus.appendChild(p);
}

/***********************
 * ADD QUOTE LOGIC
 ***********************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return;

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();

  const quoteElement = document.createElement("p");
  quoteElement.textContent = `"${text}" (${category})`;
  quoteDisplay.appendChild(quoteElement);

  populateCategories();
  filterQuotes();

  postQuoteToServer(newQuote);
}

/***********************
 * EVENTS
 ***********************/
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

/***********************
 * INITIAL LOAD
 ***********************/
createAddQuoteForm();
populateCategories();
filterQuotes();
syncQuotes();
setInterval(syncQuotes, 30000);
