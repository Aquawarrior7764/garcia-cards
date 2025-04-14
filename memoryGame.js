const modal = document.querySelector("#modal");
const moveCounter = document.querySelector("#move-counter");
const movePlural = document.querySelector("#move-plural");
const resetButton = document.querySelector("#reset");
const stars = document.querySelector("#stars");
const timer = document.querySelector("#timer");
const winText = document.querySelector("#win-text");

let firstClick = true;
let firstCard = null;
let moveCount = 0;
let solvedCount = 0;
let t = 0;
let timerOn = true;
let zeroSecond = true;

const intervalID = window.setInterval(timerDisplay, 1000);

const ENCRYPTED_CARD_MAP = {
  "v9a17x": "gcu1", "lm34kp": "gcu2", "bxt91w": "gcu3", "w72l8e": "gcu4", "qp3z5d": "gcu5",
  "n80rca": "guc1", "t5mv0y": "guc2", "ux9b2g": "guc3", "fz2h1j": "guc4",
  "m33ab9": "grc1", "k0xy71": "grc2", "e58gzd": "grc3",
  "a1pq7n": "gec1", "y46ewv": "gec2",
  "j94tu3": "glc1", "r7kx0q": "glc2"
};

const RARITY_MAP = {
  gcu1: "common", gcu2: "common", gcu3: "common", gcu4: "common", gcu5: "common",
  guc1: "uncommon", guc2: "uncommon", guc3: "uncommon", guc4: "uncommon",
  grc1: "rare", grc2: "rare", grc3: "rare",
  gec1: "epic", gec2: "epic",
  glc1: "legendary", glc2: "legendary"
};

function init() {
  addResetListener();
  generateGameCards();
  setCardListeners();
}

function addResetListener() {
  resetButton.addEventListener("click", () => location.reload());
}

function generateGameCards() {
  const encrypted = JSON.parse(localStorage.getItem("scannedCards")) || [];
  const decrypted = encrypted.map(slug => ENCRYPTED_CARD_MAP[slug]).filter(Boolean);

  const container = document.getElementById("container");

  if (decrypted.length < 1) {
    container.innerHTML = "<p style='text-align:center; font-size: 18px;'>Scan at least one card to start.</p>";
    return;
  }

  const selectedCards = shuffle(decrypted).slice(0, Math.min(8, decrypted.length));
  const gameCards = shuffle([...selectedCards, ...selectedCards]);

  container.innerHTML = ""; // clear any previous cards

  gameCards.forEach((cardId) => {
    const rarity = RARITY_MAP[cardId] || "common";

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.cardId = cardId;
    card.dataset.rarity = rarity;

    const inner = document.createElement("div");
    inner.className = "card-inner";

    const front = document.createElement("div");
    front.className = "card-front";
    front.style.backgroundImage = `url(cards/${cardId}.png)`;

    const back = document.createElement("div");
    back.className = "card-back";

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    container.appendChild(card);
  });
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setCardListeners() {
  const containerCards = document.querySelectorAll(".card");

  containerCards.forEach((card) => {
    card.addEventListener("click", function () {
      const inner = this.querySelector('.card-inner');
      if (!inner || inner.classList.contains("flipped") || inner.classList.contains("solved")) return;

      inner.classList.add("flipped");

      if (firstClick) {
        firstCard = this;
        firstClick = false;
      } else {
        const secondCard = this;
        updateMoveCount();
        updateStarCount();
        checkForSolved(firstCard, secondCard);
        firstClick = true;
      }
    });
  });
}

function checkForSolved(card1, card2) {
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;
  const rarity = card1.dataset.rarity;

  const inner1 = card1.querySelector(".card-inner");
  const inner2 = card2.querySelector(".card-inner");

  if (id1 === id2) {
    inner1.classList.add("solved", rarity);
    inner2.classList.add("solved", rarity);
    checkForWin();
  } else {
    setTimeout(() => {
      inner1.classList.remove("flipped");
      inner2.classList.remove("flipped");
    }, 600);
  }
}

function checkForWin() {
  solvedCount++;
  if (solvedCount === 8) {
    timerOn = false;
    setTimeout(() => {
      modal.style.display = "block";
      winText.textContent = `It took you ${t} seconds this time.`;
    }, 600);
  }
}

function timerDisplay() {
  if (zeroSecond) {
    t++;
    zeroSecond = false;
  }
  timer.textContent = "Time: " + t;
  if (timerOn) t++;
}

function updateMoveCount() {
  moveCount++;
  moveCounter.textContent = moveCount;
  movePlural.textContent = moveCount === 1 ? " Move" : " Moves";
}

function updateStarCount() {
  if (moveCount === 14) stars.textContent = "★★☆";
  if (moveCount === 17) stars.textContent = "★☆☆";
}

window.addEventListener("DOMContentLoaded", init);