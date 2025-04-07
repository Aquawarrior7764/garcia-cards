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

(function handleRedirectEarly() {
  const redirectedCard = localStorage.getItem("scannedCardRedirect");
  if (redirectedCard) {
    localStorage.removeItem("scannedCardRedirect");
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("card", redirectedCard);
    window.location.replace(currentUrl.href);
  }
})();

// Cookie helpers
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

function saveScannedCards() {
  const data = JSON.stringify([...scannedCards]);
  try {
    localStorage.setItem("scannedCards", data);
  } catch {
    setCookie("scannedCards", data, 365);
  }
}

function loadScannedCards() {
  let data;
  try {
    data = localStorage.getItem("scannedCards");
  } catch {
    data = getCookie("scannedCards");
  }

  if (data) {
    try {
      const parsed = JSON.parse(data);
      scannedCards = new Set(parsed);
      for (const cardId of scannedCards) {
        if (CARD_LIBRARY[cardId]) {
          const { name, rarity } = CARD_LIBRARY[cardId];
          addToLog(cardId, name, rarity);
        }
      }
    } catch {}
  }

  updateScanCount();
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
  saveScannedCards();

  document.getElementById("scan-result").innerText = `Scanned: ${name} (${rarity})`;
  addToLog(cardId, name, rarity);
  updateScanCount();
}

function setupResetButton() {
  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", () => {
    if (confirm("Reset your collection? This cannot be undone.")) {
      localStorage.removeItem("scannedCards");
      setCookie("scannedCards", "", -1);
      scannedCards.clear();
      document.getElementById("scan-log").innerHTML = "";
      document.getElementById("scan-count").innerText = "0";
      document.getElementById("scan-result").innerText = "Scan a card QR to begin logging.";
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadScannedCards();
  checkURLForCardScan();
  setupResetButton();
});

