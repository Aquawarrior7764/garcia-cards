// game.js

// Placeholder socket setup (will do nothing yet until server is running)
const socket = io('http://localhost:3000'); // We'll update this later

socket.on('waiting', (data) => {
  document.getElementById('game-container').innerText = data.message;
});

socket.on('match-found', (data) => {
  document.getElementById('game-container').innerText = `Opponent found! ID: ${data.opponentId}`;
});

socket.on('start-game', ({ room }) => {
  console.log(`Game starting in room: ${room}`);
});

// Frontend card selection logic
const mockCards = [
  { name: 'Fire Lizard', stats: { attack: 5, grab: 2, shield: 3, neutral: 1 }},
  { name: 'Stone Guard', stats: { attack: 2, grab: 4, shield: 5, neutral: 1 }},
  { name: 'Speed Hawk', stats: { attack: 4, grab: 3, shield: 2, neutral: 1 }}
];

function renderCardSelection() {
  const container = document.getElementById('game-container');
  container.innerHTML = `<h2>Select a Card</h2>`;

  mockCards.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `
      <strong>${card.name}</strong><br>
      Attack: ${card.stats.attack} |
      Grab: ${card.stats.grab} |
      Shield: ${card.stats.shield} |
      Neutral: ${card.stats.neutral}<br>
      <button onclick="selectCard(${index})">Select</button>
    `;
    container.appendChild(cardDiv);
  });
}

function selectCard(index) {
  const selectedCard = mockCards[index];
  window.selectedCard = selectedCard;

  // Show move choices
  const container = document.getElementById('game-container');
  container.innerHTML = `<h2>Choose a Move</h2>`;

  ['attack', 'grab', 'shield', 'neutral'].forEach((move) => {
    const btn = document.createElement('button');
    btn.innerText = move;
    btn.onclick = () => submitMove(move);
    container.appendChild(btn);
  });
}

function submitMove(move) {
  const card = window.selectedCard;
  const value = card.stats[move];

  document.getElementById('game-container').innerHTML = `
    <h2>Waiting for opponent...</h2>
    <p>You chose <strong>${card.name}</strong> and used <strong>${move}</strong> (${value})</p>
  `;

  // In the future, we'll send this to the server
  // socket.emit('player-move', { card, move });
}

// Start the UI
renderCardSelection();