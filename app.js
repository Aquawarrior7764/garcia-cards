// Encrypted card ID to public-facing name and rarity
const CARD_LIBRARY = {
  gcu1: { name: "GarciaCardCommon1", rarity: "Common" },
  gcu2: { name: "GarciaCardCommon2", rarity: "Common" },
  guc1: { name: "GarciaCardUncommon1", rarity: "Uncommon" },
  guc2: { name: "GarciaCardUncommon2", rarity: "Uncommon" },
  grc1: { name: "GarciaCardRare1", rarity: "Rare" },
  grc2: { name: "GarciaCardRare2", rarity: "Rare" },
  gec1: { name: "GarciaCardEpic1", rarity: "Epic" },
  gec2: { name: "GarciaCardEpic2", rarity: "Epic" },
  glc1: { name: "GarciaCardLegendary1", rarity: "Legendary" },
  glc2: { name: "GarciaCardLegendary2", rarity: "Legendary" }
};

let scannedCards = new Set();

function loadScannedFromStorage() {
  const saved = JSON.parse(localStorage.getItem("scannedCards"));
  if (saved && Array.isArray(saved)) {
    scannedCards = new Set(saved);
    for (const cardId of scannedCards) {
      const { name, rarity } = CARD_LIBRARY[cardId];
      addToLog(cardId, name, rarity);
    }
    updateScanCount();
  }
}

function updateScanCount() {
  document.getElementById("scan-count").innerText = scannedCards.size;
}

function addToLog(cardId, name, rarity) {
  const li = document.createElement("li");
  li.textContent = `${cardId} - ${name} (${rarity}) ✔️`;
  document.getElementById("scan-log").appendChild(li);
}

function checkURLForCardScan() {
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("card");

  if (!cardId) return;

  if (!(cardId in CARD_LIBRARY)) {
    document.getElementById("scan-result").innerText = `Unknown card: ${cardId}`;
    return;
  }

  if (scannedCards.has(cardId)) {
    alert(`Card "${cardId}" already scanned.`);
    return;
  }

  const { name, rarity } = CARD_LIBRARY[cardId];

  scannedCards.add(cardId);
  localStorage.setItem("scannedCards", JSON.stringify([...scannedCards]));

  document.getElementById("scan-result").innerText = `Scanned: ${name} (${rarity})`;
  addToLog(cardId, name, rarity);
  updateScanCount();
}

function setupResetButton() {
  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset your collection? This cannot be undone.")) {
      localStorage.removeItem("scannedCards");
      scannedCards.clear();
      document.getElementById("scan-log").innerHTML = "";
      document.getElementById("scan-count").innerText = "0";
      document.getElementById("scan-result").innerText = "Scan a card QR to begin logging.";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadScannedFromStorage();
  checkURLForCardScan();
  setupResetButton();
});
