
// === MOCK CARDS ===
const yourCard = {
  name: 'Fire Lizard',
  stats: { attack: 5, grab: 3, defense: 2, neutral: 1 },
  hp: 10
};

const opponentCard = {
  name: 'Stone Guard',
  stats: { attack: 2, grab: 4, defense: 5, neutral: 1 },
  hp: 10,
  revealed: false
};

let round = 1;

const effectiveness = {
  attack: 'grab',
  grab: 'defense',
  defense: 'attack',
  neutral: null
};

// === GAME START ===
function startGame() {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <h2>Round ${round}</h2>
    <p><strong>Your Card:</strong> ${yourCard.name}</p>
    <p><strong>Your HP:</strong> ${yourCard.hp}</p>
    <p><strong>Opponent HP:</strong> ${opponentCard.hp}</p>
    <p><strong>Choose your move:</strong></p>
  `;

  ['attack', 'grab', 'defense', 'neutral'].forEach((move) => {
    const btn = document.createElement('button');
    btn.innerText = move;
    btn.onclick = () => submitMove(move);
    container.appendChild(btn);
  });
}

function submitMove(playerMove) {
  const opponentMove = getRandomMove();

  const result = resolveBattle(
    { card: yourCard, move: playerMove },
    { card: opponentCard, move: opponentMove }
  );

  opponentCard.revealed = true;

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
    p1Attack += 2;
  }
  if (effectiveness[player2.move] === player1.move) {
    p2Attack += 2;
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
    ${opponentCard.revealed ? `<p><strong>Opponent Card:</strong> ${opponentCard.name}</p>` : ''}
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
startGame();