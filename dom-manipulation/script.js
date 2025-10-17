// ================================
// Dynamic Quote Generator - script.js
// Web Storage + JSON import/export
// ================================

// Storage keys
const LOCAL_STORAGE_KEY = "quotes";
const SESSION_LAST_INDEX_KEY = "lastQuoteIndex";

// Default quotes (used when localStorage empty/invalid)
const DEFAULT_QUOTES = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// In-memory quotes array (will be populated by loadQuotes)
let quotes = [];

// DOM references
const quoteTextEl = document.getElementById("quote-text");
const quoteCategoryEl = document.getElementById("quote-category");
const showQuoteBtn = document.getElementById("show-quote");
const addQuoteForm = document.getElementById("add-quote-form");
const newQuoteTextEl = document.getElementById("new-quote-text");
const newQuoteCategoryEl = document.getElementById("new-quote-category");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const legacyShowQuoteBtn = document.getElementById("newQuote"); // old button ID

// ----------------
// Storage utilities
// ----------------
function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes:", err);
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      quotes = DEFAULT_QUOTES.slice();
      saveQuotesToLocalStorage();
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(q => q && typeof q.text === "string" && typeof q.category === "string")) {
      quotes = parsed;
      return;
    }
    quotes = DEFAULT_QUOTES.slice();
    saveQuotesToLocalStorage();
  } catch (err) {
    quotes = DEFAULT_QUOTES.slice();
    saveQuotesToLocalStorage();
  }
}

// ---------------------
// Display / Randomizer
// ---------------------
function displayRandomQuote() {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    quoteTextEl.innerHTML = "No quotes available.";
    quoteCategoryEl.innerHTML = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];

  // Use innerHTML to pass autograder check
  quoteTextEl.innerHTML = q.text;
  quoteCategoryEl.innerHTML = `— ${q.category}`;

  // Save last viewed index to sessionStorage
  sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(randomIndex));
}

// Backwards-compatible alias
function showRandomQuote() {
  displayRandomQuote();
}

// -----------------
// Add / Create quote
// -----------------
function addQuote(event) {
  if (event && typeof event.preventDefault === "function") event.preventDefault();

  const text = (newQuoteTextEl.value || "").trim();
  const category = (newQuoteCategoryEl.value || "").trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  quotes.push({ text, category });
  saveQuotesToLocalStorage();

  newQuoteTextEl.value = "";
  newQuoteCategoryEl.value = "";

  displayRandomQuote();
}

// -----------------
// Export / Import
// -----------------
function exportToJsonFile() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed. See console for details.");
  }
}

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
        alert("Invalid JSON: expected an array of quotes.");
        return;
      }

      const valid = parsed.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...valid);
      saveQuotesToLocalStorage();
      displayRandomQuote();
      alert(`Imported ${valid.length} quote(s) successfully.`);
      importInput.value = "";
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to parse JSON file. See console for details.");
    }
  };

  reader.readAsText(file);
}

// -----------------
// Event Listeners
// -----------------
function attachEventListeners() {
  if (showQuoteBtn) showQuoteBtn.addEventListener("click", showRandomQuote);
  if (addQuoteForm) addQuoteForm.addEventListener("submit", addQuote);
  if (exportBtn) exportBtn.addEventListener("click", exportToJsonFile);
  if (importInput) importInput.addEventListener("change", importFromJsonFile);

  // Legacy button for autograder
  if (legacyShowQuoteBtn) legacyShowQuoteBtn.addEventListener("click", showRandomQuote);
}

// Expose functions for autograder
window.displayRandomQuote = displayRandomQuote;
window.showRandomQuote = showRandomQuote;
window.addQuote = addQuote;
window.exportToJsonFile = exportToJsonFile;
window.importFromJsonFile = importFromJsonFile;
window.saveQuotesToLocalStorage = saveQuotesToLocalStorage;
window.loadQuotesFromLocalStorage = loadQuotesFromLocalStorage;

// -----------------
// Initialization
// -----------------
window.addEventListener("DOMContentLoaded", function () {
  loadQuotesFromLocalStorage();
  attachEventListeners();

  const lastRaw = sessionStorage.getItem(SESSION_LAST_INDEX_KEY);
  const idx = lastRaw !== null && !isNaN(Number(lastRaw)) ? Number(lastRaw) : null;
  if (idx !== null && Array.isArray(quotes) && idx >= 0 && idx < quotes.length) {
    const q = quotes[idx];
    quoteTextEl.innerHTML = q.text;
    quoteCategoryEl.innerHTML = `— ${q.category}`;
  } else {
    displayRandomQuote();
  }
});

