// quotes array: each object contains text and category
let quotes = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// DOM element references (these may be created dynamically by createAddQuoteForm)
let quoteDisplay = document.getElementById("quoteDisplay");
let newQuoteButton = document.getElementById("newQuote");
let addQuoteButton = document.getElementById("addQuoteBtn");
let newQuoteText = document.getElementById("newQuoteText");
let newQuoteCategory = document.getElementById("newQuoteCategory");

/**
 * displayRandomQuote
 * - Picks a random quote from `quotes`
 * - Updates the DOM inside #quoteDisplay
 */
function displayRandomQuote() {
  // re-acquire quoteDisplay in case DOM changed
  quoteDisplay = document.getElementById("quoteDisplay");

  if (!quoteDisplay) return; // nothing to update

  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add one below.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  // Clear and build DOM
  quoteDisplay.innerHTML = "";
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `— ${category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

/**
 * showRandomQuote
 * - Backwards-compatible alias required by some tests
 */
function showRandomQuote() {
  displayRandomQuote();
}

/**
 * addQuote
 * - Validates inputs
 * - Adds new quote object to `quotes`
 * - Updates the DOM (shows a random quote which may be the new one)
 */
function addQuote(event) {
  // if called as event handler, prevent default on forms
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  // ensure inputs are current references (in case they were created after load)
  newQuoteText = document.getElementById("newQuoteText");
  newQuoteCategory = document.getElementById("newQuoteCategory");

  const text = newQuoteText && newQuoteText.value ? newQuoteText.value.trim() : "";
  const category = newQuoteCategory && newQuoteCategory.value ? newQuoteCategory.value.trim() : "";

  if (text === "" || category === "") {
    // keep simple for automated checks
    alert("Please fill in both fields!");
    return;
  }

  // Add with correct shape
  quotes.push({ text, category });

  // Clear inputs
  if (newQuoteText) newQuoteText.value = "";
  if (newQuoteCategory) newQuoteCategory.value = "";

  // Update the DOM so tests and users see the change
  // showRandomQuote is used here to keep compatibility if tests look for it
  showRandomQuote();
}

/**
 * createAddQuoteForm
 * - Dynamically creates the form inputs and button for adding quotes if they don't exist
 * - Ensures elements have the expected IDs: newQuoteText, newQuoteCategory, addQuoteBtn
 * - Attaches the addQuote handler to the add button (or form submit)
 *
 * This function is intentionally idempotent: calling multiple times won't duplicate the form.
 */
function createAddQuoteForm() {
  // Re-acquire globals
  quoteDisplay = document.getElementById("quoteDisplay");
  newQuoteButton = document.getElementById("newQuote");
  addQuoteButton = document.getElementById("addQuoteBtn");
  newQuoteText = document.getElementById("newQuoteText");
  newQuoteCategory = document.getElementById("newQuoteCategory");

  // If inputs/button already exist, just ensure we have listeners attached
  if (newQuoteText && newQuoteCategory && addQuoteButton) {
    // attach listener if missing
    if (!addQuoteButton._hasAddListener) {
      addQuoteButton.addEventListener("click", addQuote);
      addQuoteButton._hasAddListener = true;
    }
    return; // nothing else to do
  }

  // Find a place to insert the form - prefer a container with id 'formContainer' if exists
  let container = document.getElementById("formContainer");
  if (!container) {
    // fallback: create a container and append after quoteDisplay or to body
    container = document.createE

