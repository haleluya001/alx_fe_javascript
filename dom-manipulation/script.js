const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Load quotes from localStorage
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to create it.", category: "Motivation" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const syncStatus = document.getElementById("syncStatus");

// Save quotes locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// REQUIRED FUNCTION (kept from previous tasks)
function displayRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <small>${quote.category}</small>
  `;
}

// REQUIRED FUNCTION
function showRandomQuote() {
  displayRandomQuote();
}

// --------------------
// SERVER SYNC LOGIC
// --------------------

// Fetch quotes from server (simulation)
async function fetchServerQuotes() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  // Convert mock posts to quote format
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server"
  }));
}

// Compare local vs server data
function hasConflict(serverQuotes) {
  return JSON.stringify(serverQuotes) !== JSON.stringify(quotes);
}

// Sync with server (SERVER WINS)
async function syncWithServer() {
  try {
    const serverQuotes = await fetchServerQuotes();

    if (hasConflict(serverQuotes)) {
      quotes = serverQuotes;
      saveQuotes();
      notifyUser("⚠️ Conflict detected. Server data applied.");
      displayRandomQuote();
    } else {
      notifyUser("✅ Data already in sync.");
    }
  } catch (error) {
    notifyUser("❌ Sync failed. Please try again.");
  }
}

// Manual sync option
function manualSync() {
  syncWithServer();
}

// Periodic sync every 30 seconds
setInterval(syncWithServer, 30000);

// --------------------
// USER NOTIFICATIONS
// --------------------
function notifyUser(message) {
  syncStatus.innerHTML = "";
  const msg = document.createElement("p");
  msg.textContent = message;
  syncStatus.appendChild(msg);
}

// --------------------
// INITIAL LOAD
// --------------------
displayRandomQuote();
syncWithServer();
