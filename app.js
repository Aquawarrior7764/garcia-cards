const CARD_LIBRARY = {
  gcu1: { name: "GarciaCardCommon1", rarity: "common", image: "cards/gcu1.png" },
  gcu2: { name: "GarciaCardCommon2", rarity: "common", image: "cards/gcu2.png" },
  guc1: { name: "GarciaCardUncommon1", rarity: "uncommon", image: "cards/guc1.png" },
  guc2: { name: "GarciaCardUncommon2", rarity: "uncommon", image: "cards/guc2.png" },
  grc1: { name: "GarciaCardRare1", rarity: "rare", image: "cards/grc1.png" },
  grc2: { name: "GarciaCardRare2", rarity: "rare", image: "cards/grc2.png" },
  gec1: { name: "GarciaCardEpic1", rarity: "epic", image: "cards/gec1.png" },
  gec2: { name: "GarciaCardEpic2", rarity: "epic", image: "cards/gec2.png" },
  glc1: { name: "GarciaCardLegendary1", rarity: "legendary", image: "cards/glc1.png" },
  glc2: { name: "GarciaCardLegendary2", rarity: "legendary", image: "cards/glc2.png" }
};

// ✅ Fix: Handle scannedCardRedirect BEFORE anything else
(function handleRedirectEarly() {
  const redirectedCard = localStorage.getItem("scannedCardRedirect");
  if (redirectedCard) {
    localStorage.removeItem("scannedCardRedirect");
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("card", redirectedCard);
    window.location.replace(currentUrl.href);
  }
})();

let scannedCards = new Set();

function loadScannedFromStorage() {
  const saved = JSON.parse(localStorage.getItem("scannedCards"));
  if (saved && Array.isArray(saved)) {
    scannedCards = new Set(saved);
  }
  updateLibrary();
}

function saveScannedCards() {
  localStorage.setItem("scannedCards", JSON.stringify([...scannedCards]));
}

function updateLibrary() {
  const container = document.getElementById("card-library");
  const counter = document.getElementById("collection-count");
  const total = Object.keys(CARD_LIBRARY).length;
  const unlocked = [...scannedCards].length;

  container.innerHTML = "";
  counter.textContent = unlocked;

  Object.entries(CARD_LIBRARY).forEach(([cardId, cardData]) => {
    const div = document.createElement("div");
    div.classList.add("card");

    if (scannedCards.has(cardId)) {
      div.classList.add(`rarity-${cardData.rarity}`);
      div.innerText = `${cardData.name} (${capitalize(cardData.rarity)})`;
    } else {
      div.classList.add("locked");
      div.innerHTML = `<p>???</p>`;
    }

    container.appendChild(div);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function handleScannedCard(cardId) {
  if (!(cardId in CARD_LIBRARY)) {
    document.getElementById("scan-result").innerText = `Unknown card: ${cardId}`;
    return;
  }

  if (!scannedCards.has(cardId)) {
    scannedCards.add(cardId);
    saveScannedCards();
  }

  const { name, rarity } = CARD_LIBRARY[cardId];

  const recent = document.getElementById("recent-card");
  recent.className = "card rarity-" + rarity;
  recent.innerText = `${name} (${capitalize(rarity)})`;

  document.getElementById("scan-result").innerText = `Scanned: ${name} (${capitalize(rarity)})`;

  updateLibrary();
}

function checkURLForCardScan() {
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("card");

  if (!cardId) return;

  handleScannedCard(cardId);
}

function setupButtons() {
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("Reset your collection? This cannot be undone.")) {
      localStorage.removeItem("scannedCards");
      scannedCards.clear();
      updateLibrary();
      document.getElementById("scan-result").innerText = "Scan a card QR to begin logging.";
      document.getElementById("recent-card").innerHTML = "<p>No cards scanned yet.</p>";
      document.getElementById("recent-card").className = "card-placeholder";
    }
  });

  document.getElementById("toggle-library-btn").addEventListener("click", () => {
    document.getElementById("library-container").classList.toggle("hidden");
  });
}

// ✅ QR SCANNER SYSTEM (unchanged logic)
let videoStream = null;
let scannerRunning = false;
const canvas = document.getElementById("scanner-canvas");
const context = canvas.getContext("2d");
const video = document.getElementById("scanner-video");
const scannerContainer = document.getElementById("scanner-container");
const toggleBtn = document.getElementById("toggle-scanner-btn");

toggleBtn.addEventListener("click", async () => {
  if (scannerRunning) {
    stopScanner();
  } else {
    await startScanner();
  }
});

async function startScanner() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = videoStream;
    video.setAttribute("playsinline", true);
    video.play();
    scannerContainer.style.display = "block";
    scannerRunning = true;
    requestAnimationFrame(scanLoop);
  } catch (err) {
    alert("Camera access denied or unavailable.");
  }
}

function stopScanner() {
  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
  }
  scannerRunning = false;
  scannerContainer.style.display = "none";
}

function scanLoop() {
  if (!scannerRunning) return;

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code && code.data.includes("card=")) {
      try {
        const parsedURL = new URL(code.data);
        const cardId = parsedURL.searchParams.get("card");
        if (cardId && CARD_LIBRARY[cardId]) {
          window.location.href = `https://garciacards.net/redirect.html?card=${cardId}`;
          stopScanner();
          return;
        }
      } catch (e) {}
    }
  }

  requestAnimationFrame(scanLoop);
}

window.addEventListener("DOMContentLoaded", () => {
  loadScannedFromStorage();
  checkURLForCardScan();
  setupButtons();
});
