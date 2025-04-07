let scannedCards = new Set();

function generateQRCode() {
  const cardId = document.getElementById("card-id").value;
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";

  if (!cardId) {
    alert("Please enter a card ID");
    return;
  }

  // Generate QR code pointing to this page with a query param
  const currentUrl = window.location.origin;
  const qrText = `${currentUrl}?card=${encodeURIComponent(cardId)}`;

  new QRCode(qrContainer, {
    text: qrText,
    width: 128,
    height: 128
  });
}

// 👇 Called when loading the page with ?card=cardXXX
function checkURLForCardScan() {
  const params = new URLSearchParams(window.location.search);
  const card = params.get("card");

  if (card) {
    document.getElementById("scan-result").innerText = `Scanned: ${card}`;

    if (!scannedCards.has(card)) {
      scannedCards.add(card);
      const li = document.createElement("li");
      li.textContent = `${card} ✔️`;
      document.getElementById("scan-log").appendChild(li);
    } else {
      alert(`Card "${card}" already scanned.`);
    }
  }
}

// Only run QR scanner if you still want to keep that feature
function onScanSuccess(decodedText, decodedResult) {
  document.getElementById("scan-result").innerText = `Scanned: ${decodedText}`;

  if (!scannedCards.has(decodedText)) {
    scannedCards.add(decodedText);
    const li = document.createElement("li");
    li.textContent = decodedText + " ✔️";
    document.getElementById("scan-log").appendChild(li);
  } else {
    alert(`Card "${decodedText}" already scanned.`);
  }
}

function startQRScanner() {
  const html5QrCode = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
    }
  });
}

// 👇 Trigger on page load
window.addEventListener('DOMContentLoaded', () => {
  checkURLForCardScan();
  startQRScanner(); // Optional: keep or remove if not using in-site scanning
});
