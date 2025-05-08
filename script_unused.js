// ===========================
// Deck State & Selections
// ===========================
let fullDeck = [];
let drawPile = [];
let discardPile = [];
let lostPile = [];
let hand = [];

let selectedCardIndexes = new Set();
let selectedDiscardIndexes = new Set();
let selectedLostIndexes = new Set();
let selectedDeckIndexes = new Set();

const dummyDeck = [
  // Aria
  ...Array(2).fill({ name: "Quick Shot", character: "Aria", type: "Attack", category: "Skill", power: 2, range: 3, description: "Aria's arrow" }),
  { name: "Piercing Arrow", character: "Aria", type: "Attack", category: "Skill", power: 4, range: 2, description: "Ignores armor" },
  { name: "Volley", character: "Aria", type: "Attack", category: "Skill", power: 3, range: 2, description: "Area damage" },
  { name: "Focus", character: "Aria", type: "Buff", category: "Skill", power: 0, range: 0, description: "Boost next attack" },
  ...Array(2).fill({ name: "Dodge", character: "Aria", type: "Utility", category: "Skill", power: 0, range: 0, description: "Evade attack" }),
  { name: "Evasive Roll", character: "Aria", type: "Utility", category: "Skill", power: 0, range: 0, description: "Quick reposition" },
  { name: "Eagle Eye", character: "Aria", type: "Buff", category: "Skill", power: 0, range: 0, description: "Increase range." },

  // Drex
  ...Array(3).fill({ name: "Cleave", character: "Drex", type: "Attack", category: "Skill", power: 4, range: 1, description: "Wide slash" }),
  { name: "Shield Up", character: "Drex", type: "Defense", category: "Skill", power: 0, range: 0, description: "Gain armor" },
  { name: "Shield Bash", character: "Drex", type: "Attack", category: "Skill", power: 3, range: 1, description: "Stun attack" },
  { name: "Heavy Strike", character: "Drex", type: "Attack", category: "Skill", power: 6, range: 1, description: "Slow but strong" },
  ...Array(3).fill({ name: "Taunt", character: "Drex", type: "Utility", category: "Skill", power: 0, range: 1, description: "Draw aggro" }),
  ...Array(3).fill({ name: "Shield Up", character: "Drex", type: "Defense", category: "Skill", power: 0, range: 0, description: "Gain armor" }),

  // Mira
  ...Array(3).fill({ name: "Frost Bolt", character: "Mira", type: "Magic", category: "Spell", power: 3, range: 3, description: "Chill spell" }),
  ...Array(3).fill({ name: "Arcane Blast", character: "Mira", type: "Magic", category: "Spell", power: 5, range: 2, description: "High damage" }),
  ...Array(3).fill({ name: "Mana Shield", character: "Mira", type: "Defense", category: "Spell", power: 0, range: 0, description: "Absorb hit" }),
  ...Array(2).fill({ name: "Meditate", character: "Mira", type: "Buff", category: "Spell", power: 0, range: 0, description: "Recover energy" }),

  // Items
  ...Array(3).fill({ name: "Healing Potion", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Restore health" }),
  ...Array(3).fill({ name: "Smoke Bomb", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Create cover" }),
  ...Array(3).fill({ name: "Power Stone", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Buff attack" })
];

// ===========================
// Utility Functions
// ===========================
function shuffle(array) {
  const clone = array.slice();
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function showBanner(message, type = "info", duration = 3000) {
  const bannerContainer = document.getElementById("bannerContainer");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show mx-auto mb-2 text-center`;
  alert.setAttribute("role", "alert");
  alert.style.transition = "opacity 0.5s ease-in-out";
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  bannerContainer.appendChild(alert);
  setTimeout(() => {
    alert.classList.remove("show");
    alert.classList.add("fade");
    setTimeout(() => alert.remove(), 500);
  }, duration);
}

// ===========================
// Game Logic
// ===========================
function startGame() {
  fullDeck = dummyDeck.slice();
  drawPile = shuffle(fullDeck);
  discardPile = [];
  lostPile = [];
  hand = [];
  for (let i = 0; i < 7; i++) {
    if (drawPile.length > 0) hand.push(drawPile.shift());
  }
  toggleControls(true);
  updateUI();
  showBanner("Game started! 7 cards drawn.", "primary");
}

function resetGame() {
  fullDeck = [];
  drawPile = [];
  discardPile = [];
  lostPile = [];
  hand = [];
  selectedCardIndexes.clear();
  selectedDiscardIndexes.clear();
  selectedLostIndexes.clear();
  selectedDeckIndexes.clear();
  toggleControls(false);
  updateUI();
  showBanner("Game reset.", "danger");
}

function drawCard() {
  if (drawPile.length === 0 && discardPile.length > 0) {
    drawPile = shuffle(discardPile);
    discardPile = [];
    alert("Deck empty. Reshuffling discard pile.");
  }
  if (drawPile.length === 0) {
    alert("No cards left to draw!");
    return;
  }
  hand.push(drawPile.shift());
  updateUI();
  showBanner("Card drawn!", "success");
}

function shuffleDeck() {
  drawPile = shuffle(drawPile);
  updateUI();
  showBanner("Deck shuffled!", "warning");
}

function toggleControls(enabled) {
  document.getElementById("startBtn").disabled = enabled;
  document.getElementById("drawBtn").disabled = !enabled;
  document.getElementById("shuffleBtn").disabled = !enabled;
  document.getElementById("discardSelectedBtn").disabled = !enabled;
  document.getElementById("lostSelectedBtn").disabled = !enabled;
  document.getElementById("searchDeckBtn").disabled = !enabled;
}

// ===========================
// Initialize
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("drawBtn").addEventListener("click", drawCard);
  document.getElementById("resetBtn").addEventListener("click", resetGame);
  document.getElementById("shuffleBtn").addEventListener("click", shuffleDeck);

  document.getElementById("discardSelectedBtn").addEventListener("click", () => {
    hand = hand.filter((_, i) => {
      if (selectedCardIndexes.has(i)) {
        discardPile.push(hand[i]);
        return false;
      }
      return true;
    });
    selectedCardIndexes.clear();
    updateUI();
    showBanner("Cards moved to discard.", "secondary");
  });

  document.getElementById("lostSelectedBtn").addEventListener("click", () => {
    hand = hand.filter((_, i) => {
      if (selectedCardIndexes.has(i)) {
        lostPile.push(hand[i]);
        return false;
      }
      return true;
    });
    selectedCardIndexes.clear();
    updateUI();
    showBanner("Cards lost.", "dark");
  });

  document.getElementById("discardToHandBtn").addEventListener("click", () => {
    discardPile = discardPile.filter((card, i) => {
      if (selectedDiscardIndexes.has(i)) {
        hand.push(card);
        return false;
      }
      return true;
    });
    selectedDiscardIndexes.clear();
    updateUI();
    showBanner("Returned to hand.", "success");
  });

  document.getElementById("discardToDeckBtn").addEventListener("click", () => {
    discardPile = discardPile.filter((card, i) => {
      if (selectedDiscardIndexes.has(i)) {
        drawPile.unshift(card);
        return false;
      }
      return true;
    });
    selectedDiscardIndexes.clear();
    updateUI();
    showBanner("Sent to deck.", "primary");
  });

  document.getElementById("lostToHandBtn").addEventListener("click", () => {
    lostPile = lostPile.filter((card, i) => {
      if (selectedLostIndexes.has(i)) {
        hand.push(card);
        return false;
      }
      return true;
    });
    selectedLostIndexes.clear();
    updateUI();
    showBanner("Returned to hand.", "success");
  });

  document.getElementById("lostToDeckBtn").addEventListener("click", () => {
    lostPile = lostPile.filter((card, i) => {
      if (selectedLostIndexes.has(i)) {
        drawPile.unshift(card);
        return false;
      }
      return true;
    });
    selectedLostIndexes.clear();
    updateUI();
    showBanner("Sent to deck.", "primary");
  });

  document.getElementById("searchDeckBtn").addEventListener("click", () => {
    document.getElementById("deckSearchContainer").classList.remove("d-none");
    showBanner("Browsing deck...", "info");
  });

  document.getElementById("closeDeckSearchBtn").addEventListener("click", () => {
    document.getElementById("deckSearchContainer").classList.add("d-none");
    selectedDeckIndexes.clear();
    updateUI();
  });

  document.getElementById("deckToHandBtn").addEventListener("click", () => {
    drawPile = drawPile.filter((card, i) => {
      if (selectedDeckIndexes.has(i)) {
        hand.push(card);
        return false;
      }
      return true;
    });
    selectedDeckIndexes.clear();
    updateUI();
    showBanner("Selected cards added to hand.", "success");
  });

  updateUI();
});
