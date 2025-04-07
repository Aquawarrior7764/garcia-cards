let scannedCards = new Set();

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

window.addEventListener('DOMContentLoaded', () => {
  checkURLForCardScan();
});
