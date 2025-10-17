// Local / Session storage keys
const STORAGE_KEY = "quotes";
const SESSION_LAST_INDEX_KEY = "lastViewedQuoteIndex";

// Default quotes (used when localStorage is empty or invalid)
const DEFAULT_QUOTES = [
  { text: "The best way to predict the future is to invent it.", category: "Inspiration" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" }
];

// In-memory quotes array (will be loaded from localStorage on init)
let quotes = [];

// DOM element references (may be created dynamically)
let quoteDisplay = null;
let newQuoteButton = null;
let addQuoteButton = null;
let newQuoteText = null;
let newQuoteCategory = null;
let exportButton = null;
let importFileInput = null;

/**
 * saveQuotes
 * - Serializes `quotes` to localStorage
 */
function saveQuotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    // localStorage might be full or unavailable; for tests this is fine to ignore
    console.error("Failed to save quotes to localStorage:", err);
  }
}

/**
 * loadQuotes
 * - Loads `quotes` from localStorage if present and valid
 * - Falls back to DEFAULT_QUOTES if invalid or absent
 */
function loadQuotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
      return;
    }

    const parsed = JSON.parse(raw);
    // Validate: must be an array of objects with text & category strings
    if (Array.isArray(parsed) && parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string")) {
      quotes = parsed;
      return;
    } else {
      // invalid format — reset to defaults
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
      return;
    }
  } catch (err) {
    console.warn("Error loading quotes; falling back to defaults.", err);
    quotes = DEFAULT_QUOTES.slice();
    saveQuotes();
  }
}

/**
 * displayRandomQuote
 * - Picks a random quote from `quotes`
 * - Updates the DOM inside #quoteDisplay
 * - Stores the last viewed index in sessionStorage
 */
function displayRandomQuote() {
  quoteDisplay = document.getElementById("quoteDisplay");
  if (!quoteDisplay) return;

  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add one below.</p>";
    return;
  }

  // Try to restore last index if present in sessionStorage
  const lastIndexRaw = sessionStorage.getItem(SESSION_LAST_INDEX_KEY);
  let randomIndex;
  if (lastIndexRaw !== null && !isNaN(Number(lastIndexRaw))) {
    // If last index exists, show the next random index (or reuse it).
    // For typical behavior, choose a new random index.
    randomIndex = Math.floor(Math.random() * quotes.length);
  } else {
    randomIndex = Math.floor(Math.random() * quotes.length);
  }

  const { text, category } = quotes[randomIndex];

  // Update DOM
  quoteDisplay.innerHTML = "";
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `— ${category}`;

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  // Save last viewed index in sessionStorage (session-only)
  try {
    sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(randomIndex));
  } catch (err) {
    // ignore sessionStorage errors for tests
    console.warn("Could not write to sessionStorage:", err);
  }
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
 * - Saves to localStorage and updates the DOM
 */
function addQuote(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();

  // Ensure latest references
  newQuoteText = document.getElementById("newQuoteText");
  newQuoteCategory = document.getElementById("newQuoteCategory");

  const text = newQuoteText && newQuoteText.value ? newQuoteText.value.trim() : "";
  const category = newQuoteCategory && newQuoteCategory.value ? newQuoteCategory.value.trim() : "";

  if (text === "" || category === "") {
    alert("Please fill in both fields!");
    return;
  }

  // push with correct shape
  quotes.push({ text, category });

  // persist
  saveQuotes();

  // clear inputs
  if (newQuoteText) newQuoteText.value = "";
  if (newQuoteCategory) newQuoteCategory.value = "";

  // show the newly added quote (or a random one)
  displayRandomQuote();
}

/**
 * exportToJson
 * - Exports current `quotes` to a downloadable JSON file
 */
function exportToJson() {
  try {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    // cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1000);
  } catch (err) {
    console.error("Failed to export quotes:", err);
    alert("Export failed. See console for details.");
  }
}

/**
 * importFromJsonFile
 * - Reads a JSON file from a file input change event
 * - Validates structure, merges into quotes array, saves, and updates DOM
 *
 * Behavior: merges valid quotes (objects with text & category) into the existing array.
 * If you want to replace the current quotes entirely, change the merge logic accordingly.
 */
function importFromJsonFile(event) {
  const file = event && event.target && event.target.files && event.target.files[0];
  if (!file) {
    alert("No file selected.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!Array.isArray(parsed)) {
        alert("Invalid JSON format. Expected an array of quote objects.");
        return;
      }

      // Validate items and collect valid ones
      const valid = parsed.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (valid.length === 0) {
        alert("No valid quotes found in file. Each quote must have text and category properties.");
        return;
      }

      // Merge: push valid items into quotes
      quotes.push(...valid);

      // Persist and update DOM
      saveQuotes();
      displayRandomQuote();

      alert(`Imported ${valid.length} quote(s) successfully.`);
      // Clear the input so the same file can be imported again if needed
      if (importFileInput) importFileInput.value = "";
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to parse JSON file. Ensure it is valid JSON.");
    }
  };

  reader.readAsText(file);
}

/**
 * createAddQuoteForm
 * - Ensures the add-quote inputs, add button, export button, and import file input exist
 * - Attaches event listeners where needed
 * - Idempotent: won't duplicate UI or listeners
 */
function createAddQuoteForm() {
  // Re-acquire references (in case index.html already included them)
  quoteDisplay = document.getElementById("quoteDisplay");
  newQuoteButton = document.getElementById("newQuote");
  addQuoteButton = document.getElementById("addQuoteBtn");
  newQuoteText = document.getElementById("newQuoteText");
  newQuoteCategory = document.getElementById("newQuoteCategory");
  exportButton = document.getElementById("exportBtn");
  importFileInput = document.getElementById("importFile");

  // Ensure form container exists (index.html includes one already, but create if missing)
  let container = document.getElementById("formContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "formContainer";
    container.style.marginTop = "12px";
    document.body.appendChild(container);
  }

  // Create missing inputs/buttons (only if not present)
  if (!newQuoteText) {
    newQuoteText = document.createElement("input");
    newQuoteText.type = "text";
    newQuoteText.id = "newQuoteText";
    newQuoteText.placeholder = "Enter a new quote";
    container.appendChild(newQuoteText);
  }

  if (!newQuoteCategory) {
    newQuoteCategory = document.createElement("input");
    newQuoteCategory.type = "text";
    newQuoteCategory.id = "newQuoteCategory";
    newQuoteCategory.placeholder = "Enter quote category";
    container.appendChild(newQuoteCategory);
  }

  if (!addQuoteButton) {
    addQuoteButton = document.createElement("button");
    addQuoteButton.type = "button";
    addQuoteButton.id = "addQuoteBtn";
    addQuoteButton.textContent = "Add Quote";
    container.appendChild(addQuoteButton);
  }

  if (!exportButton) {

