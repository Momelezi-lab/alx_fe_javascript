// quotes array: each object contains text and category
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// DOM element references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteButton = document.getElementById("addQuoteBtn");
const newQuoteText = document.getElementById("newQuoteText");
const newQuoteCategory = document.getElementById("newQuoteCategory");

/**
 * displayRandomQuote
 * - Selects a random quote from `quotes`
 * - Updates the DOM inside #quoteDisplay
 */
function displayRandomQuote() {
  // handle empty array
  if (!quotes || quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add one below.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  // Build and insert DOM nodes
  quoteDisplay.innerHTML = ""; // clear previous
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `— ${category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

/**
 * addQuote
 * - Validates inputs
 * - Adds new quote object to `quotes`
 * - Updates the DOM (calls displayRandomQuote)
 */
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (text === "" || category === "") {
    // keep simple for tests (no custom UI required)
    alert("Please fill in both fields!");
    return;
  }

  // Push new quote into the array with the correct shape
  quotes.push({ text, category });

  // Clear inputs
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Update the DOM so tests (and users) see the new quote immediately
  displayRandomQuote();
}

// Event listeners
newQuoteButton.addEventListener("click", displayRandomQuote);
addQuoteButton.addEventListener("click", addQuote);

// Show an initial random quote on load so page doesn't start empty
window.addEventListener("DOMContentLoaded", displayRandomQuote);

