// ===========================
// Deck State & Selections
// ===========================
let fullDeck = [];

let selectedCharacters = [];
let selectedCharacterBySlot = [null, null, null];
let selectedItems = new Array(9).fill(null);

let characterDecks = [];
let itemCards = [];

// ===========================
// Load JSON Data
// ===========================
async function loadDeckData() {
  const characterRes = await fetch('character-cards.json');
  const itemRes = await fetch('items.json');
  characterDecks = await characterRes.json();
  itemCards = await itemRes.json();

  const charInputs = [document.getElementById('charInput1'), document.getElementById('charInput2'), document.getElementById('charInput3')];
  const datalist = document.getElementById('character-options');

  // Populate datalist
  characterDecks.forEach(char => {
    const option = document.createElement('option');
    option.value = char.name;
    option.dataset.id = char.id;
    datalist.appendChild(option);
  });
  console.log("charInputs elements:", charInputs);
  charInputs.forEach((input, index) => {
    input.addEventListener('change', () => {
      
      const selected = characterDecks.find(c => c.name.toLowerCase() === input.value.toLowerCase());
      if (selected) {
        selectedCharacterBySlot[index] = selected;
        renderCharacterDeck(selected, index);
      } else {
        selectedCharacterBySlot[index] = null;
        const previewCol = document.getElementById(`char-col-${index}`);
        previewCol.innerHTML = ""; // clear the column
      }      

    });
  });

  renderItemSelectors();

  //Check for localStorage
  const saved = localStorage.getItem("preparedDeck"); 
  if (saved) {
    try {
      const savedDeck = JSON.parse(saved);
      prefillSelections(savedDeck);
    } catch (e) {
      console.warn("Could not parse saved deck:", e);
    }
  }
}

// ===========================
// Build Page Rendering
// ===========================
function renderCharacterDeck(character, slotIndex) {
  const previewCol = document.getElementById(`char-col-${slotIndex}`);
  previewCol.innerHTML = `
    <div class="card h-100">
      <div class="card-header bg-dark text-white text-center">${character.name}</div>
      <div class="card-body p-2" style="font-size: 0.85rem;">
        <table class="table table-sm table-bordered mb-0">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Power</th>
              <th>Range</th>

            </tr>
          </thead>
          <tbody>
            ${character.deck.map(card => `
              <tr>
                <td><strong title="${card.description.replace(/"/g, '&quot;')}">${card.name}</strong></td>

                <td>${card.type}</td>
                <td>${card.category}</td>
                <td>${card.power}</td>
                <td>${card.range}</td>

              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // console.log("Rendering character deck for:", character.name);
  // console.table(character.deck);
}

function renderItemSelectors() {
  const container = document.getElementById('itemSelectionRow');
  const datalist = document.getElementById('item-options');
  container.innerHTML = '';
  datalist.innerHTML = '';
  selectedItems = new Array(9).fill(null); // reset

  // Populate datalist
  itemCards.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.name;
    opt.dataset.id = item.id;
    datalist.appendChild(opt);
  });
  console.log("Populated item options:", datalist.children.length);

  // Render 9 inputs
  for (let i = 0; i < 9; i++) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control text-center';
    input.placeholder = 'Select item';
    input.setAttribute('list', 'item-options');
    input.dataset.index = i;

    input.addEventListener('change', () => {
      const match = itemCards.find(item => item.name.toLowerCase() === input.value.toLowerCase());
      selectedItems[i] = match ? match.id : null;
    });

    col.appendChild(input);
    container.appendChild(col);
  }
}

// ===========================
// Helpers for Build Page
// ===========================
function prefillSelections(deck) {
  const charCounts = {};
  const itemCounts = {};

  deck.forEach(card => {
    if (card.character && card.deck === undefined) {
      // Count character cards
      charCounts[card.character] = (charCounts[card.character] || 0) + 1;
    } else {
      // Count items (no character attached)
      const match = itemCards.find(i => i.name === card.name);
      if (match) {
        itemCounts[match.name] = (itemCounts[match.name] || 0) + 1;
      }
    }
  });

  console.log("Detected character counts:", charCounts);
  // Prefill characters by name (expects 3 characters of 11 cards each)
  const characterNames = Object.keys(charCounts).filter(k => charCounts[k] >= 11).slice(0, 3);
  console.log("Prefilling characters:", characterNames);
  characterNames.forEach((name, index) => {
    const input = document.getElementById(`charInput${index + 1}`);
    console.log(`→ Trying to set charInput${index + 1} to "${name}"`);
    if (input) {
      input.value = name;
      input.dispatchEvent(new Event("change"));
    }

    const character = characterDecks.find(c => c.name === name);
    if (character) {
      selectedCharacterBySlot[index] = character;
      renderCharacterDeck(character, index);
    }
  });

  // Prefill items into the 9 dropdowns
  const flatItems = [];
  for (const name in itemCounts) {
    const match = itemCards.find(i => i.name === name);
    if (match) {
      for (let i = 0; i < itemCounts[name]; i++) {
        flatItems.push(match.id);
      }
    }
  }

  flatItems.slice(0, 9).forEach((id, index) => {
    const input = document.querySelector(`#itemSelectionRow input[data-index="${index}"]`);
    const match = itemCards.find(i => i.id === id);
    if (input && match) {
      input.value = match.name;
      selectedItems[index] = match.id;
    }
  });

  // renderDeckPreview();
}

// ===========================
// Event Setup for Build Page
// ===========================
function setupBuildPage() {
  loadDeckData();
  document.getElementById('finalizeDeckBtn').addEventListener('click', () => {
    const selectedCharacters = selectedCharacterBySlot.filter(Boolean);
    if (selectedCharacters.length !== 3) {
      showBanner("Select exactly 3 characters.", "danger");
      return;
    }
    const selectedItemsCleaned = selectedItems.filter(id => id !== null);
    if (selectedItemsCleaned.length !== 9) {
      showBanner("Select exactly 9 items.", "danger");
      return;
    }
    
    const combinedDeck = [];
    selectedCharacters.forEach(char => {
      char.deck.forEach(card => combinedDeck.push({ ...card, character: char.name }));
    });

    selectedItemsCleaned.forEach(itemId => {
      const item = itemCards.find(i => i.id === itemId);
      if (item) {
        combinedDeck.push({ ...item });
      }
    });
    

    if (combinedDeck.length !== 42) {
      showBanner(`Deck must be 42 cards. Current count: ${combinedDeck.length}`, "danger");
      return;
    }

    localStorage.setItem('preparedDeck', JSON.stringify(combinedDeck));
    showBanner("Deck saved! Redirecting to game...", "success");

    // Redirect to game page after short delay
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  });
}

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', setupBuildPage);

