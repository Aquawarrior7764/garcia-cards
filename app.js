const CARD_LIBRARY = {
  gcu1: { name: "GarciaCardCommon1", rarity: "common", image: "cards/gcu1.png", banner: "assets/COMMON banner.png" },
  gcu2: { name: "GarciaCardCommon2", rarity: "common", image: "cards/gcu2.png", banner: "assets/COMMON banner.png" },
  gcu3: { name: "GarciaCardCommon3", rarity: "common", image: "cards/gcu3.png", banner: "assets/COMMON banner.png" },
  gcu4: { name: "GarciaCardCommon4", rarity: "common", image: "cards/gcu4.png", banner: "assets/COMMON banner.png" },
  gcu5: { name: "GarciaCardCommon5", rarity: "common", image: "cards/gcu5.png", banner: "assets/COMMON banner.png" },
  guc1: { name: "GarciaCardUncommon1", rarity: "uncommon", image: "cards/guc1.png", banner: "assets/UNCOMMON banner.png" },
  guc2: { name: "GarciaCardUncommon2", rarity: "uncommon", image: "cards/guc2.png", banner: "assets/UNCOMMON banner.png" },
  guc3: { name: "GarciaCardUncommon3", rarity: "uncommon", image: "cards/guc3.png", banner: "assets/UNCOMMON banner.png" },
  guc4: { name: "GarciaCardUncommon4", rarity: "uncommon", image: "cards/guc4.png", banner: "assets/UNCOMMON banner.png" },
  grc1: { name: "GarciaCardRare1", rarity: "rare", image: "cards/grc1.png", banner: "assets/RARE banner.png" },
  grc2: { name: "GarciaCardRare2", rarity: "rare", image: "cards/grc2.png", banner: "assets/RARE banner.png" },
  grc3: { name: "GarciaCardRare3", rarity: "rare", image: "cards/grc3.png", banner: "assets/RARE banner.png" },
  gec1: { name: "GarciaCardEpic1", rarity: "epic", image: "cards/gec1.png", banner: "assets/EPIC banner.png" },
  gec2: { name: "GarciaCardEpic2", rarity: "epic", image: "cards/gec2.png", banner: "assets/EPIC banner.png" },
  glc1: { name: "GarciaCardLegendary1", rarity: "legendary", image: "cards/glc1.png", banner: "assets/LEGENDARY banner.png" },
  glc2: { name: "GarciaCardLegendary2", rarity: "legendary", image: "cards/glc2.png", banner: "assets/LEGENDARY banner.png" }
};

const ENCRYPTED_CARD_MAP = {
  a3x7kg: "gcu1", k9mz2p: "gcu2", v2y8wd: "gcu3", j1qb5t: "gcu4", x4le9m: "gcu5",
  d0rn6a: "guc1", f7w3cy: "guc2", m3pz8k: "guc3", p9xu2d: "guc4",
  h8lj3s: "grc1", u5mn9q: "grc2", z2rx0c: "grc3",
  n4cy7b: "gec1", q7dk1r: "gec2",
  t6wy9z: "glc1", e1bj5v: "glc2"
};

(function handleRedirectEarly() {
  const redirected = localStorage.getItem("scannedCardRedirect");
  if (redirected) {
    localStorage.removeItem("scannedCardRedirect");
    const url = new URL(window.location.href);
    url.searchParams.set("card", redirected);
    window.location.replace(url.href);
  }
})();

let scannedCards = new Set();

function loadScannedFromStorage() {
  const saved = JSON.parse(localStorage.getItem("scannedCards")) || [];
  const decrypted = saved.map(code => ENCRYPTED_CARD_MAP[code]).filter(Boolean);
  scannedCards = new Set(decrypted);
  updateLibrary();
}

function saveScannedCards() {
  const encrypted = [...scannedCards].map(id =>
    Object.entries(ENCRYPTED_CARD_MAP).find(([, val]) => val === id)?.[0]
  ).filter(Boolean);
  localStorage.setItem("scannedCards", JSON.stringify(encrypted));
}

function updateLibrary() {
  const container = document.getElementById("card-library");
  const counter = document.getElementById("collection-count");
  const unlocked = [...scannedCards].length;

  container.innerHTML = "";
  counter.textContent = unlocked;

  Object.entries(CARD_LIBRARY).forEach(([id, data]) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const img = document.createElement("img");
    img.classList.add("card-img");

    if (scannedCards.has(id)) {
      div.classList.add(`rarity-${data.rarity}`);
      img.src = data.image;
      img.alt = data.name;
      img.onclick = () => showZoomedCard(id);
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

function handleScannedCard(encrypted) {
  const cardId = ENCRYPTED_CARD_MAP[encrypted];
  if (!cardId || !(cardId in CARD_LIBRARY)) {
    document.getElementById("scan-result").innerText = `Unknown card: ${encrypted}`;
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
  const encrypted = params.get("card");
  if (encrypted) handleScannedCard(encrypted);
}

function setupButtons() {
  document.getElementById("reset-btn").onclick = () => {
    if (confirm("Reset your collection? This cannot be undone.")) {
      localStorage.removeItem("scannedCards");
      scannedCards.clear();
      updateLibrary();
      document.getElementById("scan-result").innerText = "Scan a card QR to begin logging.";
      const recent = document.getElementById("recent-card");
      recent.className = "card-placeholder";
      recent.innerHTML = "<p>No cards scanned yet.</p>";
    }
  };

  document.getElementById("toggle-library-btn").onclick = () => {
    document.getElementById("library-container").classList.toggle("hidden");
  };

  document.getElementById("zoom-modal").onclick = () => {
    document.getElementById("zoom-modal").classList.add("hidden");
  };
}

function showZoomedCard(cardId) {
  const card = CARD_LIBRARY[cardId];
  const overlay = document.getElementById("zoom-overlay-content");
  const modal = document.getElementById("zoom-modal");

  overlay.innerHTML = "";

  const banner = document.createElement("img");
  banner.src = card.banner;
  banner.alt = "Rarity banner";
  banner.id = "zoom-banner";

  const cardImg = document.createElement("img");
  cardImg.src = card.image;
  cardImg.alt = "Zoomed card";
  cardImg.id = "zoom-card-img";

  overlay.appendChild(banner);
  overlay.appendChild(cardImg);
  modal.classList.remove("hidden");
}

// QR SCANNER
let videoStream = null;
let scannerRunning = false;
const canvas = document.getElementById("scanner-canvas");
const context = canvas.getContext("2d");
const video = document.getElementById("scanner-video");
const scannerContainer = document.getElementById("scanner-container");
const toggleBtn = document.getElementById("toggle-scanner-btn");

toggleBtn.onclick = async () => {
  if (scannerRunning) {
    stopScanner();
  } else {
    await startScanner();
  }
};

async function startScanner() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = videoStream;
    video.setAttribute("playsinline", true);
    video.play();
    scannerContainer.style.display = "block";
    scannerRunning = true;
    requestAnimationFrame(scanLoop);
  } catch {
    alert("Camera access denied or unavailable.");
  }
}

function stopScanner() {
  if (videoStream) videoStream.getTracks().forEach(track => track.stop());
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
      try {
        const parsed = new URL(code.data, window.location.origin);
        const encrypted = parsed.searchParams.get("card");
        if (encrypted) {
          localStorage.setItem("scannedCardRedirect", encrypted);
          window.location.href = `redirect.html`;
          stopScanner();
          return;
        }
      } catch {}
    }
  }
  requestAnimationFrame(scanLoop);
}

window.addEventListener("DOMContentLoaded", () => {
  loadScannedFromStorage();
  checkURLForCardScan();
  setupButtons();
});