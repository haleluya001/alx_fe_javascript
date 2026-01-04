// Quotes array
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "JavaScript is the language of the web.", category: "Programming" },
  { text: "Success is not final, failure is not fatal.", category: "Motivation" }
];

let selectedCategory = "All";

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryContainer = document.getElementById("categoryContainer");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// Display random quote
function showRandomQuote() {
  let filteredQuotes = quotes;

  if (selectedCategory !== "All") {
    filteredQuotes = quotes.filter(
      quote => quote.category === selectedCategory
    );
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}"`;
}

// Create category buttons dynamically
function renderCategories() {
  categoryContainer.innerHTML = "";

  const categories = ["All", ...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category;

    button.addEventListener("click", () => {
      selectedCategory = category;
      showRandomQuote();
    });

    categoryContainer.appendChild(button);
  });
}

// Add new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({
    text: quoteText,
    category: quoteCategory
  });

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  renderCategories();
  showRandomQuote();
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Initial render
renderCategories();
showRandomQuote();
