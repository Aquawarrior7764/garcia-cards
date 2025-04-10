const CARD_LIBRARY = {
  gcu1: { name: "GarciaCardCommon1", rarity: "common", image: "cards/gcu1.png", banner: "assets/COMMON banner.png" },
  gcu2: { name: "GarciaCardCommon2", rarity: "common", image: "cards/gcu2.png", banner: "assets/COMMON banner.png" },
  guc1: { name: "GarciaCardUncommon1", rarity: "uncommon", image: "cards/guc1.png", banner: "assets/UNCOMMON banner.png" },
  guc2: { name: "GarciaCardUncommon2", rarity: "uncommon", image: "cards/guc2.png", banner: "assets/UNCOMMON banner.png" },
  grc1: { name: "GarciaCardRare1", rarity: "rare", image: "cards/grc1.png", banner: "assets/RARE banner.png" },
  grc2: { name: "GarciaCardRare2", rarity: "rare", image: "cards/grc2.png", banner: "assets/RARE banner.png" },
  gec1: { name: "GarciaCardEpic1", rarity: "epic", image: "cards/gec1.png", banner: "assets/EPIC banner.png" },
  gec2: { name: "GarciaCardEpic2", rarity: "epic", image: "cards/gec2.png", banner: "assets/EPIC banner.png" },
  glc1: { name: "GarciaCardLegendary1", rarity: "legendary", image: "cards/glc1.png", banner: "assets/LEGENDARY banner.png" },
  glc2: { name: "GarciaCardLegendary2", rarity: "legendary", image: "cards/glc2.png", banner: "assets/LEGENDARY banner.png" }
};

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

    const img = document.createElement("img");
    img.classList.add("card-img");

    if (scannedCards.has(cardId)) {
      div.classList.add(`rarity-${cardData.rarity}`);
      img.src = cardData.image;
      img.alt = `${cardData.name}`;

      img.addEventListener("click", () => {
        showZoomedCard(cardId);
      });

    } else {
      div.classList.add("locked");
      img.src = "cards/locked.png";
      img.alt = "Locked card";
    }

    div.appendChild(img);
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

  document.getElementById("zoom-modal").addEventListener("click", () => {
    document.getElementById("zoom-modal").classList.add("hidden");
  });
}
function showZoomedCard(cardId) {
  const card = CARD_LIBRARY[cardId];
  const img = document.getElementById("zoom-card-img");
  const banner = document.getElementById("zoom-banner");
  const modal = document.getElementById("zoom-modal");
  const overlay = document.getElementById("zoom-overlay-content");

  const rarityClass = `glow-${card.rarity.toLowerCase()}`;

  // Clean previous glow classes
  img.className = '';
  banner.className = '';
  overlay.className = '';

  // Apply glow + rarity class
  img.classList.add('glow-effect', rarityClass);
  banner.classList.add('glow-effect', rarityClass);

  img.src = card.image;
  banner.src = `assets/${card.rarity.toUpperCase()} banner.png`;

  modal.classList.remove("hidden");
}


// Scanner
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

    if (code?.data) {
      let cardId = null;

      try {
        const parsed = new URL(code.data, window.location.origin);
        cardId = parsed.searchParams.get("card");
      } catch (e) {
        if (CARD_LIBRARY[code.data]) {
          cardId = code.data;
        }
      }

      if (cardId && CARD_LIBRARY[cardId]) {
        localStorage.setItem("scannedCardRedirect", cardId);
        window.location.href = `https://garciacards.net/redirect.html`;
        stopScanner();
        return;
      }
    }
  }

  requestAnimationFrame(scanLoop);
}

window.addEventListener("DOMContentLoaded", () => {
  loadScannedFromStorage();
  checkURLForCardScan();
  setupButtons();
});