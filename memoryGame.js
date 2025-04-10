const cards = document.querySelectorAll(".card");
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

init();

function init() {
  addResetListener();
  setCardListeners();
}

function addResetListener() {
  resetButton.addEventListener("click", function () {
    location.reload();
  });
}

function setCardListeners() {
  cards.forEach((card) => {
    card.addEventListener("click", function () {
      if (!this.classList.contains("solved") && !this.classList.contains("flipped")) {
        this.classList.add("flipped");

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
      }
    });
  });
}

function checkForSolved(card1, card2) {
  const id1 = card1.dataset.cardId;
  const id2 = card2.dataset.cardId;

  if (id1 === id2) {
    card1.classList.add("solved");
    card2.classList.add("solved");
    checkForWin();
  } else {
    setTimeout(() => {
      card1.classList.remove("flipped");
      card2.classList.remove("flipped");
    }, 600);
  }
}

function checkForWin() {
  solvedCount++;
  if (solvedCount === 8) {
    timerOn = false;
    setTimeout(() => {
      modal.style.display = "block";
      if (stars.textContent === "★★★") {
        winText.textContent = `Three stars, amazing! It took you ${t} seconds this time.`;
      } else if (stars.textContent === "★★☆") {
        winText.textContent = `Two stars, not bad. It took you ${t} seconds this time.`;
      } else {
        winText.textContent = `Only one star? I'm sure you can do better! It took you ${t} seconds this time.`;
      }
    }, 600);
  }
}

function timerDisplay() {
  if (zeroSecond) {
    t++;
    zeroSecond = false;
  }
  timer.textContent = "Time: " + t;
  if (timerOn) {
    t++;
  }
}

function updateMoveCount() {
  moveCount++;
  moveCounter.textContent = moveCount;
  movePlural.textContent = moveCount === 1 ? " Move" : " Moves";
}

function updateStarCount() {
  if (moveCount === 14) {
    stars.textContent = "★★☆";
  }
  if (moveCount === 17) {
    stars.textContent = "★☆☆";
  }
}