// === CARD OPTIONS ===
const playerCards = [
  {
    name: 'Fire Lizard',
    stats: { attack: 5, grab: 3, defense: 2, neutral: 1 },
    hp: 12,
    bonus: 2
  },
  {
    name: 'Speed Hawk',
    stats: { attack: 4, grab: 4, defense: 1, neutral: 3 },
    hp: 10,
    bonus: 3
  },
  {
    name: 'Stone Guard',
    stats: { attack: 2, grab: 2, defense: 5, neutral: 1 },
    hp: 14,
    bonus: 1
  }
];

const opponentCards = [
  {
    name: 'Dark Wraith',
    stats: { attack: 3, grab: 5, defense: 2, neutral: 1 },
    hp: 11,
    bonus: 2,
    revealedStats: new Set()
  },
  {
    name: 'Sky Beetle',
    stats: { attack: 5, grab: 2, defense: 3, neutral: 2 },
    hp: 12,
    bonus: 1,
    revealedStats: new Set()
  },
  {
    name: 'Iron Bark',
    stats: { attack: 2, grab: 3, defense: 4, neutral: 2 },
    hp: 13,
    bonus: 3,
    revealedStats: new Set()
  }
];

let yourCard = null;
let opponentCard = null;
let round = 1;
let opponentRevealed = false;

const effectiveness = {
  attack: 'grab',
  grab: 'defense',
  defense: 'neutral',
  neutral: null
};

// === GAME START ===
function startCardSelection() {
  const container = document.getElementById('game-container');
  container.innerHTML = `<h2>Select Your Card</h2>`;

  playerCards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `
      <strong>${card.name}</strong><br>
      HP: ${card.hp}<br>
      Attack: ${card.stats.attack}, Grab: ${card.stats.grab}, Defense: ${card.stats.defense}, Neutral: ${card.stats.neutral}<br>
      Bonus vs effective type: +${card.bonus}<br>
      <button onclick="selectCard(${index})">Choose</button>
    `;
    container.appendChild(cardDiv);
  });
}

function selectCard(index) {
  yourCard = JSON.parse(JSON.stringify(playerCards[index])); // Deep clone
  opponentCard = JSON.parse(JSON.stringify(opponentCards[Math.floor(Math.random() * opponentCards.length)]));
  startGame();
}

function startGame() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h2>Round ${round}</h2>
    <p><strong>Your Card:</strong> ${yourCard.name}</p>
    <p><strong>Your HP:</strong> ${yourCard.hp}</p>
    <p><strong>Your Stats:</strong> Attack: ${yourCard.stats.attack}, Grab: ${yourCard.stats.grab}, Defense: ${yourCard.stats.defense}, Neutral: ${yourCard.stats.neutral}</p>
    ${opponentRevealed ? `<p><strong>Opponent Card:</strong> ${opponentCard.name}</p>` : ''}
    ${opponentRevealed ? `<p><strong>Opponent HP:</strong> ${opponentCard.hp}</p>` : ''}
    ${opponentRevealed ? getOpponentStatsHTML() : ''}
    <p><strong>Choose your move:</strong></p>
    <div id="move-buttons"></div>
  `;

  setTimeout(() => {
    const moveContainer = document.getElementById('move-buttons');
    if (!moveContainer) return;

    ['attack', 'grab', 'defense', 'neutral'].forEach((move) => {
      const btn = document.createElement('button');
      btn.innerText = move;
      btn.onclick = () => {
        console.log("Selected move:", move);
        submitMove(move);
      };
      moveContainer.appendChild(btn);
    });
  }, 0);
}

function getOpponentStatsHTML() {
  let revealed = Array.from(opponentCard.revealedStats || []);
  if (revealed.length === 0) return `<p>Opponent stats: ???</p>`;
  return `<p>Opponent known stats: ` + revealed.map(stat => `${stat}: ${opponentCard.stats[stat]}`).join(', ') + `</p>`;
}

function submitMove(playerMove) {
  const opponentMove = getRandomMove();

  if (!opponentCard.revealedStats) opponentCard.revealedStats = new Set();
  opponentCard.revealedStats.add(opponentMove);

  const result = resolveBattle(
    { card: yourCard, move: playerMove },
    { card: opponentCard, move: opponentMove }
  );

  if (!opponentRevealed) opponentRevealed = true;

  showResult(playerMove, opponentMove, result);
}

function getRandomMove() {
  const moves = ['attack', 'grab', 'defense', 'neutral'];
  return moves[Math.floor(Math.random() * moves.length)];
}

function resolveBattle(player1, player2) {
  let p1Attack = player1.card.stats[player1.move];
  let p2Attack = player2.card.stats[player2.move];

  if (effectiveness[player1.move] === player2.move) {
    p1Attack += player1.card.bonus;
  }
  if (effectiveness[player2.move] === player1.move) {
    p2Attack += player2.card.bonus;
  }

  const damage = Math.abs(p1Attack - p2Attack);
  let winner = 'Tie';

  if (p1Attack > p2Attack) {
    player2.card.hp -= damage;
    winner = 'You';
  } else if (p2Attack > p1Attack) {
    player1.card.hp -= damage;
    winner = 'Opponent';
  }

  return {
    winner,
    damage,
    p1Attack,
    p2Attack
  };
}

function showResult(yourMove, opponentMove, result) {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h2>Round ${round} Results</h2>
    <p><strong>You used:</strong> ${yourMove} (${result.p1Attack})</p>
    <p><strong>Opponent used:</strong> ${opponentMove} (${result.p2Attack})</p>
    <p><strong>Winner:</strong> ${result.winner}</p>
    <p><strong>Damage Dealt:</strong> ${result.damage}</p>
    <hr>
    <p><strong>Your HP:</strong> ${yourCard.hp}</p>
    <p><strong>Opponent HP:</strong> ${opponentCard.hp}</p>
    <p><strong>Opponent Card:</strong> ${opponentCard.name}</p>
    ${getOpponentStatsHTML()}
  `;

  if (yourCard.hp <= 0 || opponentCard.hp <= 0) {
    container.innerHTML += `<h2>Game Over — ${result.winner} Wins!</h2>`;
  } else {
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next Round';
    nextBtn.onclick = () => {
      round++;
      startGame();
    };
    container.appendChild(nextBtn);
  }
}

// Start the game
startCardSelection();