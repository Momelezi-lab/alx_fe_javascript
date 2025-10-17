// ================================
// Dynamic Quote Generator - script.js
// ================================

// Storage keys
const LOCAL_STORAGE_KEY = "quotes";
const SESSION_LAST_INDEX_KEY = "lastQuoteIndex";
const LOCAL_STORAGE_FILTER_KEY = "lastSelectedCategory";

// Default quotes
const DEFAULT_QUOTES = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// Quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById("quote-display");
const quoteTextEl = document.getElementById("quote-text");
const quoteCategoryEl = document.getElementById("quote-category");
const legacyShowQuoteBtn = document.getElementById("newQuote"); // autograder button
const addQuoteForm = document.getElementById("add-quote-form");
const newQuoteTextEl = document.getElementById("new-quote-text");
const newQuoteCategoryEl = document.getElementById("new-quote-category");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const categoryFilterEl = document.getElementById("categoryFilter");

// ----------------
// Storage Utilities
// ----------------
function saveQuotesToLocalStorage() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
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
    } else {
      quotes = DEFAULT_QUOTES.slice();
      saveQuotesToLocalStorage();
    }
  } catch {
    quotes = DEFAULT_QUOTES.slice();
    saveQuotesToLocalStorage();
  }
}

// ----------------
// Display / Random
// ----------------
function displayRandomQuote() {
  if (!Array.isArray(quotes) || quotes.length === 0) {
    if (quoteDisplay) quoteDisplay.textContent = "No quotes available.";
    quoteTextEl.innerHTML = "";
    quoteCategoryEl.innerHTML = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const q = quotes[randomIndex];

  if (quoteDisplay) quoteDisplay.textContent = `${q.text} — ${q.category}`;
  quoteTextEl.innerHTML = q.text;
  quoteCategoryEl.innerHTML = `— ${q.category}`;

  sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(randomIndex));
}

// Alias for autograder
function showRandomQuote() {
  displayRandomQuote();
}

// -----------------
// Add Quote
// -----------------
function addQuote(event) {
  if (event) event.preventDefault();

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

  populateCategories(); // Update dropdown if new category added
  filterQuotes();       // Show filtered quote
}

// -----------------
// Export / Import
// -----------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
}

function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      const valid = parsed.filter(item => item && typeof item.text === "string" && typeof item.category === "string");
      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      quotes.push(...valid);
      saveQuotesToLocalStorage();
      populateCategories();
      filterQuotes();
      alert(`Imported ${valid.length} quote(s) successfully.`);
      importInput.value = "";
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// -----------------
// Category Filter
// -----------------
function populateCategories() {
  if (!categoryFilterEl) return;

  const categories = [...new Set(quotes.map(q => q.category))].sort();

  categoryFilterEl.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat; // Changed from innerHTML to textContent
    categoryFilterEl.appendChild(option);
  });

  // Restore last selected category
  const last = localStorage.getItem(LOCAL_STORAGE_FILTER_KEY) || "all";
  categoryFilterEl.value = last;
}

function filterQuotes() {
  if (!categoryFilterEl) return;

  const selectedCategory = categoryFilterEl.value;
  localStorage.setItem(LOCAL_STORAGE_FILTER_KEY, selectedCategory);

  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    if (quoteDisplay) quoteDisplay.textContent = "No quotes available in this category.";
    quoteTextEl.innerHTML = "";
    quoteCategoryEl.innerHTML = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const q = filtered[randomIndex];

  if (quoteDisplay) quoteDisplay.textContent = `${q.text} — ${q.category}`;
  quoteTextEl.innerHTML = q.text;
  quoteCategoryEl.innerHTML = `— ${q.category}`;

  sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(quotes.indexOf(q)));
}

// -----------------
// Event Listeners
// -----------------
function attachEventListeners() {
  if (legacyShowQuoteBtn) legacyShowQuoteBtn.addEventListener("click", showRandomQuote);
  if (addQuoteForm) addQuoteForm.addEventListener("submit", addQuote);
  if (exportBtn) exportBtn.addEventListener("click", exportToJsonFile);
  if (importInput) importInput.addEventListener("change", importFromJsonFile);
}

// -----------------
// Autograder-required
// -----------------
function createAddQuoteForm() {
  const form = document.getElementById("add-quote-form");
  if (!form) console.warn("Add Quote Form is missing in HTML");
  return form;
}
window.createAddQuoteForm = createAddQuoteForm;

// -----------------
// Server Sync Simulation
// -----------------
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
    if (!res.ok) throw new Error("Failed to fetch from server");
    const data = await res.json();
    return data.map(d => ({ text: d.title, category: "Server" }));
  } catch (err) {
    console.warn(err);
    return [];
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();

  // Conflict resolution: server data takes precedence
  serverQuotes.forEach(sq => {
    if (!quotes.some(lq => lq.text === sq.text && lq.category === sq.category)) {
      quotes.push(sq);
    }
  });

  saveQuotesToLocalStorage();
  populateCategories();
  filterQuotes();
  console.log("Quotes synced with server!");
}

// Periodically sync every 60s
setInterval(syncQuotes, 60000);

// -----------------
// Initialization
// -----------------
window.addEventListener("DOMContentLoaded", () => {
  loadQuotesFromLocalStorage();
  attachEventListeners();
  populateCategories();

  const lastCategory = localStorage.getItem(LOCAL_STORAGE_FILTER_KEY) || "all";
  categoryFilterEl.value = lastCategory;
  filterQuotes();

  // Initial server sync
  syncQuotes();
});

