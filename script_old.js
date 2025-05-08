// --- Deck state ---
let fullDeck = [];
let drawPile = [];
let discardPile = [];
let lostPile = [];
let hand = [];

let selectedCardIndexes = new Set(); // holds indexes of selected cards in `hand`
let selectedDiscardIndexes = new Set();
let selectedLostIndexes = new Set();
let selectedDeckIndexes = new Set();


// --- Dummy deck: 3 characters (33 cards) + 9 items ---
const dummyDeck = [
    // Aria (11 cards)
    ...Array(2).fill({ name: "Quick Shot", character: "Aria", type: "Attack", category: "Skill", power: 2, range: 3, description: "Aria's arrow" }),
    { name: "Piercing Arrow", character: "Aria", type: "Attack", category: "Skill", power: 4, range: 2, description: "Ignores armor" },
    { name: "Volley", character: "Aria", type: "Attack", category: "Skill", power: 3, range: 2, description: "Area damage" },
    { name: "Focus", character: "Aria", type: "Buff", category: "Skill", power: 0, range: 0, description: "Boost next attack" },
    ...Array(2).fill({ name: "Dodge", character: "Aria", type: "Utility", category: "Skill", power: 0, range: 0, description: "Evade attack" }),
    { name: "Evasive Roll", character: "Aria", type: "Utility", category: "Skill", power: 0, range: 0, description: "Quick reposition" },

    // Drex (11 cards)
    ...Array(3).fill({ name: "Cleave", character: "Drex", type: "Attack", category: "Skill", power: 4, range: 1, description: "Wide slash" }),
    { name: "Shield Up", character: "Drex", type: "Defense", category: "Skill", power: 0, range: 0, description: "Gain armor" },
    { name: "Shield Bash", character: "Drex", type: "Attack", category: "Skill", power: 3, range: 1, description: "Stun attack" },
    { name: "Heavy Strike", character: "Drex", type: "Attack", category: "Skill", power: 6, range: 1, description: "Slow but strong" },
    ...Array(3).fill({ name: "Taunt", character: "Drex", type: "Utility", category: "Skill", power: 0, range: 1, description: "Draw aggro" }),
    ...Array(5).fill({ name: "Shield Up", character: "Drex", type: "Defense", category: "Skill", power: 0, range: 0, description: "Gain armor" }),

    // Mira (11 cards)
    ...Array(3).fill({ name: "Frost Bolt", character: "Mira", type: "Magic", category: "Spell", power: 3, range: 3, description: "Chill spell" }),
    ...Array(3).fill({ name: "Arcane Blast", character: "Mira", type: "Magic", category: "Spell", power: 5, range: 2, description: "High damage" }),
    ...Array(3).fill({ name: "Mana Shield", character: "Mira", type: "Defense", category: "Spell", power: 0, range: 0, description: "Absorb hit" }),
    ...Array(2).fill({ name: "Meditate", character: "Mira", type: "Buff", category: "Spell", power: 0, range: 0, description: "Recover energy" }),

    // Items (9 total)
    ...Array(3).fill({ name: "Healing Potion", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Restore health" }),
    ...Array(3).fill({ name: "Smoke Bomb", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Create cover" }),
    ...Array(2).fill({ name: "Power Stone", character: "Item", type: "Item", category: "Consumable", power: 0, range: 0, description: "Buff attack" })
];


// --- Utility functions ---
function shuffle(array) {
    const clone = array.slice();
    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
}


function updateUI() {
    updateCountDisplays();
    renderHand();
    renderList("discardList", discardPile, selectedDiscardIndexes, updateActionButtons);
    renderList("lostList", lostPile, selectedLostIndexes, updateActionButtons);
    renderList("deckList", drawPile, selectedDeckIndexes, updateDeckSearchButton);
    updateSelectionButtons();
    updateActionButtons();
    updateDeckSearchButton();
}

function updateCountDisplays() {
    document.getElementById("deckCount").textContent = `Deck: ${drawPile.length} cards`;
    document.getElementById("discardCount").textContent = `Discard: ${discardPile.length} cards`;
    document.getElementById("lostCount").textContent = `Lost: ${lostPile.length} cards`;
}

function renderHand() {
    const handContainer = document.getElementById("handContainer");
    handContainer.innerHTML = "";
    hand.forEach((card, index) => {
        const selected = selectedCardIndexes.has(index);
        const cardEl = document.createElement("div");
        const trainers = card.type?.toLowerCase() === "item" || card.type?.toLowerCase() === "trainer";

        cardEl.className = `card card-hand p-2 border rounded text-start card-type-${card.type.toLowerCase()} ${selected ? 'border-4 border-primary' : ''}`;
        cardEl.style.cursor = "pointer";
        cardEl.innerHTML = `
        <div class="text-center fw-bold mb-1">${card.character || "???"}</div>
        ${!trainers ? `<div class="text-center text-muted small mb-1 "> ${card.type || "???"} ${card.category} </div>` : ""}
        <div class="text-center fw-bold mb-1">${card.name}</div>
        <div class="card-description mb-1">${card.description}</div>
        <div class="card-footer text-center small">
            ${!trainers ? `Power: ${card.power} | Range: ${card.range}` : "&nbsp;"}
        </div>
      `;
        cardEl.addEventListener("click", () => {
            if (selectedCardIndexes.has(index)) {
                selectedCardIndexes.delete(index);
            } else {
                selectedCardIndexes.add(index);
            }
            updateUI();
        });
        handContainer.appendChild(cardEl);
    });
}

function renderList(listId, pile, selectedSet, onChangeCallback) {
    const list = document.getElementById(listId);
    list.innerHTML = "";

    pile.forEach((card, index) => {
        const checked = selectedSet.has(index) ? "checked" : "";
        const li = document.createElement("li");
        li.className = "list-group-item d-flex align-items-center gap-2";
        li.innerHTML = `
        <input type="checkbox" data-index="${index}" ${checked}>
        <span><strong>${card.character}</strong> — ${card.name}</span>
      `;
        list.appendChild(li);
    });

    list.querySelectorAll("input[type=checkbox]").forEach(input => {
        input.addEventListener("change", () => {
            const index = parseInt(input.dataset.index);
            if (input.checked) selectedSet.add(index);
            else selectedSet.delete(index);
            onChangeCallback();
        });
    });
}



function updateSelectionButtons() {
    const discardBtn = document.getElementById("discardSelectedBtn");
    const lostBtn = document.getElementById("lostSelectedBtn");
    const count = selectedCardIndexes.size;

    discardBtn.disabled = count === 0;
    lostBtn.disabled = count === 0;
    discardBtn.textContent = `Discard (${count})`;
    lostBtn.textContent = `Lost (${count})`;
}

function updateActionButtons() {
    document.getElementById("discardToHandBtn").disabled = selectedDiscardIndexes.size === 0;
    document.getElementById("discardToDeckBtn").disabled = selectedDiscardIndexes.size === 0;
    document.getElementById("lostToHandBtn").disabled = selectedLostIndexes.size === 0;
    document.getElementById("lostToDeckBtn").disabled = selectedLostIndexes.size === 0;
}

function updateDeckSearchButton() {
    document.getElementById("deckToHandBtn").disabled = selectedDeckIndexes.size === 0;
}


// --- Game logic ---
function loadSavedDeck() {
    const savedDeck = localStorage.getItem('preparedDeck');
    if (!savedDeck) {
      alert("No prepared deck found.");
      window.location.href = "build.html";
      return false;
    }
    fullDeck = JSON.parse(savedDeck);
    return true;
  }

function startGame() {
    const savedDeck = localStorage.getItem('preparedDeck');
    if (!loadSavedDeck()) return;
    // fullDeck = dummyDeck.slice(); // Clone
    drawPile = shuffle(fullDeck);
    discardPile = [];
    lostPile = [];
    hand = [];
    // Draw 7
    for (let i = 0; i < 7; i++) {
        if (drawPile.length > 0) {
            hand.push(drawPile.shift());
        }
    }

    document.getElementById("startBtn").disabled = true;
    document.getElementById("drawBtn").disabled = false;
    document.getElementById("shuffleBtn").disabled = false;
    document.getElementById("discardSelectedBtn").disabled = false;
    document.getElementById("lostSelectedBtn").disabled = false;
    document.getElementById("searchDeckBtn").disabled = false;

    updateUI();
    showBanner("Game started! 7 cards drawn.", "primary");
}

function drawCard() {
    // If both drawPile and discardPile are empty, no cards can be drawn
    if (drawPile.length === 0 && discardPile.length === 0) {
        alert("No cards left to draw!");
        return;
    }

    // If drawPile is empty but discardPile has cards, prompt to reshuffle
    if (drawPile.length === 0 && discardPile.length > 0) {
        const confirmReshuffle = confirm("The deck is empty. Do you want to reshuffle the discard pile into the deck? (Top 5 cards will be lost.)");

        if (confirmReshuffle) {
            drawPile = shuffle(discardPile);
            discardPile = [];

            // Move top 5 to lost pile
            const lost = drawPile.splice(0, 5);
            lostPile.push(...lost);

            showBanner("Discard reshuffled. 5 cards lost.", "warning");
            updateUI();
            return;
        } else {
            return; // Do not draw
        }
    }

    const nextCard = drawPile.shift();
    hand.push(nextCard);
    updateUI();
    showBanner("Card drawn!", "success");

}

function resetGame() {
    fullDeck = [];
    drawPile = [];
    discardPile = [];
    lostPile = [];
    hand = [];
    document.getElementById("startBtn").disabled = false;
    document.getElementById("drawBtn").disabled = true;
    document.getElementById("shuffleBtn").disabled = true;
    document.getElementById("searchDeckBtn").disabled = true;

    selectedCardIndexes.clear();
    selectedDiscardIndexes.clear();
    selectedLostIndexes.clear();
    document.getElementById("discardSelectedBtn").disabled = true;
    document.getElementById("lostSelectedBtn").disabled = true;
    updateActionButtons();
    updateUI();
    showBanner("Game reset.", "danger");

}

function shuffleDeck() {
    drawPile = shuffle(drawPile);
    updateUI();
    showBanner("Deck shuffled!", "warning");
}


// --- Event listeners ---
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("drawBtn").addEventListener("click", drawCard);
document.getElementById("resetBtn").addEventListener("click", resetGame);

document.getElementById("buildBtn").addEventListener("click", () => {
    window.location.href = "build.html";
  });
  

document.getElementById("discardSelectedBtn").addEventListener("click", () => {
    const newHand = [];
    hand.forEach((card, index) => {
        if (selectedCardIndexes.has(index)) {
            discardPile.push(card);
        } else {
            newHand.push(card);
        }
    });
    hand = newHand;
    selectedCardIndexes.clear();
    updateUI();
    showBanner("Cards moved to discard.", "secondary");
});

document.getElementById("lostSelectedBtn").addEventListener("click", () => {
    const newHand = [];
    hand.forEach((card, index) => {
        if (selectedCardIndexes.has(index)) {
            lostPile.push(card);
        } else {
            newHand.push(card);
        }
    });
    hand = newHand;
    selectedCardIndexes.clear();
    updateUI();
    showBanner("Cards lost.", "dark");
});

document.getElementById("discardToHandBtn").addEventListener("click", () => {
    const keep = [];
    discardPile.forEach((card, i) => {
        if (selectedDiscardIndexes.has(i)) hand.push(card);
        else keep.push(card);
    });
    discardPile = keep;
    selectedDiscardIndexes.clear();
    updateUI();
    showBanner("Returned to hand.", "success");
});

document.getElementById("discardToDeckBtn").addEventListener("click", () => {
    const keep = [];
    discardPile.forEach((card, i) => {
        if (selectedDiscardIndexes.has(i)) drawPile.unshift(card); // Top of deck
        else keep.push(card);
    });
    discardPile = keep;
    selectedDiscardIndexes.clear();
    updateUI();
    showBanner("Sent to deck.", "primary");
});

document.getElementById("lostToHandBtn").addEventListener("click", () => {
    const keep = [];
    lostPile.forEach((card, i) => {
        if (selectedLostIndexes.has(i)) hand.push(card);
        else keep.push(card);
    });
    lostPile = keep;
    selectedLostIndexes.clear();
    updateUI();
    showBanner("Returned to hand.", "success");
});

document.getElementById("lostToDeckBtn").addEventListener("click", () => {
    const keep = [];
    lostPile.forEach((card, i) => {
        if (selectedLostIndexes.has(i)) drawPile.unshift(card);
        else keep.push(card);
    });
    lostPile = keep;
    selectedLostIndexes.clear();
    updateUI();
    showBanner("Sent to deck.", "primary");
});

document.getElementById("shuffleBtn").addEventListener("click", shuffleDeck);

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
    const keep = [];
    drawPile.forEach((card, i) => {
        if (selectedDeckIndexes.has(i)) hand.push(card);
        else keep.push(card);
    });
    drawPile = keep;
    selectedDeckIndexes.clear();
    updateUI();
    showBanner("Selected cards added to hand.", "success");
});


// --- Initial UI ---
updateUI();
